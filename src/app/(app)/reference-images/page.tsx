'use client';

import Image from 'next/image';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useReferenceImages } from '@/hooks/use-reference-images';
import { ImageUploader, type UploadFile } from '@/components/ImageUploader';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ImageArchivePage() {
  const { toast } = useToast();
  const { images, isLoading, isUploading, uploadImages } = useReferenceImages();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<UploadFile[]>([]);
  const [resetSignal, setResetSignal] = useState(0);

  const handleUpload = async () => {
    if (!pendingUploads.length) return;
    try {
      await uploadImages(pendingUploads.map((item) => item.file));
      toast({ title: 'Upload complete', description: 'Your images are now available everywhere.' });
      setPendingUploads([]);
      setResetSignal((prev) => prev + 1);
      setIsUploadModalOpen(false);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: (error as Error).message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Header title="Image Archive">
        <Button onClick={() => setIsUploadModalOpen(true)} disabled={isUploading}>
          <Upload className="mr-2 h-4 w-4" /> Upload
        </Button>
      </Header>
      <main className="p-4 md:p-6">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading reference images...</p>
          ) : images.length === 0 ? (
            <p className="text-center text-muted-foreground">No reference images yet. Upload some to get started.</p>
          ) : (
            images.map((image) => (
              <div key={image.id} className="break-inside-avoid">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  width={400}
                  height={Math.random() * 200 + 300}
                  className="w-full h-auto rounded-lg object-cover"
                  data-ai-hint={image.aiHint}
                />
              </div>
            ))
          )}
        </div>
      </main>

      <Dialog open={isUploadModalOpen} onOpenChange={(open) => {
        setIsUploadModalOpen(open);
        if (!open) {
          setPendingUploads([]);
          setResetSignal((prev) => prev + 1);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
            <DialogDescription>Select files from your device to add to your Supabase library.</DialogDescription>
          </DialogHeader>
          <ImageUploader onFilesChange={setPendingUploads} resetSignal={resetSignal} disabled={isUploading} />
          <Button onClick={handleUpload} disabled={!pendingUploads.length || isUploading}>
            {isUploading ? 'Uploading...' : pendingUploads.length ? `Upload ${pendingUploads.length} file(s)` : 'Select files to upload'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
