
'use server';
/**
 * @fileOverview An AI agent for generating long stories with images in discrete steps.
 *
 * - generateStoryText - A function that generates the story text content (title, pages with text and image descriptions).
 * - generateStoryImage - A function that generates an image for a single story page.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

// --- SCHEMAS AND TYPES ---

export const GenerateStoryTextInputSchema = z.object({
  topic: z.string().describe('The topic of the story to generate.'),
  length: z.enum(['short', 'medium', 'long']).describe('The desired length of the story.'),
});
export type GenerateStoryTextInput = z.infer<typeof GenerateStoryTextInputSchema>;

const StoryPageSchema = z.object({
  text: z.string().describe('The text content of the page. This should be a full paragraph.'),
  imageDescription: z.string().describe('A vivid, one-sentence description of an image to illustrate the text.'),
});
export const GenerateStoryTextOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  pages: z.array(StoryPageSchema).describe('The pages of the story, with text and image descriptions.'),
});
export type GenerateStoryTextOutput = z.infer<typeof GenerateStoryTextOutputSchema>;


export const GenerateStoryImageInputSchema = z.object({
  imageDescription: z.string().describe('A vivid description of an image to illustrate the text.'),
});
export type GenerateStoryImageInput = z.infer<typeof GenerateStoryImageInputSchema>;
export const GenerateStoryImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the image for the page, as a data URI.'),
});
export type GenerateStoryImageOutput = z.infer<typeof GenerateStoryImageOutputSchema>;


// --- AI PROMPTS ---

const storyOutlinePrompt = ai.definePrompt({
  name: 'storyOutlinePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {
    schema: GenerateStoryTextInputSchema,
  },
  output: {
    schema: z.object({
      title: z.string().describe('The title of the story.'),
      sceneDescriptions: z
        .array(z.string())
        .describe('A list of descriptions for each scene in the story.'),
    }),
  },
  prompt: `You are a creative story writer. Based on the topic and length provided, create an outline with a title and a list of scene descriptions.

Topic: {{{topic}}}
Length: {{{length}}}

Generate a creative title and a list of scene descriptions.
`,
  config: {
    temperature: 0.9,
  },
});

const storyPagePrompt = ai.definePrompt({
  name: 'storyPagePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: z.object({
    topic: z.string().describe('The topic of the story.'),
    sceneDescription: z.string().describe('A description of the scene.'),
  })},
  output: { schema: StoryPageSchema },
  prompt: `You are a creative story writer and visual artist. Based on the topic and scene description, write the story text and a description of an image to illustrate the text.

Topic: {{{topic}}}
Scene Description: {{{sceneDescription}}}

Write a full paragraph of story text and a concise image description.`,
  config: {
    temperature: 0.9,
  },
});


// --- EXPORTED FUNCTIONS / FLOWS ---

/**
 * Generates the text content (title, pages with text and image descriptions) for a story.
 */
export async function generateStoryText(
  input: GenerateStoryTextInput
): Promise<GenerateStoryTextOutput> {
  const outlineResult = await storyOutlinePrompt(input);
  if (!outlineResult?.output?.sceneDescriptions?.length) {
    console.error("The AI failed to generate a valid story outline.");
    return { title: "Story Generation Failed", pages: [] };
  }
  const {title, sceneDescriptions} = outlineResult.output;
  
  const pages = await Promise.all(
    sceneDescriptions.map(async (sceneDescription) => {
      try {
        const pageResult = await storyPagePrompt({
          topic: input.topic,
          sceneDescription,
        });
        return pageResult.output!;
      } catch (error) {
        console.error(`Failed to process page for scene: "${sceneDescription}". Skipping. Error:`, error);
        return {
            text: `[Error generating content for this scene: ${sceneDescription}]`,
            imageDescription: "A gray box with an error icon."
        };
      }
    })
  );

  return {title, pages: pages.filter(p => p)};
}

/**
 * Generates a single image for a story page based on its description.
 */
export async function generateStoryImage(input: GenerateStoryImageInput): Promise<GenerateStoryImageOutput> {
    const {media} = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: `Generate an illustration for a story. The scene is: "${input.imageDescription}". The image should be artistic and visually compelling.`,
    });

    if (!media?.url) {
      throw new Error("Image generation failed to return a valid URL.");
    }

    return {imageUrl: media.url};
}
