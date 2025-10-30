
'use server';
/**
 * @fileOverview AI-powered code explainer.
 *
 * - explainCode - Explains a snippet of code.
 * - ExplainCodeInput - Input type.
 * - ExplainCodeOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const LineExplanationSchema = z.object({
  line: z.string().describe('The line number(s) this explanation refers to (e.g., "1", "3-5").'),
  explanation: z.string().describe('A clear, simple explanation of what this line or block of code does.'),
});

const ExplainCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The block of code to be explained.'),
  language: z.string().describe('The programming language of the code snippet (e.g., "JavaScript", "Python").'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of what the entire code snippet does.'),
  lineByLineExplanation: z.array(LineExplanationSchema).describe('A detailed, line-by-line explanation of the code.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const explainCodePrompt = ai.definePrompt({
  name: 'explainCodePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: ExplainCodeInputSchema},
  output: {schema: ExplainCodeOutputSchema},
  prompt: `You are an expert programmer and teacher. Your task is to explain a code snippet in simple, easy-to-understand terms.

Programming Language: {{{language}}}

Code Snippet:
\`\`\`
{{{codeSnippet}}}
\`\`\`

Please provide:
1.  A concise 'summary' of the code's overall purpose and functionality.
2.  A 'lineByLineExplanation' which is an array of objects. For each object, provide the 'line' number (or range) and a clear 'explanation' of what that specific part of the code does. Group related lines (like a loop or if-statement block) together.
`,
  config: {
    temperature: 0.2, // Lower temperature for more deterministic, factual explanations
  },
});

const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async (input) => {
    const {output} = await explainCodePrompt(input);
    return output!;
  }
);
