
'use server';
/**
 * @fileOverview An AI agent for creating video slideshows by combining text-to-speech and images.
 * This flow does NOT generate video files directly. It returns the components (audio, images)
 * for the client to assemble into a playable sequence.
 *
 * - generateVideoSlideshow - A function that handles the slideshow component generation.
 * - GenerateVideoSlideshowInput - The input type for the generateVideoSlideshow function.
 * - GenerateVideoSlideshowOutput - The return type for the generateVideoSlideshow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

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


// --- MAIN EXPORTED FUNCTION ---

/**
 * Generates images and audio for each slide in parallel.
 */
export async function generateVideoSlideshow(input: GenerateVideoSlideshowInput): Promise<GenerateVideoSlideshowOutput> {
  const slidePromises = input.slides.map(async (slide) => {
    try {
      // Generate image and audio simultaneously
      const [imageResult, audioResult] = await Promise.all([
        generateImageForSlide(slide.imageDescription),
        generateAudioForSlide(slide.text)
      ]);

      return {
        text: slide.text,
        imageUrl: imageResult.imageUrl,
        audioUrl: audioResult.audioUrl,
      };
    } catch (error) {
      console.error(`Failed to process slide: "${slide.text.substring(0, 30)}...". Skipping. Error:`, error);
      // Return a slide with placeholders on error
      return {
        text: `[Error generating content for this slide: ${slide.text.substring(0, 30)}...]`,
        imageUrl: "https://placehold.co/1280x720.png",
        audioUrl: "", // No audio on error
      };
    }
  });
  
  const generatedSlides = await Promise.all(slidePromises);

  return {
    title: input.title,
    slides: generatedSlides.filter(s => s) // Filter out any null results from errors
  };
}


// --- HELPER AI FUNCTIONS ---

/**
 * Generates a single image for a slide.
 */
async function generateImageForSlide(imageDescription: string): Promise<{ imageUrl: string }> {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a visually compelling, cinematic image for a video slideshow. The scene is: "${imageDescription}". Aspect ratio 16:9.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error("Image generation failed to return a valid URL.");
    }
    return {imageUrl: media.url};
}

/**
 * Generates a single audio clip for a slide.
 */
async function generateAudioForSlide(text: string): Promise<{ audioUrl: string }> {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } } },
      },
      prompt: text,
    });
    
    if (!media?.url) {
      throw new Error('Audio generation failed to return valid data.');
    }
    
    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(audioBuffer);
    
    return { audioUrl: 'data:audio/wav;base64,' + wavBase64 };
}


/**
 * Converts raw PCM audio data into a Base64-encoded WAV file string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}
