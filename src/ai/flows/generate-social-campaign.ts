
'use server';
/**
 * @fileOverview AI-powered social media campaign planner.
 *
 * - generateSocialCampaign - A function that generates social media campaign ideas.
 * - GenerateSocialCampaignInput - The input type.
 * - GenerateSocialCampaignOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SocialPlatformEnum = z.enum(['Instagram', 'X (Twitter)', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube Shorts']);
export type SocialPlatform = z.infer<typeof SocialPlatformEnum>;

const PostIdeaSchema = z.object({
  platform: SocialPlatformEnum.describe('The social media platform for this post.'),
  postType: z.enum(['Text Post', 'Image Post', 'Video Clip (short)', 'Carousel Post', 'Story Sequence', 'Poll/Question', 'Live Session Idea']).describe('The type or format of the post.'),
  daySuggestion: z.string().optional().describe('Suggested day or timing for the post within the campaign (e.g., "Day 1", "Mid-week", "Weekend").'),
  captionIdea: z.string().describe('A compelling caption idea for the post, including relevant emojis if appropriate.'),
  hashtagSuggestions: z.array(z.string()).describe('A list of 3-5 relevant hashtag suggestions.'),
  visualConcept: z.string().optional().describe('A brief description of the visual content (image, video, graphic).'),
  callToAction: z.string().optional().describe('A specific call to action for this post (e.g., "Learn more", "Shop now", "Comment below").'),
});
export type PostIdea = z.infer<typeof PostIdeaSchema>;

const GenerateSocialCampaignInputSchema = z.object({
  campaignTopic: z.string().describe('The main topic, product, service, or event for the social media campaign.'),
  targetPlatforms: z.array(SocialPlatformEnum).min(1).describe('An array of social media platforms to target for this campaign.'),
  campaignGoal: z.string().describe('The primary goal of the campaign (e.g., "Increase brand awareness", "Drive website traffic", "Promote new product launch", "Boost engagement").'),
  campaignDuration: z.enum(['1 Week', '2 Weeks', '1 Month']).describe('The desired duration of the campaign.'),
  targetAudience: z.string().optional().describe('A brief description of the target audience for this campaign.'),
  tone: z.enum(['Professional', 'Friendly & Casual', 'Humorous & Witty', 'Inspirational & Uplifting', 'Urgent & Action-Oriented', 'Educational & Informative']).optional().describe('The desired tone of voice for the campaign posts.'),
  existingAssets: z.string().optional().describe('Optional: Mention any existing assets (e.g., blog posts, videos, images) that can be repurposed for the campaign.'),
});
export type GenerateSocialCampaignInput = z.infer<typeof GenerateSocialCampaignInputSchema>;

const GenerateSocialCampaignOutputSchema = z.object({
  campaignTitle: z.string().describe('A catchy and relevant title for the social media campaign.'),
  campaignStrategySummary: z.string().describe('A brief summary (2-4 sentences) of the overall strategy, including key messaging pillars and content themes.'),
  contentPillars: z.array(z.string()).optional().describe('2-3 key content pillars or themes the campaign will focus on.'),
  postIdeas: z.array(PostIdeaSchema).describe('An array of distinct post ideas, diversified across the selected platforms and campaign duration. Aim for a reasonable number of posts based on duration (e.g., 3-5 posts per week per platform for a 1-week campaign).'),
});
export type GenerateSocialCampaignOutput = z.infer<typeof GenerateSocialCampaignOutputSchema>;

export async function generateSocialCampaign(input: GenerateSocialCampaignInput): Promise<GenerateSocialCampaignOutput> {
  return generateSocialCampaignFlow(input);
}

const socialCampaignPrompt = ai.definePrompt({
  name: 'generateSocialCampaignPrompt',
  input: {schema: GenerateSocialCampaignInputSchema},
  output: {schema: GenerateSocialCampaignOutputSchema},
  prompt: `You are an expert social media marketing strategist.
Your task is to develop a creative and effective social media campaign plan based on the user's requirements.

Campaign Topic/Product: {{{campaignTopic}}}
Target Platforms: {{#each targetPlatforms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Campaign Goal: {{{campaignGoal}}}
Campaign Duration: {{{campaignDuration}}}
{{#if targetAudience}}Target Audience: {{{targetAudience}}}{{/if}}
{{#if tone}}Desired Tone: {{{tone}}}{{/if}}
{{#if existingAssets}}Existing Assets to leverage: {{{existingAssets}}}{{/if}}

Please generate the following:
1.  Campaign Title: A short, catchy, and memorable title for the campaign.
2.  Campaign Strategy Summary: A concise overview (2-4 sentences) of the core strategy. What's the big idea?
3.  Content Pillars (Optional but Recommended): 2-3 key themes or content categories that will guide post creation.
4.  Post Ideas: An array of specific and distinct post ideas.
    *   Distribute posts across the 'Target Platforms' and throughout the 'Campaign Duration'.
    *   For a 1-week duration, suggest 3-7 posts in total, varying by platform. For longer durations, scale appropriately.
    *   For each post idea, provide:
        *   platform: The specific platform.
        *   postType: The format (e.g., Image Post, Video Clip, Carousel).
        *   daySuggestion (optional): When it might be posted (e.g., "Day 1", "Weekend").
        *   captionIdea: Engaging caption.
        *   hashtagSuggestions: 3-5 relevant hashtags.
        *   visualConcept (optional): Description of the image/video.
        *   callToAction (optional): What you want users to do.
    *   Ensure variety in post types and content angles.
    *   Align posts with the 'Campaign Goal', 'Target Audience', and 'Desired Tone'.
    *   If 'Existing Assets' are mentioned, suggest how they could be repurposed.

Structure your output strictly according to the 'GenerateSocialCampaignOutputSchema'.
Focus on actionable and creative ideas.
For hashtagSuggestions, do not include the '#' symbol.
`,
});

const generateSocialCampaignFlow = ai.defineFlow(
  {
    name: 'generateSocialCampaignFlow',
    inputSchema: GenerateSocialCampaignInputSchema,
    outputSchema: GenerateSocialCampaignOutputSchema,
  },
  async (input) => {
    const {output} = await socialCampaignPrompt(input);
    return output!;
  }
);

    