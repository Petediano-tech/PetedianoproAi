
'use server';
/**
 * @fileOverview An AI agent for generating interactive, choice-based stories.
 *
 * - startInteractiveStory - A function to begin a new story.
 * - makeStoryChoice - A function to continue the story based on a user's choice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --- SCHEMAS AND TYPES ---

const StorySceneSchema = z.object({
  text: z.string().describe('The text content of the current scene. This should be a full paragraph.'),
  choices: z.array(z.string().min(1)).length(2).describe('An array of exactly two possible choices for the user to make to continue the story.'),
  isEnding: z.boolean().describe('Whether this scene represents a conclusion to the story.'),
  imageDescription: z.string().describe('A vivid, one-sentence description of an image to illustrate the current scene.'),
});
export type StoryScene = z.infer<typeof StorySceneSchema>;


export const StartInteractiveStoryInputSchema = z.object({
  topic: z.string().describe('The initial topic or premise of the story to generate.'),
});
export type StartInteractiveStoryInput = z.infer<typeof StartInteractiveStoryInputSchema>;
export type StartInteractiveStoryOutput = StoryScene;


export const MakeStoryChoiceInputSchema = z.object({
  storyHistory: z.array(z.object({
    text: z.string(),
    choice: z.string(),
  })).describe('An array of previous scenes and the choices made to reach the current point.'),
  currentChoice: z.string().describe('The choice the user just made for the current scene.'),
});
export type MakeStoryChoiceInput = z.infer<typeof MakeStoryChoiceInputSchema>;
export type MakeStoryChoiceOutput = StoryScene;


// --- AI PROMPTS ---

const startStoryPrompt = ai.definePrompt({
  name: 'startInteractiveStoryPrompt',
  input: { schema: StartInteractiveStoryInputSchema },
  output: { schema: StorySceneSchema },
  prompt: `You are an interactive storyteller. Your goal is to create an engaging, branching narrative.

Start a story based on the following topic.
Topic: {{{topic}}}

Generate the very first scene of the story. The scene should end with two clear, distinct choices for the user to make.
Do not make this first scene an ending. Set 'isEnding' to false.
Provide a compelling narrative and two choices that lead to different paths. Also, provide a vivid image description for the scene.`,
  config: {
    temperature: 0.9,
  },
});

const continueStoryPrompt = ai.definePrompt({
  name: 'continueInteractiveStoryPrompt',
  input: { schema: MakeStoryChoiceInputSchema },
  output: { schema: StorySceneSchema },
  prompt: `You are an interactive storyteller continuing a branching narrative.

Here is the story so far:
{{#each storyHistory}}
Scene: {{{this.text}}}
Choice Made: {{{this.choice}}}
{{/each}}

The user just made the following choice: {{{currentChoice}}}

Now, write the next scene of the story based on this choice.
The new scene must present two new, distinct choices for the user.
If this new scene is a natural conclusion to the story, set 'isEnding' to true and make the choices conclusive (e.g., "Start over" or "The end"). Otherwise, set 'isEnding' to false and provide two choices that continue the adventure.
Also, provide a vivid image description for the new scene.`,
  config: {
    temperature: 0.8,
  },
});

// --- EXPORTED FUNCTIONS / FLOWS ---

export async function startInteractiveStory(input: StartInteractiveStoryInput): Promise<StartInteractiveStoryOutput> {
  const { output } = await startStoryPrompt(input);
  if (!output) {
    throw new Error('Failed to start the story. The AI did not provide a valid beginning.');
  }
  return output;
}

export async function makeStoryChoice(input: MakeStoryChoiceInput): Promise<MakeStoryChoiceOutput> {
  const { output } = await continueStoryPrompt(input);
   if (!output) {
    throw new Error('Failed to continue the story. The AI did not provide a valid next scene.');
  }
  return output;
}
