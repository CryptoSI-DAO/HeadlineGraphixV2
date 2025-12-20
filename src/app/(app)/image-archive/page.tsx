
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useReferenceImages } from '@/hooks/use-reference-images';
import { ImageUploader, type UploadFile } from '@/components/ImageUploader';
import { Upload, Download, Trash2, Plus, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
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
  const [imageToDelete, setImageToDelete] = useState<typeof referenceImages[number] | null>(null);
  const [imageToView, setImageToView] = useState<typeof referenceImages[number] | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<UploadFile[]>([]);
  const [resetSignal, setResetSignal] = useState(0);

  const handleDeleteClick = (image: typeof referenceImages[number]) => {
    setImageToDelete(image);
  }

  const handleInfoClick = (image: typeof referenceImages[number]) => {
    setImageToView(image);
  }

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
  }

  // Create an array representing all slots
  const slots = Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
    return referenceImages[index] || null;
  });

  const handleUploadSelected = async () => {
    if (!pendingUploads.length) return;
    try {
      await uploadImages(pendingUploads.map((item) => item.file));
      toast({ title: 'Images uploaded', description: 'Your reference images are now synced with Supabase.' });
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
        <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload Images
        </Button>
      </Header>
      <main className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p>Loading your reference images...</p>
            </div>
          ) : (
          slots.map((image, index) =>
            image ? (
              <div 
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-4 border-transparent"
              >
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={image.aiHint}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => handleInfoClick(image)}>
                        <Info className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                        <Download className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => handleDeleteClick(image)}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
              </div>
            ) : (
                <button
                    key={`empty-${index}`}
                    onClick={() => setIsUploadModalOpen(true)}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:text-primary transition-all group bg-muted/20"
                >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Plus className="h-8 w-8" />
                        <span>Add Image</span>
                    </div>
                </button>
            )
          ))}
        </div>
      </main>

       <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              image from your archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setImageToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!imageToView} onOpenChange={(open) => !open && setImageToView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          {imageToView && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image src={imageToView.imageUrl} alt={imageToView.description} fill className="object-cover" />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{imageToView.description}</h3>
                  <p className="text-sm text-muted-foreground">ID: {imageToView.id}</p>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span>1080 x 1080 pixels</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Size:</span>
                    <span>2.3 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Type:</span>
                    <span>JPEG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Hint:</span>
                    <span className="font-mono bg-muted px-2 py-1 rounded-md">{imageToView.aiHint ?? '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isUploadModalOpen} onOpenChange={(open) => {
        setIsUploadModalOpen(open);
        if (!open) {
          setPendingUploads([]);
          setResetSignal((prev) => prev + 1);
        }
      }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Upload Image</DialogTitle>
                <DialogDescription>
                    Add a new image to your archive. You can upload from your device.
                </DialogDescription>
            </DialogHeader>
            <ImageUploader
              onFilesChange={setPendingUploads}
              resetSignal={resetSignal}
              disabled={isUploading}
            />
            <Button
              onClick={handleUploadSelected}
              className="w-full"
              disabled={!pendingUploads.length || isUploading}
            >
              {isUploading ? 'Uploading...' : pendingUploads.length ? `Upload ${pendingUploads.length} file(s)` : 'Select files to upload'}
            </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
