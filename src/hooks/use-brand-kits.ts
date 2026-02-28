'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { BrandKit } from '@/lib/data/types';
import {
  ALLOWED_LOGO_TYPES,
  MAX_BRAND_KITS,
  MAX_LOGO_SIZE_BYTES,
} from '@/lib/brand-kits';

export type BrandPreset = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  trimColor: string;
  font: string;
  artStyle: string;
  logoUrl: string;
  logoAlt: string;
};

type BrandKitsResponse = {
  brands: BrandKit[];
  error?: string;
};

type SaveResult = {
  brand: BrandKit;
  error?: string;
};

export function useBrandKits() {
  const { isSignedIn, session } = useAuth();
  const [brands, setBrands] = useState<BrandKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxSizeMb = Math.max(1, Math.round(MAX_LOGO_SIZE_BYTES / (1024 * 1024)));

  const fetchBrands = useCallback(async () => {
    if (!isSignedIn || !session?.access_token) {
      setBrands([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/brand-kits', {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load brand kits');
      }
      const payload = (await response.json()) as BrandKitsResponse;
      setBrands(payload.brands ?? []);
    } catch (err) {
      console.error('Unable to fetch brand kits', err);
      setError((err as Error).message);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, session?.access_token]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const saveBrand = useCallback(
    async (data: BrandPreset, logoFile?: File) => {
      if (!session?.access_token) {
        throw new Error('You must be signed in to save brands.');
      }

      // Check brand limit for new brands
      if (!data.id || data.id.startsWith('empty-')) {
        if (brands.length >= MAX_BRAND_KITS) {
          throw new Error(`You can only have ${MAX_BRAND_KITS} brands.`);
        }
      }

      // Validate logo file if provided
      if (logoFile) {
        if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
          throw new Error('Only JPG, PNG, or WebP images are supported.');
        }
        if (logoFile.size > MAX_LOGO_SIZE_BYTES) {
          throw new Error(`Logo must be ${maxSizeMb} MB or smaller.`);
        }
      }

      setIsSaving(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('primaryColor', data.primaryColor);
        formData.append('secondaryColor', data.secondaryColor);
        formData.append('trimColor', data.trimColor);
        formData.append('font', data.font);
        formData.append('artStyle', data.artStyle);
        if (data.logoAlt) {
          formData.append('logoAlt', data.logoAlt);
        }
        if (logoFile) {
          formData.append('logo', logoFile);
        }
        // Only include ID if it's a real brand (not an empty slot)
        if (data.id && !data.id.startsWith('empty-')) {
          formData.append('id', data.id);
        }

        const response = await fetch('/api/brand-kits', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          let message = 'Failed to save brand';
          try {
            const payload = (await response.json()) as SaveResult;
            if (payload?.error) {
              message = payload.error;
            }
          } catch (parseError) {
            console.warn('Unable to parse save response', parseError);
          }
          throw new Error(message);
        }

        const payload = (await response.json()) as SaveResult;
        if (payload.brand) {
          setBrands((prev) => {
            const existingIndex = prev.findIndex((b) => b.id === payload.brand.id);
            if (existingIndex >= 0) {
              // Update existing brand
              const updated = [...prev];
              updated[existingIndex] = payload.brand;
              return updated;
            } else {
              // Add new brand
              return [payload.brand, ...prev];
            }
          });
          return payload.brand;
        }
      } catch (err) {
        console.error('Unable to save brand kit', err);
        setError((err as Error).message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [brands.length, maxSizeMb, session?.access_token]
  );

  const deleteBrand = useCallback(async (id: string) => {
    if (!session?.access_token) {
      throw new Error('You must be signed in to delete brands.');
    }

    try {
      const response = await fetch(`/api/brand-kits/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        let message = 'Failed to delete brand';
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

      setBrands((prev) => prev.filter((brand) => brand.id !== id));
    } catch (err) {
      console.error('Unable to delete brand kit', err);
      setError((err as Error).message);
      throw err;
    }
  }, [session?.access_token]);

  // Convert BrandKit to BrandPreset for UI compatibility
  const presets: BrandPreset[] = brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    trimColor: brand.trimColor,
    font: brand.font,
    artStyle: brand.artStyle,
    logoUrl: brand.logoUrl ?? '',
    logoAlt: brand.logoAlt ?? '',
  }));

  return {
    brands,
    presets,
    isLoading,
    isSaving,
    error,
    refresh: fetchBrands,
    saveBrand,
    deleteBrand,
  };
}
