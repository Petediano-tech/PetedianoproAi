
'use server';
/**
 * @fileOverview An AI agent for generating long stories with images.
 *
 * - generateStoryWithImages - A function that generates a story with images.
 * - GenerateStoryWithImagesInput - The input type for the generateStoryWithImages function.
 * - GenerateStoryWithImagesOutput - The return type for the generateStoryWithImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryWithImagesInputSchema = z.object({
  topic: z.string().describe('The topic of the story to generate.'),
  length: z.enum(['short', 'medium', 'long']).describe('The desired length of the story.'),
});
export type GenerateStoryWithImagesInput = z.infer<typeof GenerateStoryWithImagesInputSchema>;

const StoryPageSchema = z.object({
  text: z.string().describe('The text content of the page.'),
  imageUrl: z.string().describe('The URL of the image for the page, as a data URI.'),
});

const GenerateStoryWithImagesOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  pages: z.array(StoryPageSchema).describe('The pages of the story, with text and image URLs.'),
});
export type GenerateStoryWithImagesOutput = z.infer<typeof GenerateStoryWithImagesOutputSchema>;

export async function generateStoryWithImages(
  input: GenerateStoryWithImagesInput
): Promise<GenerateStoryWithImagesOutput> {
  return generateStoryWithImagesFlow(input);
}

const storyOutlinePrompt = ai.definePrompt({
  name: 'storyOutlinePrompt',
  input: {
    schema: GenerateStoryWithImagesInputSchema,
  },
  output: {
    schema: z.object({
      title: z.string().describe('The title of the story.'),
      sceneDescriptions: z
        .array(z.string())
        .describe('A list of descriptions for each scene in the story.'),
    }),
  },
  prompt: `You are a creative story writer. Based on the topic and length provided, create an outline with scene descriptions.

Topic: {{{topic}}}
Length: {{{length}}}

Outline:
Title: ...
Scene Descriptions: ...`,
  config: {
    temperature: 0.9,
  },
});

const StoryPageTextAndImageDescSchema = z.object({
  text: z.string().describe('The text content of the page. This should be a full paragraph.'),
  imageDescription: z.string().describe('A vivid, one-sentence description of an image to illustrate the text.'),
});

const storyPagePrompt = ai.definePrompt({
  name: 'storyPagePrompt',
  input: { schema: z.object({
    topic: z.string().describe('The topic of the story.'),
    sceneDescription: z.string().describe('A description of the scene.'),
  })},
  output: { schema: StoryPageTextAndImageDescSchema },
  prompt: `You are a creative story writer and visual artist. Based on the topic and scene description, write the story text and a description of an image to illustrate the text.

Topic: {{{topic}}}
Scene Description: {{{sceneDescription}}}

Page:
Text: ...
Image Description: ...`,
  config: {
    temperature: 0.9,
  },
});

const generateStoryWithImagesFlow = ai.defineFlow(
  {
    name: 'generateStoryWithImagesFlow',
    inputSchema: GenerateStoryWithImagesInputSchema,
    outputSchema: GenerateStoryWithImagesOutputSchema,
  },
  async input => {
    const outlineResult = await storyOutlinePrompt(input);
    
    if (!outlineResult.output || !outlineResult.output.sceneDescriptions || outlineResult.output.sceneDescriptions.length === 0) {
      throw new Error("The AI failed to generate a valid story outline. Please try adjusting your topic.");
    }

    const {title, sceneDescriptions} = outlineResult.output;

    const pages = [];
    for (const sceneDescription of sceneDescriptions) {
      try {
        const pageResult = await storyPagePrompt({
          topic: input.topic,
          sceneDescription,
        });

        if (!pageResult.output?.text || !pageResult.output?.imageDescription) {
          console.warn(`Skipping scene due to missing text or image description: "${sceneDescription}"`);
          continue;
        }

        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: `Generate an illustration for a story. The scene is: "${pageResult.output.imageDescription}". The image should be artistic and visually compelling.`,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        if (!media?.url) {
          console.warn(`Skipping scene due to missing image media for: "${sceneDescription}"`);
          continue;
        }

        pages.push({
          text: pageResult.output.text,
          imageUrl: media.url,
        });
      } catch (error) {
        console.error(`Failed to process page for scene: "${sceneDescription}". Skipping. Error:`, error);
      }
    }

    if (pages.length === 0) {
      throw new Error("The AI generated an outline, but failed to create any story pages. Please try again.");
    }

    return {title, pages};
  }
);
