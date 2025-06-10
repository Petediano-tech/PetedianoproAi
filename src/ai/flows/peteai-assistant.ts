'use server';

/**
 * @fileOverview AI-powered assistant that provides suggestions using a tool connected to Gemini.
 *
 * - peteAiAssistant - A function that handles the AI assistant process.
 * - PeteAiAssistantInput - The input type for the peteAiAssistant function.
 * - PeteAiAssistantOutput - The return type for the peteAiAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PeteAiAssistantInputSchema = z.object({
  query: z.string().describe('The query or request from the user.'),
});
export type PeteAiAssistantInput = z.infer<typeof PeteAiAssistantInputSchema>;

const PeteAiAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant.'),
});
export type PeteAiAssistantOutput = z.infer<typeof PeteAiAssistantOutputSchema>;

export async function peteAiAssistant(input: PeteAiAssistantInput): Promise<PeteAiAssistantOutput> {
  return peteAiAssistantFlow(input);
}

const peteAiAssistantPrompt = ai.definePrompt({
  name: 'peteAiAssistantPrompt',
  input: {schema: PeteAiAssistantInputSchema},
  output: {schema: PeteAiAssistantOutputSchema},
  prompt: `You are PeteAi assistant, an AI-powered assistant designed to help users with various tasks.
  Your responses should be helpful, informative, and tailored to the user's query.
  Here is the user's query: {{{query}}}`,
});

const peteAiAssistantFlow = ai.defineFlow(
  {
    name: 'peteAiAssistantFlow',
    inputSchema: PeteAiAssistantInputSchema,
    outputSchema: PeteAiAssistantOutputSchema,
  },
  async input => {
    const {output} = await peteAiAssistantPrompt(input);
    return output!;
  }
);
