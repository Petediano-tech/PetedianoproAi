
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

const generateOriginalPicturesFlow = ai.defineFlow(
  {
    name: 'generateOriginalPicturesFlow',
    inputSchema: GenerateOriginalPicturesInputSchema,
    outputSchema: GenerateOriginalPicturesOutputSchema,
  },
  async input => {
    // Construct a more detailed prompt for the image generation model to encourage originality.
    let imagePrompt = `Generate a high-quality, original, and creative ${input.type}. `;
    imagePrompt += `The theme is: "${input.prompt}". `;
    if (input.aspectRatio) {
      imagePrompt += `The aspect ratio should be ${input.aspectRatio}. `;
    }
    if (input.text) {
      imagePrompt += `Incorporate the text "${input.text}" into the design.`;
      if (input.font) {
        imagePrompt += ` Use a font style similar to ${input.font}.`;
      }
    }
    imagePrompt += " Avoid clichés and generate a unique visual.";

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: imagePrompt,
    });
    if (!media || !media.url) {
        throw new Error('Image generation failed to return a valid response.');
    }
    return {imageUrl: media.url};
  }
);
