import { NextResponse } from 'next/server';
import { extractMessageContent } from '@/ai/flows/generate-content-drafts/parse';

type SummaryPayload = {
  headline?: string;
  context?: string;
};

export async function POST(request: Request) {
  let payload: SummaryPayload | null = null;
  try {
    payload = (await request.json()) as SummaryPayload;
  } catch (parseError) {
    console.error('Unable to parse image summary payload', parseError);
  }

  if (!payload?.headline) {
    return NextResponse.json({ error: 'Headline is required' }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenRouter API key is not configured.' },
      { status: 500 }
    );
  }

  const model = 'xiaomi/mimo-v2-flash:free';
  const prompt = [
    'You are an art director for marketing infographics.',
    'Write 1-2 concise sentences describing what the image should depict for the headline.',
    'Mention key subjects, scene, and visual elements. Do not use bullet points or markdown.',
    `Headline: ${payload.headline}`,
    payload.context ? `Context: ${payload.context}` : '',
  ].join('\n');

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
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Return plain text only with no extra formatting.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
      }),
    });
  } catch (error) {
    console.error('OpenRouter request failed', error);
    return NextResponse.json({ error: 'Unable to reach OpenRouter.' }, { status: 502 });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error', response.status, errorText);
    return NextResponse.json({ error: 'OpenRouter API error.' }, { status: 502 });
  }

  const data = await response.json();
  if (data?.error) {
    console.error('OpenRouter response error', data.error);
    return NextResponse.json({ error: 'OpenRouter API error.' }, { status: 502 });
  }

  const message = data?.choices?.[0]?.message;
  const summary = extractMessageContent(message).trim();
  if (!summary) {
    return NextResponse.json({ error: 'Empty summary returned.' }, { status: 502 });
  }

  return NextResponse.json({ summary });
}
