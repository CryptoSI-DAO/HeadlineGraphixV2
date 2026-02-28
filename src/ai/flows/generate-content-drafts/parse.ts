import { GenerateContentDraftsOutputSchema, type GenerateContentDraftsOutput } from './schemas';

export function extractMessageContent(message: any): string {
  if (!message) return '';
  const { content } = message;
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

export function parseModelResponse(
  rawResponse: string,
  source: string
): GenerateContentDraftsOutput {
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
