/**
 * Environment variable validation for runtime
 */

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_BACKEND_URL: process.env.SUPABASE_BACKEND_URL,
} as const;

export function getMissingEnvVars() {
  return Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
}

export function validateEnv() {
  const missing = getMissingEnvVars();

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    console.error('Please check your .env.local file');
    return false;
  }
  
  return true;
}

// Export validated environment variables
export const env = requiredEnvVars;
