
'use server';
/**
 * @fileOverview An AI agent for generating stories in an anime style, complete with images.
 *
 * - generateAnimationConcept - Generates an anime-style story with pictures.
 * - GenerateAnimationConceptInput - Input type.
 * - GenerateAnimationConceptOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const animeStyles = ['Vibrant Shonen', 'Elegant Shojo', 'Chibi/Kawaii', 'Classic 90s', 'Dark Fantasy', 'Cyberpunk', 'Studio Ghibli-esque'] as const;

const GenerateAnimationConceptInputSchema = z.object({
  prompt: z.string().describe('The main idea or scene for the story (e.g., "a cat who discovers a magical sword", "a detective solving a case in a cyberpunk city").'),
  style: z.enum(animeStyles).default('Vibrant Shonen').describe('The desired anime art style for the generated images.'),
});
export type GenerateAnimationConceptInput = z.infer<typeof GenerateAnimationConceptInputSchema>;

const StoryPageSchema = z.object({
  text: z.string().describe('The text content of this part of the story.'),
  imageUrl: z.string().describe('Data URI of the generated image for this page.'),
});

const GenerateAnimationConceptOutputSchema = z.object({
  title: z.string().describe('A catchy title for the story.'),
  pages: z.array(StoryPageSchema).describe('A sequence of pages, each with text and a generated image.'),
});
export type GenerateAnimationConceptOutput = z.infer<typeof GenerateAnimationConceptOutputSchema>;

export async function generateAnimationConcept(input: GenerateAnimationConceptInput): Promise<GenerateAnimationConceptOutput> {
  return generateAnimeStoryFlow(input);
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

Generate a title and scene descriptions.
`,
});

// 2. A prompt to generate the image for a given scene. Note: The image generation model is separate. This just defines the text prompt for it.
function createImagePrompt(scene: string, style: string) {
    return `Generate a single, high-quality image in a ${style} anime style. The scene is: "${scene}". The image should be dynamic and expressive, capturing the essence of the scene.`;
}

// 3. A prompt to write the narrative text for a given scene.
const storyPageTextPrompt = ai.definePrompt({
    name: 'animeStoryPageTextPrompt',
    input: { schema: z.object({ sceneDescription: z.string() }) },
    output: { schema: z.object({ pageText: z.string().describe('A paragraph of narrative text (about 50-100 words) describing the scene in an engaging way.') }) },
    prompt: `You are an anime scriptwriter. Write an engaging paragraph of story text for the following scene description: "{{{sceneDescription}}}"`
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
    const { title, sceneDescriptions } = outlineResult.output!;

    const finalPages: z.infer<typeof StoryPageSchema>[] = [];

    // 2. For each scene, generate text and an image in parallel
    for (const scene of sceneDescriptions) {
      // Use Promise.all to run text and image generation concurrently for each scene
      const [pageTextResult, imageGenerationResult] = await Promise.all([
        storyPageTextPrompt({ sceneDescription: scene }),
        ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: createImagePrompt(scene, input.style),
          config: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
      ]);
      
      const text = pageTextResult.output!.pageText;
      const imageUrl = imageGenerationResult.media.url;

      if (text && imageUrl) {
        finalPages.push({
          text: text,
          imageUrl: imageUrl,
        });
      }
    }

    return {
      title,
      pages: finalPages,
    };
  }
);
