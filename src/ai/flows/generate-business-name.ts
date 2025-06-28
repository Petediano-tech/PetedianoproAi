
'use server';
/**
 * @fileOverview AI-powered business name generator.
 *
 * - generateBusinessName - Generates creative business names and taglines.
 * - GenerateBusinessNameInput - Input type.
 * - GenerateBusinessNameOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBusinessNameInputSchema = z.object({
  industry: z.string().describe('The industry of the business (e.g., "coffee shop", "tech startup").'),
  keywords: z.string().optional().describe('Comma-separated keywords to inspire the name (e.g., "organic, community, modern").'),
  style: z.enum(['Modern', 'Classic', 'Playful', 'Elegant', 'Minimalist']).describe('The desired style or vibe of the name.'),
});
export type GenerateBusinessNameInput = z.infer<typeof GenerateBusinessNameInputSchema>;

const NameSuggestionSchema = z.object({
  name: z.string().describe('A creative and unique business name.'),
  tagline: z.string().describe('A catchy tagline or slogan for the business name.'),
});

const GenerateBusinessNameOutputSchema = z.object({
  suggestions: z.array(NameSuggestionSchema).describe('A list of 5-10 business name suggestions with corresponding taglines.'),
});
export type GenerateBusinessNameOutput = z.infer<typeof GenerateBusinessNameOutputSchema>;

export async function generateBusinessName(input: GenerateBusinessNameInput): Promise<GenerateBusinessNameOutput> {
  return generateBusinessNameFlow(input);
}

const businessNamePrompt = ai.definePrompt({
  name: 'generateBusinessNamePrompt',
  input: {schema: GenerateBusinessNameInputSchema},
  output: {schema: GenerateBusinessNameOutputSchema},
  prompt: `You are a branding expert specializing in creating unique and memorable business names.
Based on the user's requirements, generate a list of 5-10 creative business names and an accompanying tagline for each.

Industry: {{{industry}}}
Style: {{{style}}}
{{#if keywords}}Keywords: {{{keywords}}}{{/if}}

Ensure the names are original, catchy, and relevant to the industry and style.
The tagline should be short, compelling, and capture the essence of the brand.
`,
  config: {
    temperature: 0.9,
  },
});

const generateBusinessNameFlow = ai.defineFlow(
  {
    name: 'generateBusinessNameFlow',
    inputSchema: GenerateBusinessNameInputSchema,
    outputSchema: GenerateBusinessNameOutputSchema,
  },
  async (input) => {
    const {output} = await businessNamePrompt(input);
    return output!;
  }
);
