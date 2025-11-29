
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Upload, Download, Trash2, X, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { ImageUploader } from '@/components/ImageUploader';
import { cn } from '@/lib/utils';


const TOTAL_SLOTS = 10;

export default function ImageArchivePage() {
  const { referenceImages, addReferenceImage } = useAppContext();
  const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleSimulatedUpload = () => {
    // This is a simulated upload. In a real app, you would handle the uploaded file.
    const newImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    addReferenceImage({ ...newImage, id: `sim-${Date.now()}` });
    setIsUploadModalOpen(false);
  };

  const handleSelectImage = (image: ImagePlaceholder) => {
    // Can't select an image if another is already selected for deletion
    if (isDeleteDialogOpen) return;
    setSelectedImage(image);
  }

  const handleDelete = () => {
    if (selectedImage) {
      // In a real app, you'd call a function to delete the image from the source.
      // Here we'll just close the dialog and deselect.
      console.log('Deleting image:', selectedImage.id);
      setIsDeleteDialogOpen(false);
      setSelectedImage(null);
    }
  }

  // Create an array representing all slots
  const slots = Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
    return referenceImages[index] || null;
  });

  return (
    <>
      <Header title="Image Archive">
        <div className="flex items-center gap-2">
          {selectedImage && (
            <>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      image from your archive.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedImage(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="ghost" size="icon" onClick={() => setSelectedImage(null)}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
           <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => setIsUploadModalOpen(true)} disabled={!!selectedImage || referenceImages.length >= TOTAL_SLOTS}>
                        <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Image</DialogTitle>
                        <DialogDescription>
                            Add a new image to your archive. You can upload from your device.
                        </DialogDescription>
                    </DialogHeader>
                    <ImageUploader />
                    {/* The uploader is for show, this button simulates adding an image */}
                    <Button onClick={handleSimulatedUpload} className="w-full">Add Simulated Image</Button>
                </DialogContent>
            </Dialog>
        </div>
      </Header>
      <main className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {slots.map((image, index) =>
            image ? (
              <div 
                key={image.id}
                className={cn(
                  "relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-4",
                  selectedImage?.id === image.id ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                )}
                onClick={() => handleSelectImage(image)}
              >
                <Image 
                  src={image.imageUrl} 
                  alt={image.description} 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={image.imageHint}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-semibold text-center p-2">{image.description}</span>
                </div>
              </div>
            ) : (
                <button
                    key={`empty-${index}`}
                    onClick={() => setIsUploadModalOpen(true)}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:text-primary transition-all group bg-muted/20"
                    disabled={!!selectedImage}
                >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Plus className="h-8 w-8" />
                        <span>Add Image</span>
                    </div>
                </button>
            )
          )}
        </div>
      </main>
    </>
  );
}
