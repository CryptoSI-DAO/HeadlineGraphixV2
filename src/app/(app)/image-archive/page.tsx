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

const TOTAL_SLOTS = 10;

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
    return referenceImages[index] || null;
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
          onDeleteClick={setImageToDelete}
        />
      </main>

      <DeleteImageDialog
        image={imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <ImageDetailsDialog image={imageToView} onClose={() => setImageToView(null)} />

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
