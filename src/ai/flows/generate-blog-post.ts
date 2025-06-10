
'use server';
/**
 * @fileOverview AI-powered blog post and article writer.
 *
 * - generateBlogPost - A function that generates a blog post.
 * - GenerateBlogPostInput - The input type for the generateBlogPost function.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HeadingSectionSchema = z.object({
  headingText: z.string().describe('The text for this section heading (e.g., H2 or H3).'),
  paragraphs: z.array(z.string()).describe('An array of paragraphs constituting the content under this heading. Each string is a paragraph.'),
});
export type HeadingSection = z.infer<typeof HeadingSectionSchema>;

const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The central topic or theme of the blog post/article.'),
  keywords: z.string().optional().describe('Comma-separated keywords to be naturally incorporated into the content for SEO purposes.'),
  targetAudience: z.string().describe('The specific audience the content is intended for (e.g., "Software developers", "Marketing professionals", "DIY enthusiasts").'),
  tone: z.enum(['Informative', 'Casual', 'Formal', 'Humorous', 'Persuasive', 'Technical', 'Storytelling']).describe('The desired writing style and tone of the article.'),
  desiredLength: z.enum(['Short (~300-500 words)', 'Medium (~800-1200 words)', 'Long (1500+ words)']).describe('The approximate desired length of the blog post.'),
  customInstructions: z.string().optional().describe('Any other specific instructions or points to include or exclude.'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  blogTitle: z.string().describe('A compelling and SEO-friendly title for the blog post.'),
  introduction: z.string().describe('An engaging introduction that hooks the reader and outlines what the post will cover.'),
  mainContent: z.array(HeadingSectionSchema).describe('The main body of the blog post, structured into sections with headings and paragraphs. Ensure a logical flow and adequate coverage for the desired length.'),
  conclusion: z.string().describe('A strong conclusion that summarizes key takeaways and may include a call to action or final thought.'),
  suggestedMetaDescription: z.string().optional().describe('A brief (150-160 characters) meta description for SEO.'),
  suggestedTags: z.array(z.string()).optional().describe('A list of relevant tags or categories for the blog post.'),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const blogPostPrompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: {schema: GenerateBlogPostInputSchema},
  output: {schema: GenerateBlogPostOutputSchema},
  prompt: `You are an expert blog post writer and SEO content strategist.
Your task is to generate a high-quality, well-structured blog post based on the user's requirements.

Topic: {{{topic}}}
{{#if keywords}}Keywords to incorporate: {{{keywords}}}{{/if}}
Target Audience: {{{targetAudience}}}
Desired Tone: {{{tone}}}
Desired Length: {{{desiredLength}}}
{{#if customInstructions}}Custom Instructions: {{{customInstructions}}}{{/if}}

Please generate the following components for the blog post:
1.  Blog Title: Catchy, relevant, and keyword-optimized if applicable.
2.  Introduction: Hook the reader, state the purpose of the post, and briefly outline what will be covered.
3.  Main Content:
    *   Divide the main body into logical sections, each with a clear 'headingText'.
    *   Under each heading, provide one or more 'paragraphs' of well-written content.
    *   The content should be informative, engaging, and tailored to the 'targetAudience' and 'desiredTone'.
    *   Naturally integrate the 'keywords' if provided.
    *   Ensure the depth and number of sections are appropriate for the 'desiredLength'.
4.  Conclusion: Summarize the main points and offer a final takeaway or call to action.
5.  Suggested Meta Description (optional): A concise summary for search engines (150-160 characters).
6.  Suggested Tags (optional): A list of relevant tags or categories.

Maintain the specified 'desiredTone' throughout the article.
Ensure the language is appropriate for the 'targetAudience'.
The blog post should be original, insightful, and provide value to the reader.
Structure your output strictly according to the 'GenerateBlogPostOutputSchema'.
`,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async (input) => {
    const {output} = await blogPostPrompt(input);
    return output!;
  }
);
