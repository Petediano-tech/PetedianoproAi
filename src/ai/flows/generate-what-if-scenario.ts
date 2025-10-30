
'use server';
/**
 * @fileOverview AI-powered "What-If" scenario generator.
 *
 * - generateWhatIfScenario - Generates alternative scenarios.
 * - GenerateWhatIfScenarioInput - Input type.
 * - GenerateWhatIfScenarioOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const ScenarioSchema = z.object({
  scenarioTitle: z.string().describe('A concise and intriguing title for this "what-if" scenario.'),
  scenarioDescription: z.string().describe('A detailed narrative exploring the plausible outcomes of this scenario, including key events and changes.'),
  keyConsequences: z.array(z.string()).describe('A list of 3-5 major direct or indirect consequences resulting from this scenario.'),
  likelihoodAssessment: z.string().optional().describe('A brief assessment of how plausible this scenario might be (e.g., "Highly plausible", "Possible but unlikely", "Purely speculative").'),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

const GenerateWhatIfScenarioInputSchema = z.object({
  baseSituation: z.string().describe('The initial event, historical context, or premise to explore (e.g., "What if dinosaurs never went extinct?", "The outcome of World War II if X happened differently").'),
  pointOfDivergence: z.string().optional().describe('The specific change or "what-if" question to introduce to the base situation (e.g., "A specific technology was invented earlier", "A key decision was made differently"). If not provided, the AI should infer a compelling divergence based on the base situation.'),
  numberOfVariations: z.number().min(1).max(3).default(1).optional().describe('The number of distinct "what-if" scenarios to generate (1 to 3).'),
  customInstructions: z.string().optional().describe('Any other specific instructions or focus areas for the scenario generation.'),
});
export type GenerateWhatIfScenarioInput = z.infer<typeof GenerateWhatIfScenarioInputSchema>;

const GenerateWhatIfScenarioOutputSchema = z.object({
  originalPremiseRecap: z.string().describe('A brief recap of the base situation and point of divergence provided by the user.'),
  scenarios: z.array(ScenarioSchema).describe('An array of generated "what-if" scenarios.'),
});
export type GenerateWhatIfScenarioOutput = z.infer<typeof GenerateWhatIfScenarioOutputSchema>;

export async function generateWhatIfScenario(input: GenerateWhatIfScenarioInput): Promise<GenerateWhatIfScenarioOutput> {
  return generateWhatIfScenarioFlow(input);
}

const whatIfScenarioPrompt = ai.definePrompt({
  name: 'generateWhatIfScenarioPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: GenerateWhatIfScenarioInputSchema},
  output: {schema: GenerateWhatIfScenarioOutputSchema},
  prompt: `You are an expert historian, futurist, and speculative fiction writer.
Your task is to generate insightful and engaging "what-if" scenarios based on a given premise.

Base Situation/Premise: {{{baseSituation}}}
{{#if pointOfDivergence}}Point of Divergence: {{{pointOfDivergence}}}{{/if}}
Number of Scenario Variations to Generate: {{{numberOfVariations}}}
{{#if customInstructions}}Additional Instructions: {{{customInstructions}}}{{/if}}

First, provide an 'originalPremiseRecap' that briefly summarizes the user's base situation and the point of divergence (or the one you infer if not provided).

Then, for each of the requested 'numberOfVariations', generate a distinct 'Scenario' object with the following:
1.  scenarioTitle: A short, compelling title for this specific what-if outcome.
2.  scenarioDescription: A detailed narrative. Explore the chain of events, how things unfold differently, societal impacts, technological changes, cultural shifts, etc. Make it plausible within the context of the divergence.
3.  keyConsequences: List 3-5 major direct or indirect consequences of this scenario.
4.  likelihoodAssessment (optional): Briefly assess how plausible this outcome might be.

Ensure each scenario is distinct and explores different facets or possibilities arising from the point of divergence.
Structure your output strictly according to the 'GenerateWhatIfScenarioOutputSchema'.
`,
  config: {
    temperature: 0.9,
  },
});

const generateWhatIfScenarioFlow = ai.defineFlow(
  {
    name: 'generateWhatIfScenarioFlow',
    inputSchema: GenerateWhatIfScenarioInputSchema,
    outputSchema: GenerateWhatIfScenarioOutputSchema,
  },
  async (input) => {
    const {output} = await whatIfScenarioPrompt(input);
    return output!;
  }
);
