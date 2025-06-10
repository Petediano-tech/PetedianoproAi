
'use server';
/**
 * @fileOverview AI-powered character persona generator.
 *
 * - generateCharacterPersona - Generates a detailed character persona.
 * - GenerateCharacterPersonaInput - Input type.
 * - GenerateCharacterPersonaOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterPersonaInputSchema = z.object({
  archetype: z.string().describe('The core archetype or role of the character (e.g., "Brave Knight", "Curious Scientist", "Reluctant Hero").'),
  keyTraits: z.string().optional().describe('Comma-separated key personality traits or skills (e.g., "Witty, Resourceful, Impatient").'),
  setting: z.string().optional().describe('The genre, time period, or world setting for the character (e.g., "Medieval Fantasy", "Cyberpunk Future", "Victorian London").'),
  customPrompt: z.string().optional().describe('Any additional specific details or requests for the character generation.')
});
export type GenerateCharacterPersonaInput = z.infer<typeof GenerateCharacterPersonaInputSchema>;

const GenerateCharacterPersonaOutputSchema = z.object({
  nameSuggestion: z.string().describe('A suitable name for the character.'),
  appearance: z.string().describe('A detailed description of the character\'s physical appearance, clothing, and notable features.'),
  backstory: z.string().describe('A compelling backstory outlining key life events and influences.'),
  motivations: z.array(z.string()).describe('A list of primary motivations or goals driving the character.'),
  flaws: z.array(z.string()).describe('A list of significant flaws or weaknesses the character possesses.'),
  personalitySummary: z.string().describe('A summary of the character\'s overall personality and demeanor.'),
  quirks: z.array(z.string()).optional().describe('Unique habits, mannerisms, or quirks of the character.'),
});
export type GenerateCharacterPersonaOutput = z.infer<typeof GenerateCharacterPersonaOutputSchema>;

export async function generateCharacterPersona(input: GenerateCharacterPersonaInput): Promise<GenerateCharacterPersonaOutput> {
  return generateCharacterPersonaFlow(input);
}

const characterPersonaPrompt = ai.definePrompt({
  name: 'generateCharacterPersonaPrompt',
  input: {schema: GenerateCharacterPersonaInputSchema},
  output: {schema: GenerateCharacterPersonaOutputSchema},
  prompt: `You are an expert character creator and storyteller.
Based on the user's input, generate a detailed and engaging character persona.

Character Archetype/Role: {{{archetype}}}
{{#if keyTraits}}Key Traits/Skills: {{{keyTraits}}}{{/if}}
{{#if setting}}Setting/Genre: {{{setting}}}{{/if}}
{{#if customPrompt}}Additional Instructions: {{{customPrompt}}}{{/if}}

Please generate the following for the character:
1.  Name Suggestion: A fitting name.
2.  Appearance: Detailed physical description, clothing, and any unique features.
3.  Backstory: A summary of their life, key events, and what shaped them.
4.  Motivations: 2-3 primary goals or driving forces.
5.  Flaws: 2-3 significant weaknesses or internal conflicts.
6.  Personality Summary: An overview of their demeanor and how they interact with the world.
7.  Quirks (Optional): 1-2 unique habits or mannerisms.

Ensure the persona is coherent and provides a strong foundation for storytelling or role-playing.
`,
});

const generateCharacterPersonaFlow = ai.defineFlow(
  {
    name: 'generateCharacterPersonaFlow',
    inputSchema: GenerateCharacterPersonaInputSchema,
    outputSchema: GenerateCharacterPersonaOutputSchema,
  },
  async (input) => {
    const {output} = await characterPersonaPrompt(input);
    return output!;
  }
);
