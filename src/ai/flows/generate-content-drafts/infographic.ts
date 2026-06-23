import type { GenerateContentDraftsOutput } from './schemas';

/**
 * Ensures the output has an infographic URL.
 *
 * Previously this used Google Imagen via Genkit to auto-generate infographics.
 * Genkit has been removed from the project. The infographic image is now either
 * provided by the upstream model response, or falls back to a placeholder.
 */
export async function ensureInfographicUrl(
  output: GenerateContentDraftsOutput,
  headline: string,
  _opts: { requireImagen: boolean }
): Promise<GenerateContentDraftsOutput> {
  if (output.infographic && output.infographic.startsWith('http')) {
    return output;
  }

  output.infographic = buildFallbackInfographicUrl(headline);
  return output;
}

function buildFallbackInfographicUrl(headline: string) {
  const truncated = headline.slice(0, 40) || 'Infographic';
  return `https://placehold.co/800x1200?text=${encodeURIComponent(truncated)}`;
}
