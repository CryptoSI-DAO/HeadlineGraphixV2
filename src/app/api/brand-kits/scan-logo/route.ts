import { Buffer } from 'node:buffer';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { ALLOWED_LOGO_TYPES, MAX_LOGO_SIZE_BYTES } from '@/lib/brand-kits';
import { extractMessageContent } from '@/ai/flows/generate-content-drafts/parse';

export const runtime = 'nodejs';

const MODEL = 'GLM-4.6V';
const API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions';

async function getUserIdFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL || '', env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user.id;
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

function normalizeColor(value: unknown) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  if (!raw.startsWith('#') && /^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw}`;
  }
  return raw;
}

function pickColorsFromPalette(palette: any): string[] {
  if (!palette) return [];
  if (Array.isArray(palette)) {
    return palette.map(normalizeColor).filter(Boolean);
  }
  if (Array.isArray(palette?.colors)) {
    return palette.colors.map(normalizeColor).filter(Boolean);
  }
  return [];
}

function coerceScanResult(payload: any) {
  const paletteColors = pickColorsFromPalette(
    payload?.palette ?? payload?.colors ?? payload?.colorPalette ?? payload?.swatches
  );
  const primaryFromPalette = paletteColors[0] ?? '';
  const secondaryFromPalette = paletteColors[1] ?? '';
  const trimFromPalette = paletteColors[2] ?? '';

  const result = {
    brandName:
      typeof payload?.brandName === 'string'
        ? payload.brandName.trim()
        : typeof payload?.name === 'string'
        ? payload.name.trim()
        : '',
    primaryColor: normalizeColor(payload?.primaryColor ?? payload?.primary ?? primaryFromPalette),
    secondaryColor: normalizeColor(payload?.secondaryColor ?? payload?.secondary ?? secondaryFromPalette),
    trimColor: normalizeColor(payload?.trimColor ?? payload?.accent ?? trimFromPalette),
    font: typeof payload?.font === 'string' ? payload.font.trim() : '',
    artStyle: typeof payload?.artStyle === 'string' ? payload.artStyle.trim() : '',
  };

  if (
    !result.primaryColor ||
    !result.secondaryColor ||
    !result.trimColor ||
    !result.font ||
    !result.artStyle ||
    !result.brandName
  ) {
    return null;
  }

  return result;
}

async function requestLogoScan(imageBase64: string, imageType: string) {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Z.ai API key is not configured. Set ZAI_API_KEY in your environment to use the GLM model.'
    );
  }

  const controller = new AbortController();
  const timeoutMs = 90000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a brand designer. Analyze the provided logo and return JSON with brandName, primaryColor, secondaryColor, trimColor (hex values), font (font family name), and artStyle (short descriptive style). Return ONLY JSON.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract a 3-color palette, font family, and art style from this logo.' },
              {
                type: 'image_url',
                image_url: { url: `data:${imageType};base64,${imageBase64}` },
              },
            ],
          },
        ],
        temperature: 0.3,
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

  clearTimeout(timeoutId);

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

  const jsonLike = extractJsonBlock(content);
  let parsed: any;
  try {
    parsed = JSON.parse(jsonLike);
  } catch (error) {
    throw new Error('GLM returned an invalid response. Please try again.');
  }

  const result = coerceScanResult(parsed);
  if (!result) {
    throw new Error('GLM returned incomplete scan results.');
  }

  return { result, raw: content };
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const logoFile = formData.get('logo') as File | null;

    if (!logoFile) {
      return NextResponse.json({ error: 'Logo file is required.' }, { status: 400 });
    }

    if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
      return NextResponse.json({ error: 'Unsupported image type. Use JPEG, PNG, or WebP.' }, { status: 400 });
    }
    if (logoFile.size > MAX_LOGO_SIZE_BYTES) {
      const maxSizeMb = Math.max(1, Math.round(MAX_LOGO_SIZE_BYTES / (1024 * 1024)));
      return NextResponse.json({ error: `Logo must be ${maxSizeMb}MB or smaller.` }, { status: 400 });
    }

    const buffer = Buffer.from(await logoFile.arrayBuffer());
    const imageBase64 = buffer.toString('base64');

    const { result, raw } = await requestLogoScan(imageBase64, logoFile.type);
    const debug = new URL(request.url).searchParams.get('debug') === '1';
    return NextResponse.json(debug ? { result, raw } : { result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to scan logo.';
    console.error('Failed to scan logo', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
