'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ALLOWED_REFERENCE_IMAGE_TYPES,
  MAX_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGE_SIZE_BYTES,
} from '@/lib/reference-images';

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
  const { isSignedIn, session } = useAuth();
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxSizeMb = useMemo(
    () => Math.max(1, Math.round(MAX_REFERENCE_IMAGE_SIZE_BYTES / (1024 * 1024))),
    []
  );

  const fetchImages = useCallback(async () => {
    if (!isSignedIn || !session?.access_token) {
      setImages([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reference-images', {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
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
  }, [isSignedIn, session?.access_token]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const uploadImages = useCallback(
    async (files: File[], metadata?: { description?: string; aiHint?: string }) => {
      if (!files.length) {
        return [] as ReferenceImage[];
      }

      if (!session?.access_token) {
        throw new Error('You must be signed in to upload images.');
      }

      const remainingSlots = MAX_REFERENCE_IMAGES - images.length;
      if (files.length > remainingSlots) {
        throw new Error(`You can only store ${MAX_REFERENCE_IMAGES} images. Remove some first.`);
      }

      const invalidType = files.find((file) => !ALLOWED_REFERENCE_IMAGE_TYPES.includes(file.type));
      if (invalidType) {
        throw new Error('Only JPG, PNG, GIF, or WebP images are supported.');
      }

      const oversized = files.find((file) => file.size > MAX_REFERENCE_IMAGE_SIZE_BYTES);
      if (oversized) {
        throw new Error(`Images must be ${maxSizeMb} MB or smaller.`);
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
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            let message = 'Failed to upload image';
            try {
              const payload = (await response.json()) as UploadResult;
              if (payload?.error) {
                message = payload.error;
              }
            } catch (parseError) {
              console.warn('Unable to parse upload response', parseError);
            }
            throw new Error(message);
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
    [images.length, maxSizeMb, session?.access_token]
  );

  const deleteImage = useCallback(async (id: string) => {
    if (!session?.access_token) {
      throw new Error('You must be signed in to delete images.');
    }

    try {
      const response = await fetch(`/api/reference-images/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        let message = 'Failed to delete reference image';
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload?.error) {
            message = payload.error;
          }
        } catch (parseError) {
          console.warn('Unable to parse delete response', parseError);
        }
        throw new Error(message);
      }

      setImages((prev) => prev.filter((image) => image.id !== id));
    } catch (err) {
      console.error('Unable to delete reference image', err);
      setError((err as Error).message);
      throw err;
    }
  }, [session?.access_token]);

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
