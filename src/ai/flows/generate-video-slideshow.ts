
'use server';
/**
 * @fileOverview An AI agent for creating video slideshows by combining text-to-speech and images.
 * This flow does NOT generate video files directly. It returns the components (audio, images)
 * for the client to assemble into a playable sequence.
 *
 * - generateVideoSlideshow - A function that handles the slideshow component generation.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import wav from 'wav';
import { GenerateVideoSlideshowInputSchema, GenerateVideoSlideshowOutputSchema, type GenerateVideoSlideshowInput, type GenerateVideoSlideshowOutput } from './video-slideshow.types';

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
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: `Generate a visually compelling, cinematic image for a video slideshow. The scene is: "${imageDescription}". Aspect ratio 16:9.`,
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
