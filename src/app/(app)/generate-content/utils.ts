import type { ContentModelProvider } from '@/ai/flows/generate-content-drafts';

export const isGoogleNewsUrl = (url?: string | null) => {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'news.google.com' || hostname.endsWith('.news.google.com');
  } catch {
    return false;
  }
};

export const estimateForInput = ({
  provider,
  useFullArticle,
  articleContent,
  headline,
  userAngle,
}: {
  provider: ContentModelProvider;
  useFullArticle: 'yes' | 'no';
  articleContent: string;
  headline: string;
  userAngle: string;
}) => {
  const base = provider === 'glm' ? 18 : 14;
  const perChar = provider === 'glm' ? 0.004 : 0.003;
  const articleChars = useFullArticle === 'yes' ? articleContent.length : 0;
  const inputChars = headline.length + userAngle.length + articleChars;
  const imagePenalty = 8;
  const estimate = Math.round(base + inputChars * perChar + imagePenalty);
  return Math.max(8, Math.min(estimate, 120));
};

export const getBase64FromUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
