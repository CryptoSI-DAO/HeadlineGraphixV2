import { useEffect, useMemo, useState } from 'react';
import type {
  ContentModelProvider,
  GenerateContentDraftsOutput,
} from '@/ai/flows/generate-content-drafts/index';
import { generateContentDrafts } from '@/ai/flows/generate-content-drafts/index';
import type { useToast } from '@/hooks/use-toast';
import { estimateForInput, getBase64FromUrl } from '../utils';

export const useGenerateContent = ({
  headline,
  articleContent,
  useFullArticle,
  resolvedArticleUrl,
  includeBacklinks,
  backlinkUrls,
  brandTone,
  selectedImages,
  userAngle,
  modelProvider,
  toast,
}: {
  headline: string;
  articleContent: string;
  useFullArticle: 'yes' | 'no';
  resolvedArticleUrl: string;
  includeBacklinks: boolean;
  backlinkUrls: string[];
  brandTone: string;
  selectedImages: string[];
  userAngle: string;
  modelProvider: ContentModelProvider;
  toast: ReturnType<typeof useToast>['toast'];
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<GenerateContentDraftsOutput | null>(null);
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState<number | null>(null);

  const inputEstimateSeconds = useMemo(
    () =>
      estimateForInput({
        provider: modelProvider,
        articleContent,
        useFullArticle,
        headline,
        userAngle,
      }),
    [modelProvider, articleContent, useFullArticle, headline, userAngle]
  );

  useEffect(() => {
    if (!isGenerating || generationStartedAt === null) {
      setElapsedSeconds(0);
      setEstimatedSeconds(null);
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - generationStartedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isGenerating, generationStartedAt]);

  useEffect(() => {
    if (!isGenerating) return;
    setEstimatedSeconds(inputEstimateSeconds);
  }, [isGenerating, inputEstimateSeconds]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setDrafts(null);
    setGenerationStartedAt(Date.now());

    try {
      console.log('DEBUG: Processing selected images:', selectedImages);
      const imageAsDataUrls = selectedImages.length > 0
        ? await Promise.all(selectedImages.map(async (url) => {
            console.log('DEBUG: Converting image to base64:', url);
            try {
              const result = await getBase64FromUrl(url);
              console.log('DEBUG: Successfully converted image to base64');
              return result;
            } catch (error) {
              console.error('DEBUG: Failed to convert image to base64:', error);
              throw error;
            }
          }))
        : [];

      setEstimatedSeconds(inputEstimateSeconds);
      const generatedDrafts = await generateContentDrafts({
        headline,
        articleContent:
          useFullArticle === 'yes' && articleContent.trim().length > 0
            ? articleContent
            : undefined,
        articleUrl: useFullArticle === 'yes' ? (resolvedArticleUrl || undefined) : undefined,
        includeBacklinks,
        backlinkUrls,
        brandTone,
        referenceImages: imageAsDataUrls.length > 0 ? imageAsDataUrls : undefined,
        userAngle,
        modelProvider,
      });

      setDrafts(generatedDrafts);
      toast({
        title: 'Drafts Generated',
        description: 'Your new content drafts are ready for review.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate content. Please try again.',
      });
    } finally {
      setIsGenerating(false);
      setGenerationStartedAt(null);
    }
  };

  return {
    drafts,
    setDrafts,
    isGenerating,
    elapsedSeconds,
    estimatedSeconds,
    inputEstimateSeconds,
    handleGenerate,
  };
};
