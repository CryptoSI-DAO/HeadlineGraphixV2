import { ai, isAiReady } from '@/ai/genkit';
import type { GenerateContentDraftsOutput } from './schemas';

export async function ensureInfographicUrl(
  output: GenerateContentDraftsOutput,
  headline: string,
  { requireImagen }: { requireImagen: boolean }
): Promise<GenerateContentDraftsOutput> {
  if (output.infographic && output.infographic.startsWith('http')) {
    return output;
  }

  if (isAiReady) {
    try {
      const imageResponse = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `An infographic about: ${headline}. Style: Clean, modern, professional.`,
      });
      const responseMedia = imageResponse.media;
      const mediaPart = Array.isArray(responseMedia) ? responseMedia[0] : responseMedia;
      if (mediaPart?.url) {
        output.infographic = mediaPart.url;
        return output;
      }
    } catch (error) {
      if (requireImagen) {
        throw new Error('Unable to generate infographic image URL.');
      }
      console.error('Unable to generate infographic with Imagen:', error);
    }

    if (requireImagen) {
      throw new Error('Unable to generate infographic image URL.');
    }
  }

  output.infographic = buildFallbackInfographicUrl(headline);
  return output;
}

function buildFallbackInfographicUrl(headline: string) {
  const truncated = headline.slice(0, 40) || 'Infographic';
  return `https://placehold.co/800x1200?text=${encodeURIComponent(truncated)}`;
}
