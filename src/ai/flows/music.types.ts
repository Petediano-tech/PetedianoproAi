
import {z} from 'genkit';

// --- SCHEMAS AND TYPES ---

export const GenerateMusicInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the music or sound effect to generate (e.g., "upbeat electronic music for a YouTube intro", "a sad piano melody", "sound of a laser blast").'),
});
export type GenerateMusicInput = z.infer<typeof GenerateMusicInputSchema>;

export const GenerateMusicOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio, as a data URI with MIME type and Base64 encoding.'),
});
export type GenerateMusicOutput = z.infer<typeof GenerateMusicOutputSchema>;
