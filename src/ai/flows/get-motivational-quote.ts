
'use server';

/**
 * @fileOverview A motivational quote generator AI agent.
 *
 * - getMotivationalQuote - A function that handles the motivational quote generation process.
 * - GetMotivationalQuoteInput - The input type for the getMotivationalQuote function.
 * - GetMotivationalQuoteOutput - The return type for the getMotivationalQuote function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const GetMotivationalQuoteInputSchema = z.object({
  textOnly: z
    .boolean()
    .default(false)
    .describe(
      'Whether to generate the quote as text only, or on an original picture.'
    ),
  topic: z.string().optional().describe('The topic of the motivational quote.'),
});
export type GetMotivationalQuoteInput = z.infer<
  typeof GetMotivationalQuoteInputSchema
>;

const GetMotivationalQuoteOutputSchema = z.object({
  quote: z.string().describe('The generated motivational quote.'),
  imageUrl: z.string().optional().describe('The URL of the generated image, if any.'),
});
export type GetMotivationalQuoteOutput = z.infer<
  typeof GetMotivationalQuoteOutputSchema
>;

export async function getMotivationalQuote(
  input: GetMotivationalQuoteInput
): Promise<GetMotivationalQuoteOutput> {
  return getMotivationalQuoteFlow(input);
}

const quotePrompt = ai.definePrompt({
  name: 'quotePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: GetMotivationalQuoteInputSchema},
  output: {schema: z.object({ quote: z.string() })},
  prompt: `You are a motivational quote generator. Generate an original motivational quote. The topic of the quote should be related to {{topic}}.

  Quote:`,
  config: {
    temperature: 1.0,
  },
});

const getMotivationalQuoteFlow = ai.defineFlow(
  {
    name: 'getMotivationalQuoteFlow',
    inputSchema: GetMotivationalQuoteInputSchema,
    outputSchema: GetMotivationalQuoteOutputSchema,
  },
  async input => {
    const {output} = await quotePrompt(input);

    if (input.textOnly) {
      // If textOnly is true, return the quote without generating an image.
      return {quote: output!.quote};
    } else {
      // If textOnly is false, generate an image with the quote.
      const {media} = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: `Generate an image with the following motivational quote on a beautiful, artistic background: "${output!.quote}"`,
      });
      if (!media || !media.url) {
        throw new Error('Image generation failed to return valid data.');
      }
      return {quote: output!.quote, imageUrl: media.url};
    }
  }
);
