'use server';

/**
 * @fileOverview A content draft generation AI agent.
 *
 * - generateContentDrafts - A function that handles the content draft generation process.
 * - GenerateContentDraftsInput - The input type for the generateContentDrafts function.
 * - GenerateContentDraftsOutput - The return type for the generateContentDrafts function.
 */

import {ai, isAiReady} from '@/ai/genkit';
import {z} from 'genkit';
import {extractArticleFromUrl} from '@/lib/article-extractor';

const MODEL_PROVIDERS = ['gemini', 'glm'] as const;
export type ContentModelProvider = typeof MODEL_PROVIDERS[number];

const GenerateContentDraftsInputSchema = z.object({
  headline: z.string().describe('The headline for which content needs to be generated.'),
  articleContent: z.string().describe('The full content of the article to be used as context.').optional(),
  articleUrl: z.string().url().describe('The URL of the original article.').optional(),
  includeBacklinks: z.boolean().describe('Whether to include backlinks in the content.').optional(),
  backlinkUrls: z.array(z.string().url()).describe('A list of backlink URLs to weave into the content.').optional(),
  brandTone: z.string().describe('The brand tone to use for the content.'),
  referenceImages: z
    .array(
      z.string().describe(
        'A reference image to guide the content generation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
      )
    )
    .optional(),
  userAngle: z.string().describe('The user-provided angle or focus for the content.'),
  modelProvider: z.enum(MODEL_PROVIDERS).default('gemini'),
});
export type GenerateContentDraftsInput = z.infer<typeof GenerateContentDraftsInputSchema>;

const GenerateContentDraftsOutputSchema = z.object({
  blogPost: z.string().describe('The generated blog post content in markdown format.'),
  linkedInPost: z.string().describe('The generated LinkedIn post content in markdown format.'),
  infographic: z.string().describe('The URL of a generated infographic image related to the content.'),
});
export type GenerateContentDraftsOutput = z.infer<typeof GenerateContentDraftsOutputSchema>;

export async function generateContentDrafts(input: GenerateContentDraftsInput): Promise<GenerateContentDraftsOutput> {
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
  console.info('OpenRouter generation completed', {elapsedMs});
  return ensureInfographicUrl(parsed, input.headline, {requireImagen: false});
}

async function generateContentDraftsWithGlm(input: GenerateContentDraftsInput): Promise<GenerateContentDraftsOutput> {
  const startedAt = Date.now();
  const enrichedInput = await maybeExpandArticleContent(input);
  const prompt = buildModelPrompt(enrichedInput);
  const glmResponse = await requestGlmCompletion(prompt);
  const parsed = parseModelResponse(glmResponse, 'GLM');
  const elapsedMs = Date.now() - startedAt;
  console.info('GLM generation completed', {elapsedMs});
  return ensureInfographicUrl(parsed, input.headline, {requireImagen: false});
}

function buildModelPrompt(input: GenerateContentDraftsInput) {
  const sections = [
    `Headline: ${input.headline}`,
    input.articleContent ? `Article Content (context):\n${input.articleContent}` : 'Article Content: (not provided)',
    `Brand Tone: ${input.brandTone}`,
    `User Angle: ${input.userAngle || 'None provided'}`,
  ];

  if (input.referenceImages && input.referenceImages.length > 0) {
    sections.push(
      `Reference image count: ${input.referenceImages.length}.`,
      'Reference images were provided to guide style and mood, but you cannot access binary data. Infer a cohesive visual direction based on the other inputs.'
    );
  }

  if (input.includeBacklinks && input.backlinkUrls && input.backlinkUrls.length > 0) {
    sections.push(
      `Include 2-3 relevant backlinks from this list: ${input.backlinkUrls.join(', ')}.`,
      'Weave backlinks naturally into the blog post using markdown links.',
      'Do not include backlinks in the LinkedIn post unless the user angle calls for it.'
    );
  } else {
    sections.push('Do not include any backlinks.');
  }

  sections.push(
    'Generate a markdown blog post and a markdown LinkedIn post that align with the tone and angle.',
    'The blog post must be fully self-contained. Do not reference the source article, the headline source, or any external post.',
    'If the headline or context implies a numbered list (e.g., Top 10), the blog post must include the complete list with all items.',
    'If the article content is missing list items, infer a plausible full list without referencing the source.',
    'Incorporate the user angle directly in the introduction and the closing call-to-action.',
    'Respond with a strict JSON object (no code fences, no YAML front matter, no explanations) that matches this schema: {"blogPost": string, "linkedInPost": string, "infographic": string}.',
    'Do not include titles, authors, or metadata outside the JSON fields.',
    'Set "infographic" to either a direct https URL for a relevant infographic or leave it as an empty string if you are unsure.'
  );

  return sections.join('\n\n');
}

