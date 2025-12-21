import { useState } from 'react';

export const useReferenceImages = (initialCount = 4) => {
  const [referenceImages, setReferenceImages] = useState<(string | null)[]>(
    Array.from({ length: initialCount }, () => null)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const openModal = (index: number) => {
    setActiveSlot(index);
    setIsModalOpen(true);
  };

  const handleSelectFromArchive = (imageUrl: string) => {
    if (activeSlot === null) return;
    const newImages = [...referenceImages];
    newImages[activeSlot] = imageUrl;
    setReferenceImages(newImages);
    setIsModalOpen(false);
    setActiveSlot(null);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...referenceImages];
    newImages[index] = null;
    setReferenceImages(newImages);
  };

  return {
    referenceImages,
    isModalOpen,
    setIsModalOpen,
    openModal,
    handleSelectFromArchive,
    handleRemoveImage,
  };
};
