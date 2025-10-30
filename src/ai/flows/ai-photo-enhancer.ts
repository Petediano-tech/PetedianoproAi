
'use server';
/**
 * @fileOverview AI-powered photo enhancement flow.
 *
 * - aiPhotoEnhancer - A function that enhances the provided photo using AI.
 * - AiPhotoEnhancerInput - The input type for the aiPhotoEnhancer function.
 * - AiPhotoEnhancerOutput - The return type for the aiPhotoEnhancer function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const AiPhotoEnhancerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be enhanced, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiPhotoEnhancerInput = z.infer<typeof AiPhotoEnhancerInputSchema>;

const AiPhotoEnhancerOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe(
      'The enhanced photo, as a data URI with MIME type and Base64 encoding.'
    ),
  enhancementDetails: z.string().describe('Details about the enhancements applied.'),
});
export type AiPhotoEnhancerOutput = z.infer<typeof AiPhotoEnhancerOutputSchema>;

export async function aiPhotoEnhancer(input: AiPhotoEnhancerInput): Promise<AiPhotoEnhancerOutput> {
  return aiPhotoEnhancerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPhotoEnhancerPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: AiPhotoEnhancerInputSchema},
  output: {schema: AiPhotoEnhancerOutputSchema},
  prompt: `You are a professional photo enhancer. You will take a photo and enhance it automatically by adjusting brightness, contrast, blur, texture, color grading, blend, PIP, and overlay.

  Return the enhanced photo as a data URI with MIME type and Base64 encoding, and provide details about the enhancements applied.

  Photo: {{media url=photoDataUri}}
  `,
});

const aiPhotoEnhancerFlow = ai.defineFlow(
  {
    name: 'aiPhotoEnhancerFlow',
    inputSchema: AiPhotoEnhancerInputSchema,
    outputSchema: AiPhotoEnhancerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
