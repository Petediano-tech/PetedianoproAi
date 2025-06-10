'use server';

/**
 * @fileOverview A flow for generating original pictures, wallpapers, logos, flyers, collages, and social media posts using AI. Includes options for custom text and aspect ratio.
 *
 * - generateOriginalPictures - A function that handles the picture generation process.
 * - GenerateOriginalPicturesInput - The input type for the generateOriginalPictures function.
 * - GenerateOriginalPicturesOutput - The return type for the generateOriginalPictures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOriginalPicturesInputSchema = z.object({
  type: z.enum(['picture', 'wallpaper', 'logo', 'flyer', 'collage', 'social media post']).describe('The type of image to generate.'),
  text: z.string().optional().describe('Optional text to add to the image.'),
  font: z.string().optional().describe('The font to use for the text.'),
  aspectRatio: z.string().optional().describe('The aspect ratio of the image (e.g., 16:9, 1:1, 4:5).'),
  prompt: z.string().describe('A detailed description of the image to generate.'),
});

export type GenerateOriginalPicturesInput = z.infer<typeof GenerateOriginalPicturesInputSchema>;

const GenerateOriginalPicturesOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image (data URI).'),
});

export type GenerateOriginalPicturesOutput = z.infer<typeof GenerateOriginalPicturesOutputSchema>;

export async function generateOriginalPictures(input: GenerateOriginalPicturesInput): Promise<GenerateOriginalPicturesOutput> {
  return generateOriginalPicturesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOriginalPicturesPrompt',
  input: {schema: GenerateOriginalPicturesInputSchema},
  output: {schema: GenerateOriginalPicturesOutputSchema},
  prompt: `Generate an original {{{type}}} with the following description: {{{prompt}}}.

  {{#if text}}
  Add the following text to the image: {{{text}}}. Use the font {{{font}}}.
  {{/if}}

  {{#if aspectRatio}}
  Use the following aspect ratio: {{{aspectRatio}}}.
  {{/if}}
  
  Ensure the generated image is of high quality and suitable for its intended purpose.
  Return the image as a data URI.
  `,
});

const generateOriginalPicturesFlow = ai.defineFlow(
  {
    name: 'generateOriginalPicturesFlow',
    inputSchema: GenerateOriginalPicturesInputSchema,
    outputSchema: GenerateOriginalPicturesOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        input.prompt,
        ...(input.text ? [{text: `Add the following text using ${input.font} font: ${input.text}`}] : []),
        ...(input.aspectRatio ? [{text: `Use the following aspect ratio: ${input.aspectRatio}`}] : []),
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {imageUrl: media.url!};
  }
);
