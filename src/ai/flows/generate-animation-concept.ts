
'use server';
/**
 * @fileOverview An AI agent for generating animation concepts including a character image and a storyboard.
 *
 * - generateAnimationConcept - Generates an animation concept.
 * - GenerateAnimationConceptInput - Input type.
 * - GenerateAnimationConceptOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KeyframeSchema = z.object({
  timecode: z.string().describe('A suggested timecode for this keyframe (e.g., "0.5s", "1.2s").'),
  actionDescription: z.string().describe('What the character is doing in this keyframe.'),
  dialogue: z.string().optional().describe('Any dialogue spoken by the character in this keyframe.'),
  mouthMovement: z.string().optional().describe('Description of mouth movement for the dialogue (e.g., "lips form an O shape for "hello"").'),
  headMovement: z.string().optional().describe('Description of head movement (e.g., "nods slightly", "turns head left").'),
  eyeState: z.string().optional().describe('Description of eye state (e.g., "blinks", "looks towards the camera").'),
  gesture: z.string().optional().describe('Description of any gestures (e.g., "waves right hand", "points up").'),
});

const GenerateAnimationConceptInputSchema = z.object({
  prompt: z.string().describe('The main idea or scene for the animation (e.g., "a cat explaining gravity", "a wizard casting a spell").'),
  characterDescription: z.string().optional().describe('Optional: A description of the main character (e.g., "a small, fluffy blue monster with big eyes", "an old knight in shining armor").'),
});
export type GenerateAnimationConceptInput = z.infer<typeof GenerateAnimationConceptInputSchema>;

const GenerateAnimationConceptOutputSchema = z.object({
  animationTitle: z.string().describe('A catchy title for the animation concept.'),
  characterImageUrl: z.string().describe('Data URI of the generated main character image.'),
  characterDesignNotes: z.string().describe('Brief notes on the character design based on the prompt/description.'),
  animationSummary: z.string().describe('A brief summary of what the animation would be about and its style.'),
  storyboard: z.array(KeyframeSchema).describe('A sequence of keyframes describing the animation.'),
});
export type GenerateAnimationConceptOutput = z.infer<typeof GenerateAnimationConceptOutputSchema>;


export async function generateAnimationConcept(input: GenerateAnimationConceptInput): Promise<GenerateAnimationConceptOutput> {
  return generateAnimationConceptFlow(input);
}

const animationConceptPrompt = ai.definePrompt({
  name: 'animationConceptPrompt',
  input: {schema: GenerateAnimationConceptInputSchema},
  // Define a temporary output schema for the text generation part, excluding the image URL
  output: {
    schema: z.object({
      animationTitle: z.string().describe('A catchy title for the animation concept.'),
      characterDesignNotes: z.string().describe('Brief notes on the character design based on the prompt/description. This will be used to generate the character image. Be descriptive about appearance, clothing, and key features.'),
      animationSummary: z.string().describe('A brief summary of what the animation would be about and its style.'),
      storyboard: z.array(KeyframeSchema).describe('A sequence of 3-5 keyframes describing the animation. Focus on mouth movements for dialogue, head movements, eye blinking, and gestures relevant to the prompt.'),
    })
  },
  prompt: `You are an expert animation concept artist and storyboarder.
The user wants to generate an animation concept.
Animation Prompt: {{{prompt}}}
{{#if characterDescription}}Character Description: {{{characterDescription}}}{{/if}}

Based on the prompt and character description (if provided), generate:
1.  A catchy Animation Title.
2.  Character Design Notes: Describe the main character's appearance in detail. This description will be used to generate an image of the character. Include visual details like species (if applicable), clothing, hair, distinctive features, and overall style.
3.  Animation Summary: A brief overview of the animation's plot and visual style.
4.  Storyboard: A sequence of 3-5 keyframes. For each keyframe, provide:
    *   timecode: A suggested time (e.g., "0.0s", "0.8s").
    *   actionDescription: What the character is doing.
    *   dialogue: (Optional) Any spoken words.
    *   mouthMovement: (Optional) If dialogue is present, describe how the mouth would move (e.g., "mouth opens wide for 'Ah'", "lips purse for 'Hmm'").
    *   headMovement: (Optional) Describe head movements (e.g., "nods in agreement", "tilts head curiously").
    *   eyeState: (Optional) Describe eye movements (e.g., "eyes blink slowly", "looks to the right").
    *   gesture: (Optional) Describe relevant gestures (e.g., "waves hand for 'goodbye'", "shrugs shoulders").

Example for a keyframe gesture: If the prompt is "character saying goodbye", a gesture could be "raises right hand and waves".
Ensure the movements (mouth, head, eyes, gestures) are relevant to the animation prompt and described actions.
`,
});


const generateAnimationConceptFlow = ai.defineFlow(
  {
    name: 'generateAnimationConceptFlow',
    inputSchema: GenerateAnimationConceptInputSchema,
    outputSchema: GenerateAnimationConceptOutputSchema,
  },
  async (input) => {
    // 1. Generate the textual concept (title, summary, storyboard, character design notes)
    const textConceptResult = await animationConceptPrompt(input);
    const { animationTitle, characterDesignNotes, animationSummary, storyboard } = textConceptResult.output!;

    // 2. Generate the character image based on the characterDesignNotes
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate a full-body image of a character based on the following description: ${characterDesignNotes}. The character should be centered and clearly visible. Style: Cartoonish and expressive.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const characterImageUrl = media.url!;

    return {
      animationTitle,
      characterImageUrl,
      characterDesignNotes,
      animationSummary,
      storyboard,
    };
  }
);

