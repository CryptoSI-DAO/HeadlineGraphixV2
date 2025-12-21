import { extractMessageContent } from './parse';

export async function requestGlmCompletion(prompt: string) {
  const model = 'glm-4.5-air';
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Z.ai API key is not configured. Set ZAI_API_KEY in your environment to use the GLM model.'
    );
  }

  const controller = new AbortController();
  const timeoutMs = 90000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  console.info('GLM request started', { model });

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
          { role: 'user', content: prompt },
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
  console.info('GLM response received', { elapsedMs, status: response.status, model });

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
