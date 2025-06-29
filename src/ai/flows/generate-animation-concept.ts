
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
import {
    GenerateAnimationConceptTextInput,
    GenerateAnimationConceptTextInputSchema,
    GenerateAnimationConceptTextOutput,
    GenerateImageForSceneInput,
    GenerateImageForSceneInputSchema,
    GenerateImageForSceneOutput,
    GenerateAudioForSceneInput,
    GenerateAudioForSceneInputSchema,
    GenerateAudioForSceneOutput,
} from './animation-concept.types';


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
        try {
            const pageTextResult = await storyPageTextPrompt({ sceneDescription: scene, language: input.language });
            return {
                text: pageTextResult?.output?.pageText || `Failed to generate text for: "${scene}"`,
                sceneDescription: scene, // Pass the original description through
            };
        } catch (error) {
            console.error(`Failed to process page for scene: "${scene}". Skipping. Error:`, error);
            return {
                text: `[Error generating content for this scene: ${scene}]`,
                sceneDescription: "An error occurred here."
            };
        }
    })
  );

  return { title, pages: pages.filter(p => p) };
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
