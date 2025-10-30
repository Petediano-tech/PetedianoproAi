
'use server';
/**
 * @fileOverview AI-powered trip itinerary planner.
 *
 * - generateTripPlan - Generates a day-by-day travel itinerary.
 * - GenerateTripPlanInput - Input type.
 * - GenerateTripPlanOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DayPlanSchema = z.object({
  day: z.number().describe('The day number (e.g., 1, 2, 3).'),
  title: z.string().describe('A catchy title for the day\'s theme (e.g., "Historical Heart of the City", "Culinary Exploration").'),
  activities: z.array(z.string()).describe('A list of suggested activities, sights, or restaurants for the day.'),
});

const GenerateTripPlanInputSchema = z.object({
  destination: z.string().describe('The city or country to visit.'),
  lengthInDays: z.number().min(1).max(14).describe('The total number of days for the trip.'),
  interests: z.string().describe('Comma-separated interests (e.g., "art, food, history, hiking").'),
});
export type GenerateTripPlanInput = z.infer<typeof GenerateTripPlanInputSchema>;

const GenerateTripPlanOutputSchema = z.object({
  tripTitle: z.string().describe('An exciting title for the overall trip itinerary.'),
  summary: z.string().describe('A brief summary of the trip.'),
  plan: z.array(DayPlanSchema).describe('A day-by-day itinerary for the trip.'),
});
export type GenerateTripPlanOutput = z.infer<typeof GenerateTripPlanOutputSchema>;

export async function generateTripPlan(input: GenerateTripPlanInput): Promise<GenerateTripPlanOutput> {
  return generateTripPlanFlow(input);
}

const tripPlanPrompt = ai.definePrompt({
  name: 'generateTripPlanPrompt',
  input: {schema: GenerateTripPlanInputSchema},
  output: {schema: GenerateTripPlanOutputSchema},
  prompt: `You are an expert travel agent. Create a detailed, day-by-day itinerary for a trip based on the user's preferences.

Destination: {{{destination}}}
Trip Length: {{{lengthInDays}}} days
Interests: {{{interests}}}

Please generate:
1.  A catchy 'tripTitle' for the vacation.
2.  A brief 'summary' of the trip's focus.
3.  A 'plan' which is an array of daily schedules. For each day, provide:
    *   The 'day' number.
    *   A thematic 'title' for the day.
    *   A list of 'activities', including suggestions for sightseeing, dining, and experiences that are logically grouped by location and time of day (e.g., morning, afternoon, evening).

Ensure the plan is practical, exciting, and tailored to the user's interests.
`,
  config: {
    temperature: 0.7,
  },
});

const generateTripPlanFlow = ai.defineFlow(
  {
    name: 'generateTripPlanFlow',
    inputSchema: GenerateTripPlanInputSchema,
    outputSchema: GenerateTripPlanOutputSchema,
  },
  async (input) => {
    const {output} = await tripPlanPrompt(input);
    return output!;
  }
);
