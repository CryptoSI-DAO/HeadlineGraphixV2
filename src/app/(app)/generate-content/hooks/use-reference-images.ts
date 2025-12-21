import { useState } from 'react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { useToast } from '@/hooks/use-toast';

const mapArchiveImage = (image: any): ImagePlaceholder => ({
  id: image.id,
  imageUrl: image.imageUrl,
  description: image.description ?? 'Reference image',
  imageHint: image.aiHint ?? '',
});

export const useReferenceImages = ({
  initialReferenceImages,
  toast,
}: {
  initialReferenceImages: ImagePlaceholder[];
  toast: ReturnType<typeof useToast>['toast'];
}) => {
  const [referenceImages, setReferenceImages] = useState(initialReferenceImages);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoadingArchiveImages, setIsLoadingArchiveImages] = useState(false);

  const toggleReferenceImage = (imageUrl: string) => {
    setSelectedImages(prev =>
      prev.includes(imageUrl) ? prev.filter(url => url !== imageUrl) : [...prev, imageUrl]
    );
  };

  const fetchArchiveImages = async () => {
    setIsLoadingArchiveImages(true);
    try {
      const response = await fetch('/api/reference-images');
      if (!response.ok) {
        throw new Error('Unable to load reference images.');
      }
      const payload = await response.json();
      const images = Array.isArray(payload?.images) ? payload.images : [];
      if (images.length > 0) {
        setReferenceImages(images.map(mapArchiveImage));
      }
    } catch (error) {
      console.error('Failed to load reference images', error);
      toast({
        variant: 'destructive',
        title: 'Image Archive Unavailable',
        description: 'Unable to load your archived images. Please try again.',
      });
    } finally {
      setIsLoadingArchiveImages(false);
    }
  };

  return {
    referenceImages,
    selectedImages,
    isLoadingArchiveImages,
    toggleReferenceImage,
    fetchArchiveImages,
  };
};
