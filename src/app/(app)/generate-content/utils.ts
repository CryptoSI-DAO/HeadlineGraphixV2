import type { ContentModelProvider } from '@/ai/flows/generate-content-drafts/index';

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
  console.log('DEBUG: Fetching image from URL:', url);
  try {
    const response = await fetch(url);
    console.log('DEBUG: Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('DEBUG: Blob size:', blob.size, 'type:', blob.type);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('DEBUG: Successfully converted to base64');
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        console.error('DEBUG: FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('DEBUG: Error in getBase64FromUrl:', error);
    throw error;
  }
};
