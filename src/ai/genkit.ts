
'use server';
import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
  logLevel: 'debug',
  enableTracing: true,
});

export function isGenkitError(
  error: any
): error is GenkitError<GenkitErrorCode> {
  return error instanceof Error && 'code' in error;
}
