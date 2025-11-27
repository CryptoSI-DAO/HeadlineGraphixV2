'use client';

import Image from 'next/image';
import { Header } from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Upload } from 'lucide-react';

export default function ImageArchivePage() {
  const { referenceImages, addReferenceImage } = useAppContext();

  const handleSimulatedUpload = () => {
    // In a real app, this would handle file upload.
    // Here, we'll just add another image from our placeholders.
    const newImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    addReferenceImage({ ...newImage, id: `sim-${Date.now()}` });
  };

  return (
    <>
      <Header title="Image Archive">
        <Button onClick={handleSimulatedUpload}><Upload /> Upload</Button>
      </Header>
      <main className="p-4 md:p-6">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {referenceImages.map(image => (
            <div key={image.id} className="break-inside-avoid">
              <Image 
                src={image.imageUrl} 
                alt={image.description} 
                width={400} 
                height={Math.random() * 200 + 300} // random height for masonry effect
                className="w-full h-auto rounded-lg object-cover"
                data-ai-hint={image.imageHint}
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
