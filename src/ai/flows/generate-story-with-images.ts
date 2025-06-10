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
  output: z.object({
    title: z.string().describe('The title of the story.'),
    sceneDescriptions: z
      .array(z.string())
      .describe('A list of descriptions for each scene in the story.'),
  }),
  prompt: `You are a creative story writer. Based on the topic and length provided, create an outline with scene descriptions.

Topic: {{{topic}}}
Length: {{{length}}}

Outline:
Title: ...
Scene Descriptions: ...`, // Use Handlebars syntax correctly
});

const storyPagePrompt = ai.definePrompt({
  name: 'storyPagePrompt',
  input: z.object({
    topic: z.string().describe('The topic of the story.'),
    sceneDescription: z.string().describe('A description of the scene.'),
  }),
  output: StoryPageSchema,
  prompt: `You are a creative story writer and visual artist. Based on the topic and scene description, write the story text and a description of an image to illustrate the text.

Topic: {{{topic}}}
Scene Description: {{{sceneDescription}}}

Page:
Text: ...
Image Description: ...`,
});

const generateStoryWithImagesFlow = ai.defineFlow(
  {
    name: 'generateStoryWithImagesFlow',
    inputSchema: GenerateStoryWithImagesInputSchema,
    outputSchema: GenerateStoryWithImagesOutputSchema,
  },
  async input => {
    const outlineResult = await storyOutlinePrompt(input);
    const {title, sceneDescriptions} = outlineResult.output!;

    const pages = [];
    for (const sceneDescription of sceneDescriptions) {
      const pageResult = await storyPagePrompt({
        topic: input.topic,
        sceneDescription,
      });
      // Generate images using the Gemini 2.0 Flash model
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: [
          {text: pageResult.output!.text},
          {text: `Generate an image of the following scene: ${pageResult.output!.text}`},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      pages.push({
        text: pageResult.output!.text,
        imageUrl: media.url,
      });
    }

    return {title, pages};
  }
);
