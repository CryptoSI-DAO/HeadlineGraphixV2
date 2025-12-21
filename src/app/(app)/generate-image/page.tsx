'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { brandTones } from './constants';
import { ImageArchiveDialog, ImageConfigPanel, ImageReviewPanel } from './components';
import { useImageGeneration, useReferenceImages } from './hooks';

export default function GenerateImagePage() {
  const { toast } = useToast();
  const archiveImages = PlaceHolderImages.slice(0, 10);

  const [brand, setBrand] = useState(brandTones[0]);
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [watermark, setWatermark] = useState('');
  const [imageSize, setImageSize] = useState('square');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [font, setFont] = useState('Inter');
  const [artStyle, setArtStyle] = useState('Minimalist');

  const {
    referenceImages,
    isModalOpen,
    setIsModalOpen,
    openModal,
    handleSelectFromArchive,
    handleRemoveImage,
  } = useReferenceImages(4);

  const { isGenerating, generatedImage, handleGenerate } = useImageGeneration({ toast });

  const onGenerate = () => {
    handleGenerate({ headline, content, brand });
  };

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
            watermark={watermark}
            onWatermarkChange={setWatermark}
            referenceImages={referenceImages}
            onOpenModal={openModal}
            onRemoveImage={handleRemoveImage}
            imageSize={imageSize}
            onImageSizeChange={setImageSize}
            brand={brand}
            onBrandChange={setBrand}
            brandTones={brandTones}
            primaryColor={primaryColor}
            onPrimaryColorChange={setPrimaryColor}
            font={font}
            onFontChange={setFont}
            artStyle={artStyle}
            onArtStyleChange={setArtStyle}
            onGenerate={onGenerate}
            isGenerating={isGenerating}
          />

          <ImageReviewPanel
            generatedImage={generatedImage}
            isGenerating={isGenerating}
            onGenerate={onGenerate}
          />
        </div>
      </main>

      <ImageArchiveDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        archiveImages={archiveImages}
        onSelect={handleSelectFromArchive}
      />
    </>
  );
}
