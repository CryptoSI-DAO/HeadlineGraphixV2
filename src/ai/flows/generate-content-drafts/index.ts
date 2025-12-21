'use server';

/**
 * @fileOverview A content draft generation AI agent.
 *
 * - generateContentDrafts - A function that handles the content draft generation process.
 * - GenerateContentDraftsInput - The input type for the generateContentDrafts function.
 * - GenerateContentDraftsOutput - The return type for the generateContentDrafts function.
 */

import type {
  GenerateContentDraftsInput,
  GenerateContentDraftsOutput,
} from './schemas';
import { GenerateContentDraftsInputSchema, MODEL_PROVIDERS } from './schemas';
import { buildModelPrompt } from './prompt';
import { maybeExpandArticleContent } from './article';
import { requestOpenRouterCompletion } from './openrouter';
import { requestGlmCompletion } from './glm';
import { parseModelResponse } from './parse';
import { ensureInfographicUrl } from './infographic';

export type {
  ContentModelProvider,
  GenerateContentDraftsInput,
  GenerateContentDraftsOutput,
} from './schemas';

export async function generateContentDrafts(
  input: GenerateContentDraftsInput
): Promise<GenerateContentDraftsOutput> {
  const normalizedInput = GenerateContentDraftsInputSchema.parse(input);
  if (normalizedInput.modelProvider === 'glm') {
    return generateContentDraftsWithGlm(normalizedInput);
  }
  return generateContentDraftsWithOpenRouter(normalizedInput);
}

async function generateContentDraftsWithOpenRouter(
  input: GenerateContentDraftsInput
): Promise<GenerateContentDraftsOutput> {
  const startedAt = Date.now();
  const enrichedInput = await maybeExpandArticleContent(input);
  const prompt = buildModelPrompt(enrichedInput);
  const response = await requestOpenRouterCompletion(prompt);
  const parsed = parseModelResponse(response, 'OpenRouter');
  const elapsedMs = Date.now() - startedAt;
  console.info('OpenRouter generation completed', { elapsedMs });
  return ensureInfographicUrl(parsed, input.headline, { requireImagen: false });
}

async function generateContentDraftsWithGlm(
  input: GenerateContentDraftsInput
): Promise<GenerateContentDraftsOutput> {
  const startedAt = Date.now();
  const enrichedInput = await maybeExpandArticleContent(input);
  const prompt = buildModelPrompt(enrichedInput);
  const glmResponse = await requestGlmCompletion(prompt);
  const parsed = parseModelResponse(glmResponse, 'GLM');
  const elapsedMs = Date.now() - startedAt;
  console.info('GLM generation completed', { elapsedMs });
  return ensureInfographicUrl(parsed, input.headline, { requireImagen: false });
}

export { MODEL_PROVIDERS };
