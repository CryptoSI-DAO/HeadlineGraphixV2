import type { GenerateContentDraftsInput } from './schemas';
import { extractArticleFromUrl } from '@/lib/article-extractor';

export async function maybeExpandArticleContent(
  input: GenerateContentDraftsInput
): Promise<GenerateContentDraftsInput> {
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
