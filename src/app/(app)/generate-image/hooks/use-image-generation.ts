import { useState } from 'react';
import type { GenerateImageOutput } from '@/ai/flows/generate-image';
import { generateImage } from '@/ai/flows/generate-image';
import type { useToast } from '@/hooks/use-toast';

export const useImageGeneration = ({
  toast,
}: {
  toast: ReturnType<typeof useToast>['toast'];
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GenerateImageOutput | null>(null);

  const handleGenerate = async ({
    headline,
    content,
    brand,
  }: {
    headline: string;
    content: string;
    brand: string;
  }) => {
    if (!headline) {
      toast({
        variant: 'destructive',
        title: 'Headline is required',
        description: 'Please enter a headline to generate an image.',
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const result = await generateImage({
        prompt: `${headline}\n\n${content}`,
        brand,
      });
      setGeneratedImage(result);
      toast({
        title: 'Image Generated',
        description: 'Your new visual asset is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate image. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatedImage,
    handleGenerate,
    setGeneratedImage,
  };
};
