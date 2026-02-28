import Image from 'next/image';
import { Plus, X } from 'lucide-react';

export const ReferenceImageGrid = ({
  referenceImages,
  onOpenModal,
  onRemoveImage,
}: {
  referenceImages: (string | null)[];
  onOpenModal: (index: number) => void;
  onRemoveImage: (index: number) => void;
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium">Add up to 4 reference images</p>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {referenceImages.map((imageUrl, index) => (
        <button
          key={index}
          className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary transition-all group bg-muted/20"
          onClick={() => onOpenModal(index)}
        >
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={`Reference ${index + 1}`}
                fill
                className="object-cover rounded-md"
              />
              <div
                className="absolute top-1 right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"
                onClick={event => {
                  event.stopPropagation();
                  onRemoveImage(index);
                }}
              >
                <X size={14} />
              </div>
            </>
          ) : (
            <Plus className="h-8 w-8 text-muted-foreground" />
          )}
        </button>
      ))}
    </div>
  </div>
);
