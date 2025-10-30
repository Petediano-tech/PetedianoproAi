
'use server';
/**
 * @fileOverview AI-powered image caption generator.
 *
 * - generateImageCaption - Generates captions and hashtags for an image.
 * - GenerateImageCaptionInput - Input type.
 * - GenerateImageCaptionOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const GenerateImageCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be captioned, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  tone: z.enum(['Witty', 'Inspirational', 'Descriptive', 'Casual', 'Mysterious', 'Humorous']).describe('The desired tone for the captions.'),
});
export type GenerateImageCaptionInput = z.infer<typeof GenerateImageCaptionInputSchema>;

const GenerateImageCaptionOutputSchema = z.object({
  captions: z.array(z.string()).describe('A list of 3-5 creative caption suggestions for the image.'),
  hashtags: z.array(z.string()).describe('A list of 5-10 relevant hashtags, without the "#" symbol.'),
});
export type GenerateImageCaptionOutput = z.infer<typeof GenerateImageCaptionOutputSchema>;

export async function generateImageCaption(input: GenerateImageCaptionInput): Promise<GenerateImageCaptionOutput> {
  return generateImageCaptionFlow(input);
}

const imageCaptionPrompt = ai.definePrompt({
  name: 'generateImageCaptionPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: GenerateImageCaptionInputSchema},
  output: {schema: GenerateImageCaptionOutputSchema},
  prompt: `You are a social media expert. Analyze the following image and generate creative captions and relevant hashtags.

Image to analyze: {{media url=photoDataUri}}
Desired Tone: {{{tone}}}

Based on the image and desired tone, provide:
1.  A list of 3-5 distinct and engaging 'captions'.
2.  A list of 5-10 relevant 'hashtags' to increase reach. Do not include the '#' symbol in the output.
`,
  config: {
    temperature: 0.9,
  },
});

const generateImageCaptionFlow = ai.defineFlow(
  {
    name: 'generateImageCaptionFlow',
    inputSchema: GenerateImageCaptionInputSchema,
    outputSchema: GenerateImageCaptionOutputSchema,
  },
  async (input) => {
    const {output} = await imageCaptionPrompt(input);
    return output!;
  }
);
