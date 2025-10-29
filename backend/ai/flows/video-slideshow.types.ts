
import {z} from 'genkit';

// --- SCHEMAS AND TYPES ---

const SlideInputSchema = z.object({
  text: z.string().describe('The voiceover script for this slide.'),
  imageDescription: z.string().describe('A description of the image for this slide.'),
});

export const GenerateVideoSlideshowInputSchema = z.object({
  title: z.string().describe('The title of the video.'),
  slides: z.array(SlideInputSchema).describe('An array of slides, each with text for voiceover and an image description.'),
});
export type GenerateVideoSlideshowInput = z.infer<typeof GenerateVideoSlideshowInputSchema>;


const SlideOutputSchema = z.object({
  text: z.string(),
  imageUrl: z.string().describe('The URL of the generated image for this slide (data URI).'),
  audioUrl: z.string().describe('The URL of the generated audio for this slide (data URI).'),
});

export const GenerateVideoSlideshowOutputSchema = z.object({
  title: z.string(),
  slides: z.array(SlideOutputSchema),
});
export type GenerateVideoSlideshowOutput = z.infer<typeof GenerateVideoSlideshowOutputSchema>;
