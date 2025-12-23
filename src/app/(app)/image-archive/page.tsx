'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useReferenceImages } from '@/hooks/use-reference-images';
import { Upload } from 'lucide-react';
import type { UploadFile } from '@/components/ImageUploader';
import {
  DeleteImageDialog,
  ImageArchiveGrid,
  ImageDetailsDialog,
  UploadImageDialog,
} from './components';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { MAX_REFERENCE_IMAGES } from '@/lib/reference-images';

const TOTAL_SLOTS = MAX_REFERENCE_IMAGES;

export default function ImageArchivePage() {
  const { toast } = useToast();
  const {
    images: referenceImages,
    isLoading,
    isUploading,
    uploadImages,
    deleteImage,
  } = useReferenceImages();
  const [imageToDelete, setImageToDelete] = useState<ImagePlaceholder | null>(null);
  const [imageToView, setImageToView] = useState<ImagePlaceholder | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<UploadFile[]>([]);
  const [resetSignal, setResetSignal] = useState(0);

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      await deleteImage(imageToDelete.id);
      toast({ title: 'Image deleted' });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: (error as Error).message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setImageToDelete(null);
    }
  };

  const slots = Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
    const image = referenceImages[index];
    if (!image) return null;
    return {
      id: image.id,
      description: image.description || '',
      imageUrl: image.imageUrl,
      imageHint: image.aiHint || '',
    } as ImagePlaceholder;
  });

  const handleUploadSelected = async () => {
    if (!pendingUploads.length) return;
    try {
      await uploadImages(pendingUploads.map(item => item.file));
      toast({
        title: 'Images uploaded',
        description: 'Your reference images are now synced with Supabase.',
      });
      setPendingUploads([]);
      setResetSignal(prev => prev + 1);
      setIsUploadModalOpen(false);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: (error as Error).message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUploadClose = () => {
    setIsUploadModalOpen(false);
    setPendingUploads([]);
    setResetSignal(prev => prev + 1);
  };

  const handleDownload = async (image: ImagePlaceholder) => {
    try {
    const response = await fetch(image.imageUrl);
    if (!response.ok) {
      throw new Error('Failed to download image');
    }
    const blob = await response.blob();
    
    // Generate filename from description or use ID as fallback
    const description = image.description || image.id;
    const sanitizedDescription = description
      .toLowerCase()
      .replace(/[^a-z0-9\s.-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    
    // Check if description already has a file extension
    const hasExtension = /\.[a-z0-9]+$/i.test(sanitizedDescription);
    let filename: string;
    
    if (hasExtension) {
      // Use the existing extension from the description
      filename = sanitizedDescription;
    } else {
      // Try to determine file extension from content type
      const contentType = blob.type || 'image/jpeg';
      const extension = contentType.split('/')[1] || 'jpg';
      filename = `${sanitizedDescription}.${extension}`;
    }
    
    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: 'Image downloaded' });
    } catch (error) {
    toast({
      title: 'Download failed',
      description: (error as Error).message ?? 'Please try again.',
      variant: 'destructive',
    });
    }
  };

  return (
    <>
      <Header title="Image Archive">
        <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload Images
        </Button>
      </Header>
      <main className="p-4 md:p-6">
        <ImageArchiveGrid
          slots={slots}
          isLoading={isLoading}
          onUploadClick={() => setIsUploadModalOpen(true)}
          onInfoClick={setImageToView}
          onDownloadClick={handleDownload}
          onDeleteClick={setImageToDelete}
        />
      </main>

      <DeleteImageDialog
        image={imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <ImageDetailsDialog
        image={imageToView}
        onClose={() => setImageToView(null)}
        onDownloadClick={handleDownload}
      />

      <UploadImageDialog
        isOpen={isUploadModalOpen}
        isUploading={isUploading}
        pendingUploads={pendingUploads}
        onPendingUploadsChange={setPendingUploads}
        onClose={handleUploadClose}
        onUpload={handleUploadSelected}
        resetSignal={resetSignal}
      />
    </>
  );
}
