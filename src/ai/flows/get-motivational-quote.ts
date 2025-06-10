'use server';

/**
 * @fileOverview A motivational quote generator AI agent.
 *
 * - getMotivationalQuote - A function that handles the motivational quote generation process.
 * - GetMotivationalQuoteInput - The input type for the getMotivationalQuote function.
 * - GetMotivationalQuoteOutput - The return type for the getMotivationalQuote function.
 */

import {ai} from '@/ai/genkit';
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
  input: {schema: GetMotivationalQuoteInputSchema},
  output: {schema: GetMotivationalQuoteOutputSchema},
  prompt: `You are a motivational quote generator. Generate an original motivational quote.  The topic of the quote should be related to {{topic}}.

  Quote:`, // Keep as one line.
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
        // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images. You MUST use exactly this model to generate images.
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: [
          {
            text: `Generate an image with the following motivational quote: ${output!.quote}`,
          },
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        },
      });

      return {quote: output!.quote, imageUrl: media.url};
    }
  }
);
