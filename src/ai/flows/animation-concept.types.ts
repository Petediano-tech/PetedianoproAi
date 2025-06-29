
import { z } from 'genkit';

export const animeStyles = ['Vibrant Shonen', 'Elegant Shojo', 'Chibi/Kawaii', 'Classic 90s', 'Dark Fantasy', 'Cyberpunk', 'Studio Ghibli-esque'] as const;
export const availableVoices = {
  'achernar': 'Achernar', 'algenib': 'Algenib', 'gacrux': 'Gacrux', 'rasalgethi': 'Rasalgethi', 'schedar': 'Schedar', 'sulafat': 'Sulafat', 'zubenelgenubi': 'Zubenelgenubi', 'charon': 'Charon', 'puck': 'Puck',
  'aoede': 'Aoede', 'leda': 'Leda', 'callirrhoe': 'Callirrhoe', 'autonoe': 'Autonoe', 'erinome': 'Erinome', 'kore': 'Kore'
} as const;
const voiceEnum = z.enum(Object.keys(availableVoices) as [keyof typeof availableVoices, ...(keyof typeof availableVoices)[]]);
export type VoiceKey = keyof typeof availableVoices;

// Input for the initial text generation
export const GenerateAnimationConceptTextInputSchema = z.object({
  prompt: z.string().describe('The main idea or scene for the story.'),
  style: z.enum(animeStyles).default('Vibrant Shonen').describe('The desired anime art style (will be used later for image generation).'),
  language: z.string().optional().default('English').describe('The language for the story text and narration.'),
});
export type GenerateAnimationConceptTextInput = z.infer<typeof GenerateAnimationConceptTextInputSchema>;

// The output structure for the text generation step
const StoryPageTextSchema = z.object({
  text: z.string().describe('The narrative text for this scene.'),
  sceneDescription: z.string().describe('The original, brief scene description this text was based on.'),
});
export const GenerateAnimationConceptTextOutputSchema = z.object({
  title: z.string().describe('A catchy title for the story.'),
  pages: z.array(StoryPageTextSchema),
});
export type GenerateAnimationConceptTextOutput = z.infer<typeof GenerateAnimationConceptTextOutputSchema>;

// Schemas for on-demand image and audio generation
export const GenerateImageForSceneInputSchema = z.object({
  sceneDescription: z.string().describe('The brief description for the scene to be visualized.'),
  style: z.enum(animeStyles).describe('The desired anime art style.'),
});
export type GenerateImageForSceneInput = z.infer<typeof GenerateImageForSceneInputSchema>;
export const GenerateImageForSceneOutputSchema = z.object({ imageUrl: z.string() });
export type GenerateImageForSceneOutput = z.infer<typeof GenerateImageForSceneOutputSchema>;

export const GenerateAudioForSceneInputSchema = z.object({
  text: z.string().describe('The narrative text to be converted to speech.'),
  voice: voiceEnum.describe('The desired voice for the narration.'),
});
export type GenerateAudioForSceneInput = z.infer<typeof GenerateAudioForSceneInputSchema>;
export const GenerateAudioForSceneOutputSchema = z.object({ audioUrl: z.string() });
export type GenerateAudioForSceneOutput = z.infer<typeof GenerateAudioForSceneOutputSchema>;