async function maybeExpandArticleContent(input: GenerateContentDraftsInput): Promise<GenerateContentDraftsInput> {
  if (!input.articleUrl) {
    return input;
  }

  const existing = input.articleContent?.trim() ?? '';
  if (existing.length >= 800) {
    return input;
  }

  try {
    const extracted = await extractArticleFromUrl(input.articleUrl);
    if (!extracted.content || extracted.content.trim().length < 600) {
      return input;
    }
    return {
      ...input,
      articleContent: extracted.content,
    };
  } catch (error) {
    console.warn('Failed to fetch article content:', error);
    return input;
  }
}

async function requestOpenRouterCompletion(prompt: string) {
  const model = 'xiaomi/mimo-v2-flash:free';
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your environment to use MiMo V2 Flash.');
  }

  const controller = new AbortController();
  const timeoutMs = 90000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  console.info('OpenRouter request started', {model});

  let response: Response;
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://headlinegraphix.local',
        'X-Title': 'HeadlineGraphix',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        response_format: {type: 'json_object'},
        messages: [
          {
            role: 'system',
            content:
              'You are a marketing content generator. Always return valid JSON with blogPost, linkedInPost, and infographic fields. Blog and LinkedIn content must be markdown. Return JSON only with no extra text. Do not reference source articles.',
          },
          {role: 'user', content: prompt},
        ],
        temperature: 0.7,
      }),
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      throw new Error(`OpenRouter request timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }
    throw error;
  }
  const elapsedMs = Date.now() - startedAt;
  clearTimeout(timeoutId);
  console.info('OpenRouter response received', {elapsedMs, status: response.status, model});

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`OpenRouter API error: ${data.error.message ?? 'Unknown error'}`);
  }

  const message = data?.choices?.[0]?.message;
  const content = extractMessageContent(message);
  if (!content) {
    throw new Error('OpenRouter API returned an empty response.');
  }

  return content;
}

async function requestGlmCompletion(prompt: string) {
  const model = 'glm-4.5-air';
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    throw new Error('Z.ai API key is not configured. Set ZAI_API_KEY in your environment to use the GLM model.');
  }

  const controller = new AbortController();
  const timeoutMs = 90000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  console.info('GLM request started', {model});

  let response: Response;
  try {
    response = await fetch('https://api.z.ai/api/coding/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
        {
          role: 'system',
          content:
            'You are a marketing content generator. Always return valid JSON with blogPost, linkedInPost, and infographic fields. Blog and LinkedIn content must be markdown. Do not reference source articles.',
        },
          {role: 'user', content: prompt},
        ],
        temperature: 0.7,
        stream: false,
      }),
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      throw new Error(`GLM API request timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }
    throw error;
  }
  const elapsedMs = Date.now() - startedAt;
  clearTimeout(timeoutId);
  console.info('GLM response received', {elapsedMs, status: response.status, model});

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GLM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`GLM API error: ${data.error.message ?? 'Unknown error'}`);
  }

  const message = data?.choices?.[0]?.message;
  const content = extractMessageContent(message);
  if (!content) {
    throw new Error('GLM API returned an empty response.');
  }

  return content;
}

function extractMessageContent(message: any): string {
  if (!message) return '';
  const {content} = message;
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        return '';
      })
      .join('\n')
      .trim();
  }
  if (typeof content?.text === 'string') {
    return content.text;
  }
  return '';
}

function parseModelResponse(rawResponse: string, source: string): GenerateContentDraftsOutput {
  const jsonLike = extractJsonBlock(rawResponse);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonLike);
  } catch (error) {
    console.error(`Failed to parse ${source} response as JSON:`, error, rawResponse);
    throw new Error(`${source} returned an invalid response. Please try again.`);
  }

  const validated = GenerateContentDraftsOutputSchema.safeParse(parsed);
  if (!validated.success) {
    console.error(`${source} response failed validation:`, validated.error.flatten());
    throw new Error(`${source} returned data in an unexpected format.`);
  }

  return validated.data;
}

function extractJsonBlock(content: string) {
  const fenceRegex = /```(?:json)?([\s\S]*?)```/i;
  const fenced = content.match(fenceRegex);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return content.slice(start, end + 1);
  }

  return content;
}

async function ensureInfographicUrl(
  output: GenerateContentDraftsOutput,
  headline: string,
  {requireImagen}: {requireImagen: boolean}
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
