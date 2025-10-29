
'use server';
/**
 * @fileOverview An AI agent for generating music and sound effects from a text prompt.
 *
 * - generateMusic - A function that handles the music generation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import { GenerateMusicInputSchema, GenerateMusicOutputSchema, type GenerateMusicInput, type GenerateMusicOutput } from './music.types';


// --- AI PROMPT & FLOW ---

const generateMusicFlow = ai.defineFlow(
  {
    name: 'generateMusicFlow',
    inputSchema: GenerateMusicInputSchema,
    outputSchema: GenerateMusicOutputSchema,
  },
  async ({ prompt }) => {
    // Note: This uses a TTS model as a stand-in for a true text-to-music model.
    // The prompt is passed directly, and the model will attempt to "speak" it,
    // which can sometimes produce interesting sound effects or rhythmic speech.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: prompt,
    });
    
    if (!media || !media.url) {
      throw new Error('Audio generation failed to return a valid response.');
    }
    
    // Convert the raw PCM audio data to WAV format for browser compatibility.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);
    
    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);


// --- EXPORTED MAIN FUNCTION ---

export async function generateMusic(input: GenerateMusicInput): Promise<GenerateMusicOutput> {
  return generateMusicFlow(input);
}


// --- HELPER FUNCTIONS ---

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
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
