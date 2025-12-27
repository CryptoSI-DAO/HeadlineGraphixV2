import { NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';

export const runtime = 'nodejs';

type GenerateImagePayload = {
  prompt?: string;
  size?: string;
  referenceImages?: string[];
};

export async function POST(request: Request) {
  let payload: GenerateImagePayload | null = null;
  try {
    payload = (await request.json()) as GenerateImagePayload;
  } catch (parseError) {
    console.error('Unable to parse GLM image payload', parseError);
  }

  if (!payload?.prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const apiKeySources = [
    'OPENAI_API_KEY',
    'OPENAI_KEY',
    'OPENAI_TOKEN',
    'OPENAI_IMAGE_API_KEY',
    'OPENROUTER_API_KEY',
    'ZAI_API_KEY',
    'GOOGLE_GENAI_API_KEY',
  ] as const;
  const apiKey = apiKeySources
    .map((key) => process.env[key])
    .find((value) => Boolean(value));
  const keySource = apiKeySources.find((key) => process.env[key]);
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured.' },
      { status: 500 }
    );
  }
  if (keySource && !keySource.startsWith('OPENAI')) {
    console.warn(`OpenAI image generation using key from ${keySource}.`);
  }

  const referenceImages = Array.isArray(payload.referenceImages)
    ? payload.referenceImages.filter(Boolean)
    : [];
  let response: Response;
  try {
    if (referenceImages.length > 0) {
      const formData = new FormData();
      formData.append('model', 'gpt-image-1.5');
      formData.append('prompt', payload.prompt);
      formData.append('quality', 'medium');
      if (payload.size) {
        formData.append('size', payload.size);
      }

      let attachedCount = 0;
      for (const [index, url] of referenceImages.entries()) {
        try {
          const imageResponse = await fetch(url);
          if (!imageResponse.ok) {
            continue;
          }
          const contentType = imageResponse.headers.get('content-type') ?? 'image/png';
          const buffer = Buffer.from(await imageResponse.arrayBuffer());
          const blob = new Blob([buffer], { type: contentType });
          formData.append('image[]', blob, `reference-${index}.png`);
          attachedCount += 1;
        } catch (error) {
          console.warn('Failed to load reference image', url, error);
        }
      }

      if (attachedCount === 0) {
        response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1.5',
            prompt: payload.prompt,
            quality: 'medium',
            size: payload.size,
            n: 1,
          }),
        });
      } else {
        response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        });
      }
    } else {
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1.5',
          prompt: payload.prompt,
          quality: 'medium',
          size: payload.size,
          n: 1,
        }),
      });
    }
  } catch (error) {
    console.error('OpenAI image request failed', error);
    return NextResponse.json({ error: 'Unable to reach OpenAI image API.' }, { status: 502 });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI image API error', response.status, errorText);
    return NextResponse.json(
      { error: 'OpenAI image API error.', details: errorText },
      { status: 502 }
    );
  }

  const data = await response.json();
  if (data?.error) {
    console.error('OpenAI image response error', data.error);
    return NextResponse.json(
      { error: 'OpenAI image API error.', details: data.error },
      { status: 502 }
    );
  }

  const image = data?.data?.[0];
  const imageUrl =
    typeof image?.url === 'string'
      ? image.url
      : typeof image?.b64_json === 'string'
      ? `data:image/png;base64,${image.b64_json}`
      : '';

  if (!imageUrl) {
    return NextResponse.json({ error: 'No image returned by OpenAI.' }, { status: 502 });
  }

  return NextResponse.json({ imageUrl });
}
