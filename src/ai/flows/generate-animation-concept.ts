
'use server';
/**
 * @fileOverview An AI agent for generating anime-style stories in discrete steps: text, then images, then audio.
 *
 * - generateAnimationConceptText - Generates the story title and text for each scene.
 * - generateImageForAnimationScene - Generates an image for a single scene.
 * - generateAudioForAnimationScene - Generates audio narration for a single scene.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

// --- SCHEMAS AND TYPES ---

const animeStyles = ['Vibrant Shonen', 'Elegant Shojo', 'Chibi/Kawaii', 'Classic 90s', 'Dark Fantasy', 'Cyberpunk', 'Studio Ghibli-esque'] as const;
const availableVoices = {
  'achernar': 'Achernar', 'algenib': 'Algenib', 'gacrux': 'Gacrux', 'rasalgethi': 'Rasalgethi', 'schedar': 'Schedar', 'sulafat': 'Sulafat', 'zubenelgenubi': 'Zubenelgenubi', 'charon': 'Charon', 'puck': 'Puck',
  'aoede': 'Aoede', 'leda': 'Leda', 'callirrhoe': 'Callirrhoe', 'autonoe': 'Autonoe', 'erinome': 'Erinome', 'kore': 'Kore'
} as const;
const voiceEnum = z.enum(Object.keys(availableVoices) as [keyof typeof availableVoices, ...(keyof typeof availableVoices)[]]);

// Input for the initial text generation
export const GenerateAnimationConceptTextInputSchema = z.object({
  prompt: z.string().describe('The main idea or scene for the story.'),
  style: z.enum(animeStyles).default('Vibrant Shonen').describe('The desired anime art style (will be used later for image generation).'),
  language: z.string().optional().default('English').describe('The language for the story text and narration.'),
});
export type GenerateAnimationConceptTextInput = z.infer<typeof GenerateAnimationConceptTextInputSchema>;

// The output structure for the text generation step
const StoryPageTextSchema = z.object({
  text: z.string().describe('The narrative text for this scene.'),
  sceneDescription: z.string().describe('The original, brief scene description this text was based on.'),
});
export const GenerateAnimationConceptTextOutputSchema = z.object({
  title: z.string().describe('A catchy title for the story.'),
  pages: z.array(StoryPageTextSchema),
});
export type GenerateAnimationConceptTextOutput = z.infer<typeof GenerateAnimationConceptTextOutputSchema>;

// Schemas for on-demand image and audio generation
export const GenerateImageForSceneInputSchema = z.object({
  sceneDescription: z.string().describe('The brief description for the scene to be visualized.'),
  style: z.enum(animeStyles).describe('The desired anime art style.'),
});
export type GenerateImageForSceneInput = z.infer<typeof GenerateImageForSceneInputSchema>;
export const GenerateImageForSceneOutputSchema = z.object({ imageUrl: z.string() });
export type GenerateImageForSceneOutput = z.infer<typeof GenerateImageForSceneOutputSchema>;

export const GenerateAudioForSceneInputSchema = z.object({
  text: z.string().describe('The narrative text to be converted to speech.'),
  voice: voiceEnum.describe('The desired voice for the narration.'),
});
export type GenerateAudioForSceneInput = z.infer<typeof GenerateAudioForSceneInputSchema>;
export const GenerateAudioForSceneOutputSchema = z.object({ audioUrl: z.string() });
export type GenerateAudioForSceneOutput = z.infer<typeof GenerateAudioForSceneOutputSchema>;


// --- AI PROMPTS ---

// 1. Prompt to generate the story outline (title and scene descriptions)
const storyOutlinePrompt = ai.definePrompt({
  name: 'animeStoryOutlinePrompt',
  input: { schema: GenerateAnimationConceptTextInputSchema },
  output: {
    schema: z.object({
      title: z.string().describe('A compelling and creative title for the story based on the prompt.'),
      sceneDescriptions: z.array(z.string()).describe('A list of 3 to 5 brief descriptions for consecutive scenes that will form the story.'),
    }),
  },
  prompt: `You are a creative anime storyteller. Based on the user's prompt, generate a title and a list of 3-5 scene descriptions that form a short story.

Story Prompt: {{{prompt}}}
Language: {{{language}}}

Generate a title and scene descriptions in the specified language.
`,
  config: { temperature: 0.9 },
});

// 2. Prompt to write the narrative text for a given scene.
const storyPageTextPrompt = ai.definePrompt({
    name: 'animeStoryPageTextPrompt',
    input: { schema: z.object({ sceneDescription: z.string(), language: z.string().optional() }) },
    output: { schema: z.object({ pageText: z.string().describe('A paragraph of narrative text (about 50-100 words) describing the scene in an engaging way.') }) },
    prompt: `You are an anime scriptwriter. Write an engaging paragraph of story text for the following scene description in the language: "{{{language}}}".

Scene Description: "{{{sceneDescription}}}"`,
    config: { temperature: 0.9 },
});


// --- EXPORTED FUNCTIONS / FLOWS ---

/**
 * Generates the text content (title and pages) for an anime-style story.
 */
export async function generateAnimationConceptText(input: GenerateAnimationConceptTextInput): Promise<GenerateAnimationConceptTextOutput> {
  // Step 1: Generate the story outline (title and scene descriptions).
  const outlineResult = await storyOutlinePrompt(input);
  if (!outlineResult?.output?.sceneDescriptions?.length) {
    console.error("The AI failed to generate a valid story outline.");
    return { title: "Story Generation Failed", pages: [] };
  }
  const { title, sceneDescriptions } = outlineResult.output;

  // Step 2: Generate the narrative text for each scene description.
  const pages = await Promise.all(
    sceneDescriptions.map(async (scene) => {
      const pageTextResult = await storyPageTextPrompt({ sceneDescription: scene, language: input.language });
      return {
        text: pageTextResult?.output?.pageText || `Failed to generate text for: "${scene}"`,
        sceneDescription: scene, // Pass the original description through
      };
    })
  );

  return { title, pages };
}

/**
 * Generates an image for a single anime scene.
 */
export async function generateImageForAnimationScene(input: GenerateImageForSceneInput): Promise<GenerateImageForSceneOutput> {
  const imagePrompt = `Generate a single, high-quality image in a ${input.style} anime style. The scene is: "${input.sceneDescription}". The image should be dynamic and expressive, capturing the essence of the scene.`;
  
  const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: imagePrompt,
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  if (!media?.url) {
    throw new Error('Image generation failed to return a valid URL.');
  }
  return { imageUrl: media.url };
}

/**
 * Generates audio narration for a single piece of text.
 */
export async function generateAudioForAnimationScene(input: GenerateAudioForSceneInput): Promise<GenerateAudioForSceneOutput> {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      prompt: input.text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: input.voice as any },
          },
        },
      },
    });

    if (!media?.url) {
        throw new Error('Audio generation failed to return valid data.');
    }
        
    const pcmAudioData = media.url;
    const audioBuffer = Buffer.from(
      pcmAudioData.substring(pcmAudioData.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const audioUrl = `data:audio/wav;base64,${wavBase64}`;

    return { audioUrl };
}


// --- HELPERS ---

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
    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}
