'use client';

import { useCallback, useEffect, useState } from 'react';

export type ReferenceImage = {
  id: string;
  imageUrl: string;
  description?: string;
  aiHint?: string;
  createdAt?: string;
};

type ReferenceImagesResponse = {
  images: ReferenceImage[];
  error?: string;
};

type UploadResult = {
  image: ReferenceImage;
  error?: string;
};

export function useReferenceImages() {
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reference-images', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load reference images');
      }
      const payload = (await response.json()) as ReferenceImagesResponse;
      setImages(payload.images ?? []);
    } catch (err) {
      console.error('Unable to fetch reference images', err);
      setError((err as Error).message);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const uploadImages = useCallback(
    async (files: File[], metadata?: { description?: string; aiHint?: string }) => {
      if (!files.length) {
        return [] as ReferenceImage[];
      }

      setIsUploading(true);
      setError(null);
      const uploaded: ReferenceImage[] = [];

      try {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          if (metadata?.description) {
            formData.append('description', metadata.description);
          }
          if (metadata?.aiHint) {
            formData.append('aiHint', metadata.aiHint);
          }

          const response = await fetch('/api/reference-images', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const payload = (await response.json()) as UploadResult;
          if (payload.image) {
            uploaded.push(payload.image);
          }
        }

        setImages((prev) => [...uploaded, ...prev]);
        return uploaded;
      } catch (err) {
        console.error('Unable to upload reference images', err);
        setError((err as Error).message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const deleteImage = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/reference-images/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reference image');
      }

      setImages((prev) => prev.filter((image) => image.id !== id));
    } catch (err) {
      console.error('Unable to delete reference image', err);
      setError((err as Error).message);
      throw err;
    }
  }, []);

  return {
    images,
    isLoading,
    isUploading,
    error,
    refresh: fetchImages,
    uploadImages,
    deleteImage,
  };
}
