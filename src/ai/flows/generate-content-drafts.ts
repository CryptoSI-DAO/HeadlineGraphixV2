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

const MODEL_PROVIDERS = ['gemini', 'glm'] as const;
export type ContentModelProvider = typeof MODEL_PROVIDERS[number];

const GenerateContentDraftsInputSchema = z.object({
  headline: z.string().describe('The headline for which content needs to be generated.'),
  articleContent: z.string().describe('The full content of the article to be used as context.').optional(),
  brandTone: z.string().describe('The brand tone to use for the content.'),
  referenceImage: z
    .string()
    .describe(
      'A reference image to guide the content generation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ).optional(),
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
  return generateContentDraftsFlow(normalizedInput);
}

const prompt = ai.definePrompt({
  name: 'generateContentDraftsPrompt',
  input: {schema: GenerateContentDraftsInputSchema},
  output: {schema: GenerateContentDraftsOutputSchema},
  prompt: `You are a content creation expert. Generate a blog post and a LinkedIn post based on the following information for the headline: {{{headline}}}.

  {{#if articleContent}}
  Use the following article as the primary source of information:
  {{{articleContent}}}
  {{/if}}

  Incorporate the following brand tone: {{{brandTone}}}.
  Incorporate the following angle provided by the user: {{{userAngle}}}.

  {{#if referenceImage}}
  Consider the following reference image: {{media url=referenceImage}}
  {{/if}}

  The blog post should be in markdown format.
  The LinkedIn post should be shorter and also in markdown format.
  Also generate a URL for a infographic image related to the content.
  Output the infographic image as a URL.
`,
});

const generateContentDraftsFlow = ai.defineFlow(
  {
    name: 'generateContentDraftsFlow',
    inputSchema: GenerateContentDraftsInputSchema,
    outputSchema: GenerateContentDraftsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The model did not return a response. Please try again.");
    }

    return ensureInfographicUrl(output, input.headline, {requireImagen: true});
  }
);

async function generateContentDraftsWithGlm(input: GenerateContentDraftsInput): Promise<GenerateContentDraftsOutput> {
  const prompt = buildGlmPrompt(input);
  const glmResponse = await requestGlmCompletion(prompt);
  const parsed = parseGlmResponse(glmResponse);
  return ensureInfographicUrl(parsed, input.headline, {requireImagen: false});
}

function buildGlmPrompt(input: GenerateContentDraftsInput) {
  const sections = [
    `Headline: ${input.headline}`,
    input.articleContent ? `Article Content (context):\n${input.articleContent}` : 'Article Content: (not provided)',
    `Brand Tone: ${input.brandTone}`,
    `User Angle: ${input.userAngle || 'None provided'}`,
  ];

  if (input.referenceImage) {
    sections.push('A reference image was provided to guide style and mood, but you cannot access binary data. Infer a cohesive visual direction based on the other inputs.');
  }

  sections.push(
    'Generate a markdown blog post and a markdown LinkedIn post that align with the tone and angle.',
    'Respond with a strict JSON object (no code fences, no explanations) that matches this schema: {"blogPost": string, "linkedInPost": string, "infographic": string}.',
    'Set "infographic" to either a direct https URL for a relevant infographic or leave it as an empty string if you are unsure.'
  );

  return sections.join('\n\n');
}

async function requestGlmCompletion(prompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your environment to use the free GLM model.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://headlinegraphix.local',
      'X-Title': 'HeadlineGraphix',
    },
    body: JSON.stringify({
      model: 'zhipu/glm-4.5-air',
      messages: [
        {
          role: 'system',
          content:
            'You are a marketing content generator. Always return valid JSON with blogPost, linkedInPost, and infographic fields. Blog and LinkedIn content must be markdown.',
        },
        {role: 'user', content: prompt},
      ],
      temperature: 0.7,
    }),
  });

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

function parseGlmResponse(rawResponse: string): GenerateContentDraftsOutput {
  const jsonLike = extractJsonBlock(rawResponse);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonLike);
  } catch (error) {
    console.error('Failed to parse GLM response as JSON:', error, rawResponse);
    throw new Error('GLM returned an invalid response. Please try again.');
  }

  const validated = GenerateContentDraftsOutputSchema.safeParse(parsed);
  if (!validated.success) {
    console.error('GLM response failed validation:', validated.error.flatten());
    throw new Error('GLM returned data in an unexpected format.');
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
