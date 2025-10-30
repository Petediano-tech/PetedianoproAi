
'use server';
/**
 * @fileOverview AI-powered recipe generator.
 *
 * - generateRecipe - Generates a recipe from given ingredients.
 * - GenerateRecipeInput - Input type.
 * - GenerateRecipeOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated list of ingredients the user has.'),
  mealType: z.enum(['Any', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']).describe('The type of meal to generate.'),
  dietaryNeeds: z.string().optional().describe('Any dietary restrictions or preferences (e.g., "vegan", "gluten-free", "low-carb").'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  title: z.string().describe('A creative and descriptive title for the recipe.'),
  description: z.string().describe('A brief, enticing description of the dish.'),
  prepTime: z.string().describe('Estimated preparation time (e.g., "15 minutes").'),
  cookTime: z.string().describe('Estimated cooking time (e.g., "30 minutes").'),
  servings: z.string().describe('The number of servings the recipe makes.'),
  ingredients: z.array(z.string()).describe('A list of all ingredients required, including quantities.'),
  instructions: z.array(z.string()).describe('A step-by-step list of instructions to prepare the dish.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const recipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a creative chef. Generate a complete recipe based on the following user inputs.
The primary ingredients available are: {{{ingredients}}}. You can add common pantry staples (like oil, salt, pepper, flour, sugar, spices) if needed.

Meal Type: {{{mealType}}}
{{#if dietaryNeeds}}Dietary Needs: {{{dietaryNeeds}}}{{/if}}

Please generate a full recipe including:
1.  A creative and appealing title.
2.  A short, enticing description.
3.  Estimated prep time, cook time, and number of servings.
4.  A complete list of ingredients with measurements.
5.  Clear, step-by-step instructions.

Make the recipe sound delicious and easy to follow.
`,
  config: {
    temperature: 0.8,
  },
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async (input) => {
    const {output} = await recipePrompt(input);
    return output!;
  }
);
