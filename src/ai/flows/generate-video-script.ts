
'use server';
/**
 * @fileOverview AI-powered video script generator.
 *
 * - generateVideoScript - A function that generates a video script.
 * - GenerateVideoScriptInput - The input type for the generateVideoScript function.
 * - GenerateVideoScriptOutput - The return type for the generateVideoScript function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const SceneSchema = z.object({
  sceneNumber: z.number().describe('The sequential number of the scene.'),
  visualDescription: z.string().describe('Description of what is visually happening in this scene. Be specific and vivid.'),
  voiceoverOrDialogue: z.string().describe('The voiceover narration or character dialogue for this scene.'),
  onScreenText: z.string().optional().describe('Any text that should appear on screen during this scene (e.g., titles, key points).'),
  bRollSuggestions: z.string().optional().describe('Suggestions for B-roll footage or cutaway shots relevant to this scene.'),
  estimatedDurationSeconds: z.number().optional().describe('Estimated duration of this scene in seconds.'),
});
export type Scene = z.infer<typeof SceneSchema>;

const GenerateVideoScriptInputSchema = z.object({
  topic: z.string().describe('The main topic or subject of the video.'),
  videoStyle: z.enum(['Tutorial', 'Vlog', 'Marketing Ad', 'Explainer', 'Product Review', 'Documentary Short']).describe('The style or format of the video.'),
  targetAudience: z.string().describe('The intended audience for this video (e.g., "Beginner photographers", "Small business owners").'),
  estimatedDuration: z.enum(['Under 1 minute', '1-3 minutes', '3-5 minutes', '5-10 minutes', '10+ minutes']).describe('The desired total length of the video.'),
  keyPoints: z.string().optional().describe('Optional: Comma-separated key points or specific information that must be included in the script.'),
  tone: z.enum(['Informative', 'Engaging', 'Humorous', 'Serious', 'Inspiring', 'Formal', 'Casual']).describe('The desired tone of the video script.'),
});
export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;

const GenerateVideoScriptOutputSchema = z.object({
  videoTitle: z.string().describe('A compelling and SEO-friendly title for the video.'),
  hook: z.string().describe('An engaging opening (first 5-15 seconds) to capture viewer attention immediately.'),
  introduction: z.string().describe('A brief introduction to the topic and what the video will cover.'),
  scenes: z.array(SceneSchema).describe('A sequence of scenes that make up the main content of the video. Aim for a logical flow and appropriate number of scenes for the estimated duration.'),
  callToAction: z.string().optional().describe('A clear call to action for the viewer (e.g., "Subscribe for more tips", "Visit our website").'),
  outro: z.string().describe('A concluding segment for the video, summarizing key points or thanking the viewers.'),
});
export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const videoScriptPrompt = ai.definePrompt({
  name: 'generateVideoScriptPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: GenerateVideoScriptInputSchema},
  output: {schema: GenerateVideoScriptOutputSchema},
  prompt: `You are an expert video scriptwriter and content strategist.
Your task is to generate a comprehensive video script based on the user's requirements.

Video Topic: {{{topic}}}
Video Style: {{{videoStyle}}}
Target Audience: {{{targetAudience}}}
Estimated Duration: {{{estimatedDuration}}}
Desired Tone: {{{tone}}}
{{#if keyPoints}}Key Points to Include: {{{keyPoints}}}{{/if}}

Please generate the following components for the video script:
1.  Video Title: Catchy, relevant, and optimized for search if applicable.
2.  Hook: The first 5-15 seconds. Must be highly engaging to prevent viewers from dropping off.
3.  Introduction: Briefly introduce the topic and what will be covered.
4.  Scenes:
    *   Break down the main content into a logical sequence of scenes.
    *   For each scene, provide:
        *   sceneNumber: A sequential number.
        *   visualDescription: What viewers will see (actions, settings, graphics). Be descriptive.
        *   voiceoverOrDialogue: The spoken content. Write naturally for the chosen style.
        *   onScreenText (optional): Any text overlays.
        *   bRollSuggestions (optional): Ideas for supplementary footage.
        *   estimatedDurationSeconds (optional): A rough estimate for the scene length.
    *   Ensure the number and length of scenes align with the overall 'Estimated Duration'. For shorter videos, fewer, more concise scenes are better. For longer videos, more detailed scenes.
5.  Call To Action (optional but recommended): What should the viewer do next?
6.  Outro: Summarize, thank viewers, and provide any final thoughts.

Maintain the specified 'Desired Tone' throughout the script.
The script should be detailed enough for someone to produce the video effectively.
Consider the 'Target Audience' when choosing language and examples.
If 'Key Points' are provided, ensure they are naturally integrated into the script.
Structure your output strictly according to the 'GenerateVideoScriptOutputSchema'.
`,
  config: {
    temperature: 0.8,
  },
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: GenerateVideoScriptInputSchema,
    outputSchema: GenerateVideoScriptOutputSchema,
  },
  async (input) => {
    const {output} = await videoScriptPrompt(input);
    return output!;
  }
);
