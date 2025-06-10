
'use server';
/**
 * @fileOverview AI-powered presentation outline generator.
 *
 * - generatePresentationOutline - A function that generates a presentation outline.
 * - GeneratePresentationOutlineInput - The input type.
 * - GeneratePresentationOutlineOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SlideSchema = z.object({
  slideNumber: z.number().describe('The sequential number of the slide.'),
  slideTitle: z.string().describe('A concise and engaging title for this slide.'),
  mainPoints: z.array(z.string()).describe('An array of key bullet points or talking points for this slide (3-5 points usually).'),
  speakerNotes: z.string().optional().describe('Additional notes or script for the speaker for this slide.'),
  visualSuggestion: z.string().optional().describe('A suggestion for a visual element for this slide (e.g., "Graph showing X", "Image of Y", "Icon representing Z").'),
});
export type Slide = z.infer<typeof SlideSchema>;

const GeneratePresentationOutlineInputSchema = z.object({
  topic: z.string().describe('The main topic or subject of the presentation.'),
  targetAudience: z.string().describe('The intended audience for this presentation (e.g., "Technical Team", "Potential Investors", "General Public").'),
  desiredLength: z.enum(['Short (3-5 slides)', 'Medium (6-10 slides)', 'Long (11-15 slides)']).describe('The approximate desired length of the presentation content (excluding title/thank you slides).'),
  presentationStyle: z.enum(['Informative', 'Persuasive', 'Educational', 'Workshop', 'Storytelling', 'Demonstration']).optional().describe('The overall style or tone of the presentation.'),
  keyPoints: z.string().optional().describe('Optional: Comma-separated key messages or specific information that must be included.'),
  customInstructions: z.string().optional().describe('Any other specific instructions or elements to include/exclude.'),
});
export type GeneratePresentationOutlineInput = z.infer<typeof GeneratePresentationOutlineInputSchema>;

const GeneratePresentationOutlineOutputSchema = z.object({
  presentationTitle: z.string().describe('A compelling title for the presentation.'),
  overallSummary: z.string().describe('A brief summary (2-3 sentences) of what the presentation will cover and its main objective.'),
  slides: z.array(SlideSchema).describe('An array of slide objects outlining the presentation structure. This should include an introduction, main content slides, and a conclusion/Q&A slide.'),
});
export type GeneratePresentationOutlineOutput = z.infer<typeof GeneratePresentationOutlineOutputSchema>;

export async function generatePresentationOutline(input: GeneratePresentationOutlineInput): Promise<GeneratePresentationOutlineOutput> {
  return generatePresentationOutlineFlow(input);
}

const presentationOutlinePrompt = ai.definePrompt({
  name: 'generatePresentationOutlinePrompt',
  input: {schema: GeneratePresentationOutlineInputSchema},
  output: {schema: GeneratePresentationOutlineOutputSchema},
  prompt: `You are an expert presentation designer and content strategist.
Your task is to generate a comprehensive outline for a presentation based on the user's requirements.

Topic: {{{topic}}}
Target Audience: {{{targetAudience}}}
Desired Content Length: {{{desiredLength}}}
{{#if presentationStyle}}Presentation Style: {{{presentationStyle}}}{{/if}}
{{#if keyPoints}}Key Points to Include: {{{keyPoints}}}{{/if}}
{{#if customInstructions}}Custom Instructions: {{{customInstructions}}}{{/if}}

Please generate the following:
1.  Presentation Title: A compelling and relevant title.
2.  Overall Summary: A brief overview (2-3 sentences) of the presentation's purpose and content.
3.  Slides: An array of slide objects. Ensure a logical flow:
    *   Start with an introduction/title slide.
    *   Develop the main content across several slides, appropriate for the 'Desired Content Length'.
    *   Integrate 'Key Points' naturally if provided.
    *   Conclude with a summary, call to action (if applicable), and/or a Q&A slide.
    *   For each slide, provide:
        *   slideNumber: Sequential number.
        *   slideTitle: Clear and engaging title for the slide.
        *   mainPoints: 3-5 key bullet points for the slide.
        *   speakerNotes (optional): Brief notes for the presenter.
        *   visualSuggestion (optional): Ideas for relevant visuals (charts, images, icons).

Consider the 'Target Audience' and 'Presentation Style' when crafting the content and tone.
Structure your output strictly according to the 'GeneratePresentationOutlineOutputSchema'.
The number of slides in the 'slides' array should generally align with the 'Desired Content Length', plus 1-2 for intro/outro.
Example desired lengths for 'slides' array:
- Short (3-5 slides content) -> ~5-7 total slides in array
- Medium (6-10 slides content) -> ~8-12 total slides in array
- Long (11-15 slides content) -> ~13-17 total slides in array
`,
});

const generatePresentationOutlineFlow = ai.defineFlow(
  {
    name: 'generatePresentationOutlineFlow',
    inputSchema: GeneratePresentationOutlineInputSchema,
    outputSchema: GeneratePresentationOutlineOutputSchema,
  },
  async (input) => {
    const {output} = await presentationOutlinePrompt(input);
    return output!;
  }
);

    