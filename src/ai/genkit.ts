import {genkit, GenkitPlugin} from 'genkit';

// Conditionally require the plugin only on the server-side.
// This prevents server-only dependencies like 'async_hooks' from being
// bundled into the client-side code, which was causing the build to fail.
const plugins: GenkitPlugin[] = [];
if (typeof window === 'undefined') {
  const {googleAI} = require('@genkit-ai/googleai');
  plugins.push(googleAI());
}

export const ai = genkit({
  plugins: plugins,
  model: 'googleai/gemini-2.0-flash',
});
