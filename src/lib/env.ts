/**
 * Environment variable validation for runtime
 */

const requiredEnvVars = {
  GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY,
} as const;

export function validateEnv() {
  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    console.error('Please check your .env.local file');
    return false;
  }
  
  return true;
}

// Export validated environment variables
export const env = requiredEnvVars;