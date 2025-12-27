import { NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { extractMessageContent } from '@/ai/flows/generate-content-drafts/parse';

export const runtime = 'nodejs';

type BrandPayload = {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  trimColor?: string;
  font?: string;
  artStyle?: string;
  logoUrl?: string;
};

type PromptPayload = {
  headline?: string;
  context?: string;
  watermark?: string;
  size?: string;
  brand?: BrandPayload | null;
  referenceImages?: string[];
};

export async function POST(request: Request) {
  let payload: PromptPayload | null = null;
  try {
    payload = (await request.json()) as PromptPayload;
  } catch (parseError) {
    console.error('Unable to parse image prompt payload', parseError);
  }

  if (!payload?.headline) {
    return NextResponse.json({ error: 'Headline is required' }, { status: 400 });
  }

  const referenceImages = Array.isArray(payload.referenceImages)
    ? payload.referenceImages.filter(Boolean)
    : [];
  const shouldUseGlm = referenceImages.length > 0;

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const glmKey = process.env.ZAI_API_KEY;
  if (shouldUseGlm && !glmKey) {
    return NextResponse.json(
      { error: 'Z.ai API key is not configured.' },
      { status: 500 }
    );
  }
  if (!shouldUseGlm && !openRouterKey) {
    return NextResponse.json(
      { error: 'OpenRouter API key is not configured.' },
      { status: 500 }
    );
  }

  const model = 'xiaomi/mimo-v2-flash:free';
  const brandInfo = payload.brand
    ? [
        payload.brand.name ? `Brand: ${payload.brand.name}.` : null,
        payload.brand.primaryColor
          ? `Primary color: ${payload.brand.primaryColor}.`
          : null,
        payload.brand.secondaryColor
          ? `Secondary color: ${payload.brand.secondaryColor}.`
          : null,
        payload.brand.trimColor ? `Trim color: ${payload.brand.trimColor}.` : null,
        payload.brand.font ? `Font: ${payload.brand.font}.` : null,
        payload.brand.artStyle ? `Art style: ${payload.brand.artStyle}.` : null,
        payload.brand.logoUrl ? `Logo URL: ${payload.brand.logoUrl}.` : null,
      ]
        .filter(Boolean)
        .join(' ')
    : 'Brand: none specified.';

  const prompt = [
    'You are an art director for marketing infographics.',
    'Write a single, vivid image-generation prompt that expands on the headline.',
    'The output MUST explicitly include the headline text and add descriptive detail to make the image more appealing.',
    'Incorporate context, branding, watermark, and size if provided.',
    'Avoid bullet points, markdown, and extraneous commentary.',
    `Headline: ${payload.headline}`,
    payload.context ? `Context: ${payload.context}` : '',
    payload.watermark ? `Watermark text: ${payload.watermark}` : '',
    payload.size ? `Output size: ${payload.size}` : '',
    brandInfo,
  ].join('\n');

  let response: Response;
  try {
    if (shouldUseGlm) {
      const imageParts = await buildImageParts(referenceImages.slice(0, 4));
      response = await fetch('https://api.z.ai/api/coding/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${glmKey}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'en-US,en',
        },
        body: JSON.stringify({
          model: 'GLM-4.6V',
          messages: [
            { role: 'system', content: 'Return plain text only.' },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                ...imageParts.map((imageUrl) => ({
                  type: 'image_url',
                  image_url: { url: imageUrl },
                })),
              ],
            },
          ],
          temperature: 0.6,
          stream: false,
        }),
      });
    } else {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://headlinegraphix.local',
          'X-Title': 'HeadlineGraphix',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Return plain text only.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
        }),
      });
    }
  } catch (error) {
    console.error(shouldUseGlm ? 'GLM request failed' : 'OpenRouter request failed', error);
    return NextResponse.json(
      { error: shouldUseGlm ? 'Unable to reach GLM.' : 'Unable to reach OpenRouter.' },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      shouldUseGlm ? 'GLM API error' : 'OpenRouter API error',
      response.status,
      errorText
    );
    return NextResponse.json(
      { error: shouldUseGlm ? 'GLM API error.' : 'OpenRouter API error.' },
      { status: 502 }
    );
  }

  const data = await response.json();
  if (data?.error) {
    console.error(
      shouldUseGlm ? 'GLM response error' : 'OpenRouter response error',
      data.error
    );
    return NextResponse.json(
      { error: shouldUseGlm ? 'GLM API error.' : 'OpenRouter API error.' },
      { status: 502 }
    );
  }

  const message = data?.choices?.[0]?.message;
  const result = extractMessageContent(message).trim();
  if (!result) {
    return NextResponse.json({ error: 'Empty prompt returned.' }, { status: 502 });
  }

  return NextResponse.json({ prompt: result });
}

async function buildImageParts(urls: string[]) {
  const results: string[] = [];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      const contentType = response.headers.get('content-type') ?? 'image/png';
      const buffer = Buffer.from(await response.arrayBuffer());
      const base64 = buffer.toString('base64');
      results.push(`data:${contentType};base64,${base64}`);
    } catch (error) {
      console.warn('Failed to load reference image', url, error);
    }
  }
  return results;
}
