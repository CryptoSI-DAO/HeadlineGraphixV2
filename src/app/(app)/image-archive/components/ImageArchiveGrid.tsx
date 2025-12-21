import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Info, Plus, Trash2 } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export const ImageArchiveGrid = ({
  slots,
  isLoading,
  onUploadClick,
  onInfoClick,
  onDeleteClick,
}: {
  slots: (ImagePlaceholder | null)[];
  isLoading: boolean;
  onUploadClick: () => void;
  onInfoClick: (image: ImagePlaceholder) => void;
  onDeleteClick: (image: ImagePlaceholder) => void;
}) => (
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
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white"
                onClick={() => onInfoClick(image)}
              >
                <Info className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white"
                onClick={() => onDeleteClick(image)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            key={`empty-${index}`}
            onClick={onUploadClick}
            className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:text-primary transition-all group bg-muted/20"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Plus className="h-8 w-8" />
              <span>Add Image</span>
            </div>
          </button>
        )
      )
    )}
  </div>
);
