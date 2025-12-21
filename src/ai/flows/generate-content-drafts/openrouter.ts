import { extractMessageContent } from './parse';

export async function requestOpenRouterCompletion(prompt: string) {
  const model = 'xiaomi/mimo-v2-flash:free';
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your environment to use MiMo V2 Flash.'
    );
  }

  const controller = new AbortController();
  const timeoutMs = 90000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  console.info('OpenRouter request started', { model });

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
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a marketing content generator. Always return valid JSON with blogPost, linkedInPost, and infographic fields. Blog and LinkedIn content must be markdown. Return JSON only with no extra text. Do not reference source articles.',
          },
          { role: 'user', content: prompt },
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
  console.info('OpenRouter response received', { elapsedMs, status: response.status, model });

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
