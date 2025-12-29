'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { useBrandKits } from '@/hooks/use-brand-kits';
import { brandTones, imageSizeOptions } from './constants';
import { ImageArchiveDialog, ImageConfigPanel, ImageReviewPanel } from './components';
import { useReferenceImages as useReferenceArchive } from '@/hooks/use-reference-images';
import { useImageGeneration, useReferenceImages as useReferenceSlots } from './hooks';

function GenerateImagePageInner() {
  const { toast } = useToast();
  const { preferences } = useUserPreferences();
  const searchParams = useSearchParams();
  const prefilledHeadline = searchParams.get('headline');
  const prefilledContext = searchParams.get('context');
  const { presets: brandPresets, isLoading: isLoadingBrands } = useBrandKits();

  const [brand, setBrand] = useState(brandTones[0]);
  const [headline, setHeadline] = useState(prefilledHeadline ?? '');
  const [content, setContent] = useState('');
  const [watermark, setWatermark] = useState('');
  const [imageSize, setImageSize] = useState('square');
  const [useCustomBranding, setUseCustomBranding] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#93C5FD');
  const [trimColor, setTrimColor] = useState('#E5E7EB');
  const [font, setFont] = useState('Inter');
  const [artStyle, setArtStyle] = useState('Minimalist');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [fullPrompt, setFullPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [promptModelLabel, setPromptModelLabel] = useState('MiMo V2 Flash');

  const {
    referenceImages,
    isModalOpen,
    setIsModalOpen,
    openModal,
    handleSelectFromArchive,
    handleRemoveImage,
  } = useReferenceSlots(4);
  const {
    images: archiveImages,
    isLoading: isArchiveLoading,
    isUploading: isArchiveUploading,
    uploadImages,
  } = useReferenceArchive();
  const {
    isGenerating: isGeneratingImage,
    generatedImage,
    handleGenerate,
  } = useImageGeneration({ toast });

  useEffect(() => {
    if (prefilledHeadline) {
      setHeadline(prefilledHeadline);
    }
  }, [prefilledHeadline]);

  useEffect(() => {
    if (brandPresets.length === 0) {
      return;
    }
    const presetNames = brandPresets.map((preset) => preset.name);
    if (brand !== 'None' && !presetNames.includes(brand)) {
      setBrand(presetNames[0]);
    }
  }, [brandPresets, brand]);

  useEffect(() => {
    if (brand !== 'None' && useCustomBranding) {
      setUseCustomBranding(false);
    }
  }, [brand, useCustomBranding]);

  useEffect(() => {
    const context = prefilledContext?.trim();
    if (!prefilledHeadline || !context || content.trim().length > 0) {
      return;
    }
    setIsSummarizing(true);
    fetch('/api/image-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ headline: prefilledHeadline, context }),
    })
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error ?? 'Failed to generate summary.');
        }
        return response.json() as Promise<{ summary?: string }>;
      })
      .then(data => {
        if (data.summary) {
          setContent(data.summary);
        }
      })
      .catch(error => {
        console.error('Auto summary failed', error);
        toast({
          variant: 'destructive',
          title: 'Summary Failed',
          description: error instanceof Error ? error.message : 'Please try again.',
        });
      })
      .finally(() => {
        setIsSummarizing(false);
      });
  }, [prefilledHeadline, prefilledContext, content, toast]);

  const handleSummarize = async () => {
    if (!headline.trim()) {
      toast({
        variant: 'destructive',
        title: 'Headline is required',
        description: 'Please enter a headline before generating a summary.',
      });
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch('/api/image-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headline,
          context: content.trim().length > 0 ? content : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? 'Failed to generate summary.');
      }

      const data = (await response.json()) as { summary?: string };
      if (!data.summary) {
        throw new Error('No summary returned.');
      }

      setContent(data.summary);
    } catch (error) {
      console.error('Summary generation failed', error);
      toast({
        variant: 'destructive',
        title: 'Summary Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const onGenerate = () => {
    if (!headline.trim()) {
      toast({
        variant: 'destructive',
        title: 'Headline is required',
        description: 'Please enter a headline to generate a prompt.',
      });
      return;
    }

    const hasReferenceImages = referenceImages.some(Boolean);
    const modelLabel = hasReferenceImages ? 'GLM-4.6V' : 'MiMo V2 Flash';
    setPromptModelLabel(modelLabel);
    setIsGeneratingPrompt(true);
    const selectedSize = imageSizeOptions.find((option) => option.id === imageSize);
    fetch('/api/image-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        headline,
        context: content.trim().length > 0 ? content.trim() : undefined,
        watermark: watermark.trim().length > 0 ? watermark.trim() : undefined,
        size: selectedSize
          ? `${selectedSize.label} (${selectedSize.dims})`
          : imageSize,
        referenceImages: referenceImages.filter(Boolean),
        brand:
          brand === 'None'
            ? useCustomBranding
              ? {
                  primaryColor,
                  secondaryColor,
                  trimColor,
                  font,
                  artStyle,
                  name: 'Custom',
                }
              : null
            : selectedBrandPreset
            ? {
                name: selectedBrandPreset.name,
                primaryColor: selectedBrandPreset.primaryColor,
                secondaryColor: selectedBrandPreset.secondaryColor,
                trimColor: selectedBrandPreset.trimColor,
                font: selectedBrandPreset.font,
                artStyle: selectedBrandPreset.artStyle,
                logoUrl: selectedBrandPreset.logoUrl || undefined,
              }
            : { name: brand },
      }),
    })
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error ?? 'Failed to generate prompt.');
        }
        return response.json() as Promise<{ prompt?: string }>;
      })
      .then(data => {
        if (data.prompt) {
          setFullPrompt(data.prompt);
        }
      })
      .catch(error => {
        console.error('Prompt generation failed', error);
        toast({
          variant: 'destructive',
          title: 'Prompt Failed',
          description: error instanceof Error ? error.message : 'Please try again.',
        });
      })
      .finally(() => {
        setIsGeneratingPrompt(false);
      });
  };

  const onGenerateImage = () => {
    if (!fullPrompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt is required',
        description: 'Generate a prompt before creating an image.',
      });
      return;
    }

    const selectedSize = imageSizeOptions.find((option) => option.id === imageSize);
    handleGenerate({
      prompt: fullPrompt.trim(),
      size: selectedSize?.dims,
      referenceImages: referenceImages.filter(Boolean),
    });
  };

  const handleSaveGeneratedImage = async () => {
    if (!generatedImage?.imageUrl) {
      toast({
        variant: 'destructive',
        title: 'No image to save',
        description: 'Generate an image before saving to the archive.',
      });
      return;
    }

    try {
      const { imageUrl } = generatedImage;
      let blob: Blob;
      if (imageUrl.startsWith('data:')) {
        const [header, base64] = imageUrl.split(',');
        const mime = header.match(/data:(.*);base64/)?.[1] ?? 'image/png';
        const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
        blob = new Blob([bytes], { type: mime });
      } else {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error('Failed to download image.');
        }
        blob = await response.blob();
      }

      const file = new File([blob], `generated-${Date.now()}.png`, { type: blob.type || 'image/png' });
      await uploadImages([file]);
      toast({
        title: 'Saved to Archive',
        description: 'The generated image is now in your reference archive.',
      });
    } catch (error) {
      console.error('Failed to save generated image', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const handleDownloadGeneratedImage = async () => {
    if (!generatedImage?.imageUrl) {
      return;
    }
    const link = document.createElement('a');
    if (generatedImage.imageUrl.startsWith('data:')) {
      link.href = generatedImage.imageUrl;
      link.download = `generated-${Date.now()}.png`;
      link.click();
      return;
    }
    try {
      const response = await fetch(generatedImage.imageUrl);
      if (!response.ok) {
        throw new Error('Failed to download image.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `generated-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const baseBrandOptions =
    brandPresets.length > 0 ? brandPresets.map((preset) => preset.name) : brandTones;
  const brandOptions = ['None', ...baseBrandOptions];
  const selectedBrandPreset = brandPresets.find((preset) => preset.name === brand) ?? null;
  const watermarkOptions = preferences.backlinkUrls.slice(0, 3).filter(Boolean);

  return (
    <>
      <Header title="Infographic Generation" />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <ImageConfigPanel
            headline={headline}
            onHeadlineChange={setHeadline}
            content={content}
            onContentChange={setContent}
            onSummarize={handleSummarize}
            isSummarizing={isSummarizing}
            watermark={watermark}
            onWatermarkChange={setWatermark}
            watermarkOptions={watermarkOptions}
            referenceImages={referenceImages}
            onOpenModal={openModal}
            onRemoveImage={handleRemoveImage}
            imageSize={imageSize}
            onImageSizeChange={setImageSize}
            brand={brand}
            onBrandChange={setBrand}
            brandOptions={brandOptions}
            isLoadingBrands={isLoadingBrands}
            brandPreview={selectedBrandPreset}
            useCustomBranding={useCustomBranding}
            onCustomBrandingChange={setUseCustomBranding}
            primaryColor={primaryColor}
            onPrimaryColorChange={setPrimaryColor}
            secondaryColor={secondaryColor}
            onSecondaryColorChange={setSecondaryColor}
            trimColor={trimColor}
            onTrimColorChange={setTrimColor}
            font={font}
            onFontChange={setFont}
            artStyle={artStyle}
            onArtStyleChange={setArtStyle}
            onGenerate={onGenerate}
            isGeneratingPrompt={isGeneratingPrompt}
            promptModelLabel={promptModelLabel}
          />

          <ImageReviewPanel
            prompt={fullPrompt}
            onPromptChange={setFullPrompt}
            onGenerateImage={onGenerateImage}
            isGeneratingImage={isGeneratingImage}
            generatedImage={generatedImage}
            referenceImageCount={referenceImages.filter(Boolean).length}
            brandLabel={
              brand === 'None'
                ? useCustomBranding
                  ? 'Custom branding'
                  : 'None'
                : brand
            }
            sizeLabel={
              imageSizeOptions.find((option) => option.id === imageSize)?.dims ?? imageSize
            }
            sizeDims={imageSizeOptions.find((option) => option.id === imageSize)?.dims ?? '1024x1024'}
            watermarkLabel={watermark.trim() || 'None'}
            onSaveToArchive={handleSaveGeneratedImage}
            isSavingToArchive={isArchiveUploading}
            onDownloadImage={handleDownloadGeneratedImage}
          />
        </div>
      </main>

      <ImageArchiveDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        archiveImages={archiveImages}
        isLoadingArchiveImages={isArchiveLoading}
        isUploading={isArchiveUploading}
        onUpload={uploadImages}
        onSelect={handleSelectFromArchive}
      />
    </>
  );
}

export default function GenerateImagePage() {
  return (
    <Suspense fallback={null}>
      <GenerateImagePageInner />
    </Suspense>
  );
}
