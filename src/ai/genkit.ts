import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { getMissingEnvVars, env } from '@/lib/env';

const missingEnvVars = getMissingEnvVars();
const aiUnavailableError =
  missingEnvVars.length > 0
    ? new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}. Check your .env.local file.`)
    : null;

export const ai = aiUnavailableError
  ? createDisabledGenkit(aiUnavailableError)
  : genkit({
      plugins: [googleAI({
        apiKey: env.GOOGLE_GENAI_API_KEY!,
      })],
      model: 'googleai/gemini-2.5-flash',
    });

// Provide a stub Genkit instance so that modules importing AI flows do not throw on load
function createDisabledGenkit(error: Error) {
  const throwError = async () => {
    throw error;
  };

  return {
    definePrompt: () => throwError,
    defineFlow: () => throwError,
    generate: throwError,
  } as unknown as ReturnType<typeof genkit>;
}

export const isAiReady = !aiUnavailableError;
export const aiError = aiUnavailableError;
