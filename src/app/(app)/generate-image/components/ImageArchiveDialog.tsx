import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from '@/components/ImageUploader';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export const ImageArchiveDialog = ({
  isOpen,
  onOpenChange,
  archiveImages,
  onSelect,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  archiveImages: ImagePlaceholder[];
  onSelect: (imageUrl: string) => void;
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Select an Image</DialogTitle>
        <DialogDescription>
          Upload a new image or choose one from your existing archive.
        </DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="archive" className="w-full">
        <TabsList>
          <TabsTrigger value="archive">Image Archive</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
        </TabsList>
        <TabsContent value="archive" className="mt-4">
          <div className="grid grid-cols-5 gap-4 max-h-[50vh] overflow-y-auto p-1">
            {archiveImages.map(image => (
              <button
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all group"
                onClick={() => onSelect(image.imageUrl)}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={image.imageHint}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-sm font-semibold">Select</span>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="upload" className="mt-4">
          <ImageUploader />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
);
