import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { validateEnv, env } from '@/lib/env';

// Validate environment variables on import
if (!validateEnv()) {
  throw new Error('Missing required environment variables. Check your .env.local file.');
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: env.GOOGLE_GENAI_API_KEY,
  })],
  model: 'googleai/gemini-2.5-flash',
});
