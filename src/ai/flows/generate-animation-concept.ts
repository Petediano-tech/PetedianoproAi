
'use server';
/**
 * @fileOverview An AI agent for generating animation concepts including character images for keyframes and a storyboard.
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
  imageUrl: z.string().optional().describe('Data URI of the generated image for this keyframe.'), // Added imageUrl
});
export type Keyframe = z.infer<typeof KeyframeSchema>;


const GenerateAnimationConceptInputSchema = z.object({
  prompt: z.string().describe('The main idea or scene for the animation (e.g., "a cat explaining gravity", "a wizard casting a spell").'),
  characterDescription: z.string().optional().describe('Optional: A description of the main character (e.g., "a small, fluffy blue monster with big eyes", "an old knight in shining armor").'),
});
export type GenerateAnimationConceptInput = z.infer<typeof GenerateAnimationConceptInputSchema>;

const GenerateAnimationConceptOutputSchema = z.object({
  animationTitle: z.string().describe('A catchy title for the animation concept.'),
  characterDesignNotes: z.string().describe('Brief notes on the character design based on the prompt/description.'),
  animationSummary: z.string().describe('A brief summary of what the animation would be about and its style.'),
  storyboard: z.array(KeyframeSchema).describe('A sequence of keyframes describing the animation, some with generated images.'),
});
export type GenerateAnimationConceptOutput = z.infer<typeof GenerateAnimationConceptOutputSchema>;


export async function generateAnimationConcept(input: GenerateAnimationConceptInput): Promise<GenerateAnimationConceptOutput> {
  return generateAnimationConceptFlow(input);
}

// Schema for the text-only part of the storyboard generation
const TextOnlyKeyframeSchema = z.object({
  timecode: z.string().describe('A suggested timecode for this keyframe (e.g., "0.5s", "1.2s").'),
  actionDescription: z.string().describe('What the character is doing in this keyframe. Be very descriptive for image generation purposes.'),
  dialogue: z.string().optional().describe('Any dialogue spoken by the character in this keyframe.'),
  mouthMovement: z.string().optional().describe('Description of mouth movement for the dialogue (e.g., "lips form an O shape for "hello"").'),
  headMovement: z.string().optional().describe('Description of head movement (e.g., "nods slightly", "turns head left").'),
  eyeState: z.string().optional().describe('Description of eye state (e.g., "blinks", "looks towards the camera").'),
  gesture: z.string().optional().describe('Description of any gestures (e.g., "waves right hand", "points up").'),
});


const animationConceptTextPrompt = ai.definePrompt({
  name: 'animationConceptTextPrompt',
  input: {schema: GenerateAnimationConceptInputSchema},
  output: {
    schema: z.object({
      animationTitle: z.string().describe('A catchy title for the animation concept.'),
      characterDesignNotes: z.string().describe('Detailed notes on the main character design. This will be used to generate images. Be specific about appearance, clothing, colors, species, and key features. Ensure this description is rich enough for consistent character generation across multiple frames.'),
      animationSummary: z.string().describe('A brief summary of what the animation would be about and its style.'),
      storyboard: z.array(TextOnlyKeyframeSchema).describe('A sequence of 3-5 keyframes describing the animation. For each keyframe, provide a very detailed actionDescription suitable for image generation. Focus on mouth movements for dialogue, head movements, eye blinking, and gestures relevant to the prompt.'),
    })
  },
  prompt: `You are an expert animation concept artist and storyboarder.
The user wants to generate an animation concept.
Animation Prompt: {{{prompt}}}
{{#if characterDescription}}Character Description (user provided): {{{characterDescription}}}{{/if}}

Based on the prompt and user-provided character description (if any), generate:
1.  A catchy Animation Title.
2.  Detailed Character Design Notes: Describe the main character's appearance, clothing, style, colors, species, and any defining features with enough detail for consistent image generation across multiple keyframes. If the user provided a character description, expand on it or use it as a strong base.
3.  Animation Summary: A brief overview of the animation's plot and visual style.
4.  Storyboard: A sequence of 3-5 keyframes. For each keyframe, provide:
    *   timecode: A suggested time (e.g., "0.0s", "0.8s").
    *   actionDescription: A DETAILED description of what the character is doing and their expression, suitable for generating a distinct image for this keyframe. (e.g., "The cat chef, with wide excited eyes, holds up a whisk in its right paw, mouth open as if about to announce something important. Chef hat slightly tilted.").
    *   dialogue: (Optional) Any spoken words.
    *   mouthMovement: (Optional) If dialogue is present, describe how the mouth would move.
    *   headMovement: (Optional) Describe head movements.
    *   eyeState: (Optional) Describe eye movements.
    *   gesture: (Optional) Describe relevant gestures.

Example for actionDescription: If prompt is "character waving goodbye", actionDescription could be "The character stands facing slightly right, smiling warmly, right hand raised near their head, palm open, waving gently. Their eyes are friendly."
Ensure the movements (mouth, head, eyes, gestures) are relevant to the animation prompt and described actions.
The actionDescription for each keyframe should be distinct enough to result in a visually different image if one were generated.
`,
});


const MAX_KEYFRAME_IMAGES = 3;

const generateAnimationConceptFlow = ai.defineFlow(
  {
    name: 'generateAnimationConceptFlow',
    inputSchema: GenerateAnimationConceptInputSchema,
    outputSchema: GenerateAnimationConceptOutputSchema,
  },
  async (input) => {
    // 1. Generate the textual concept (title, summary, storyboard text, character design notes)
    const textConceptResult = await animationConceptTextPrompt(input);
    const { animationTitle, characterDesignNotes, animationSummary, storyboard: textStoryboard } = textConceptResult.output!;

    const finalStoryboard: Keyframe[] = [];

    // 2. Generate images for the first few keyframes
    for (let i = 0; i < textStoryboard.length; i++) {
      const keyframeTextData = textStoryboard[i];
      let imageUrl: string | undefined = undefined;

      if (i < MAX_KEYFRAME_IMAGES) {
        // Construct a detailed prompt for image generation for this specific keyframe
        const imagePromptForKeframe = `Generate a single, expressive, cartoon-style image of a character based on these design notes: "${characterDesignNotes}". The character is performing the following action: "${keyframeTextData.actionDescription}". {{#if keyframeTextData.dialogue}}They might be saying: "${keyframeTextData.dialogue}".{{/if}} Ensure the character is clearly visible and centered. Style: Cartoonish and expressive, suitable for animation.`;
        
        try {
            const { media } = await ai.generate({
              model: 'googleai/gemini-2.0-flash-exp',
              prompt: imagePromptForKeframe,
              config: {
                responseModalities: ['TEXT', 'IMAGE'],
                 safetySettings: [{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE'}, { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE'}, { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE'}, { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE'}]
              },
            });
            imageUrl = media?.url;
        } catch (e) {
            console.error(`Failed to generate image for keyframe ${i}:`, (e as Error).message);
            // Optionally, you could try a fallback or just skip the image for this frame.
            // For now, we'll just let imageUrl remain undefined.
        }
      }

      finalStoryboard.push({
        ...keyframeTextData,
        imageUrl: imageUrl,
      });
    }

    return {
      animationTitle,
      characterDesignNotes,
      animationSummary,
      storyboard: finalStoryboard,
    };
  }
);

