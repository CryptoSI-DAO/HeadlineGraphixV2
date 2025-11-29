
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Upload, Download, Trash2, X } from 'lucide-react';
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
import { cn } from '@/lib/utils';


export default function ImageArchivePage() {
  const { referenceImages, addReferenceImage } = useAppContext();
  const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSimulatedUpload = () => {
    const newImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    addReferenceImage({ ...newImage, id: `sim-${Date.now()}` });
  };

  const handleSelectImage = (image: ImagePlaceholder) => {
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="ghost" size="icon" onClick={() => setSelectedImage(null)}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button onClick={handleSimulatedUpload} disabled={!!selectedImage}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </Header>
      <main className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {referenceImages.map(image => (
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
          ))}
        </div>
      </main>
    </>
  );
}
