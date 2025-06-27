
'use server';
/**
 * @fileOverview An AI agent for generating stories in an anime style, complete with images and audio.
 *
 * - generateAnimationConcept - Generates an anime-style story with pictures and audio.
 * - GenerateAnimationConceptInput - Input type.
 * - GenerateAnimationConceptOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

const animeStyles = ['Vibrant Shonen', 'Elegant Shojo', 'Chibi/Kawaii', 'Classic 90s', 'Dark Fantasy', 'Cyberpunk', 'Studio Ghibli-esque'] as const;
const availableVoices = {
  // Male Voices
  'achernar': 'Achernar',
  'algenib': 'Algenib',
  'gacrux': 'Gacrux',
  'rasalgethi': 'Rasalgethi',
  'schedar': 'Schedar',
  'sulafat': 'Sulafat',
  'zubenelgenubi': 'Zubenelgenubi',
  'charon': 'Charon',
  // Female Voices
  'aoede': 'Aoede',
  'leda': 'Leda',
} as const;
const voiceEnum = z.enum(Object.keys(availableVoices) as [keyof typeof availableVoices, ...(keyof typeof availableVoices)[]]);

const GenerateAnimationConceptInputSchema = z.object({
  prompt: z.string().describe('The main idea or scene for the story (e.g., "a cat who discovers a magical sword", "a detective solving a case in a cyberpunk city").'),
  style: z.enum(animeStyles).default('Vibrant Shonen').describe('The desired anime art style for the generated images.'),
  voice: voiceEnum.default('achernar').describe('The desired voice for the audio narration.'),
  language: z.string().optional().default('English').describe('The language for the story text and narration (e.g., English, Chichewa).'),
});
export type GenerateAnimationConceptInput = z.infer<typeof GenerateAnimationConceptInputSchema>;

const StoryPageSchema = z.object({
  text: z.string().describe('The text content of this part of the story.'),
  imageUrl: z.string().describe('Data URI of the generated image for this page.'),
  audioUrl: z.string().describe('Data URI of the generated audio narration for this page.'),
});

const GenerateAnimationConceptOutputSchema = z.object({
  title: z.string().describe('A catchy title for the story.'),
  pages: z.array(StoryPageSchema).describe('A sequence of pages, each with text, a generated image, and generated audio.'),
});
export type GenerateAnimationConceptOutput = z.infer<typeof GenerateAnimationConceptOutputSchema>;

export async function generateAnimationConcept(input: GenerateAnimationConceptInput): Promise<GenerateAnimationConceptOutput> {
  return generateAnimeStoryFlow(input);
}

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

// 1. A prompt to generate the story outline (title and scenes)
const storyOutlinePrompt = ai.definePrompt({
  name: 'animeStoryOutlinePrompt',
  input: { schema: GenerateAnimationConceptInputSchema },
  output: {
    schema: z.object({
      title: z.string().describe('A compelling and creative title for the story based on the prompt.'),
      sceneDescriptions: z.array(z.string()).describe('A list of 3 to 5 brief descriptions for consecutive scenes that will form the story. Each description should capture a moment or action.'),
    }),
  },
  prompt: `You are a creative anime storyteller. Based on the user's prompt, generate a title and a list of 3-5 scene descriptions that form a short story.

Story Prompt: {{{prompt}}}
Language: {{{language}}}

Generate a title and scene descriptions in the specified language.
`,
  config: {
    temperature: 0.9,
  },
});

// 2. A prompt to generate the image for a given scene.
function createImagePrompt(scene: string, style: string) {
    return `Generate a single, high-quality image in a ${style} anime style. The scene is: "${scene}". The image should be dynamic and expressive, capturing the essence of the scene.`;
}

// 3. A prompt to write the narrative text for a given scene.
const storyPageTextPrompt = ai.definePrompt({
    name: 'animeStoryPageTextPrompt',
    input: { schema: z.object({ sceneDescription: z.string(), language: z.string().optional() }) },
    output: { schema: z.object({ pageText: z.string().describe('A paragraph of narrative text (about 50-100 words) describing the scene in an engaging way.') }) },
    prompt: `You are an anime scriptwriter. Write an engaging paragraph of story text for the following scene description in the language: "{{{language}}}".

Scene Description: "{{{sceneDescription}}}"`,
    config: {
        temperature: 0.9,
    },
});


// 4. The main flow that ties it all together
const generateAnimeStoryFlow = ai.defineFlow(
  {
    name: 'generateAnimeStoryFlow',
    inputSchema: GenerateAnimationConceptInputSchema,
    outputSchema: GenerateAnimationConceptOutputSchema,
  },
  async (input) => {
    // 1. Generate the story outline
    const outlineResult = await storyOutlinePrompt(input);
    if (!outlineResult.output) {
      throw new Error("Failed to generate a valid story outline from the AI.");
    }
    const { title, sceneDescriptions } = outlineResult.output;

    const finalPages: z.infer<typeof StoryPageSchema>[] = [];

    // 2. For each scene, generate text, image, and audio within a try/catch block for resilience.
    for (const scene of sceneDescriptions) {
      try {
        const pageTextResult = await storyPageTextPrompt({ sceneDescription: scene, language: input.language });
        const text = pageTextResult.output?.pageText;

        if (!text) {
            console.warn(`Skipping scene due to empty text generation: "${scene}"`);
            continue;
        }

        const [imageGenerationResult, audioGenerationResult] = await Promise.all([
          // Image generation
          ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: createImagePrompt(scene, input.style),
            config: {
              responseModalities: ['IMAGE', 'TEXT'],
            },
          }),
          // Audio generation
          ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            prompt: text,
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: input.voice as any },
                },
              },
            },
          }),
        ]);
        
        const imageUrl = imageGenerationResult.media?.url;
        const pcmAudioData = audioGenerationResult.media?.url;
        
        if (!imageUrl || !pcmAudioData) {
            console.warn(`Skipping scene due to missing media for: "${scene}"`);
            continue;
        }
        
        const audioBuffer = Buffer.from(
          pcmAudioData.substring(pcmAudioData.indexOf(',') + 1),
          'base64'
        );
        const wavBase64 = await toWav(audioBuffer);
        const audioUrl = `data:audio/wav;base64,${wavBase64}`;

        finalPages.push({
          text,
          imageUrl,
          audioUrl,
        });

      } catch (error) {
        console.error(`Failed to process page for scene: "${scene}". Skipping. Error:`, error);
        // Continue to the next scene even if one fails
      }
    }

    return {
      title,
      pages: finalPages,
    };
  }
);
