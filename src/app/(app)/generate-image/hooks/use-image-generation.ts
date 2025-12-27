import { useState } from 'react';
import type { useToast } from '@/hooks/use-toast';

export const useImageGeneration = ({
  toast,
}: {
  toast: ReturnType<typeof useToast>['toast'];
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{ imageUrl: string } | null>(null);

  const handleGenerate = async ({
    prompt,
    size,
    referenceImages,
  }: {
    prompt: string;
    size?: string;
    referenceImages?: string[];
  }) => {
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Prompt is required',
        description: 'Please provide a prompt to generate an image.',
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/glm-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, size, referenceImages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? 'Failed to generate image.');
      }

      const result = (await response.json()) as { imageUrl?: string };
      if (!result.imageUrl) {
        throw new Error('No image URL returned.');
      }
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
