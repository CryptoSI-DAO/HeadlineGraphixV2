import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export const ReferenceImagesPicker = ({
  referenceImages,
  selectedImages,
  onToggle,
  isLoadingArchiveImages,
  onFetchArchiveImages,
}: {
  referenceImages: ImagePlaceholder[];
  selectedImages: string[];
  onToggle: (imageUrl: string) => void;
  isLoadingArchiveImages: boolean;
  onFetchArchiveImages: () => void;
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Label>
        Select Reference Images ({selectedImages.length}/{referenceImages.length})
      </Label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onFetchArchiveImages}
        disabled={isLoadingArchiveImages}
      >
        {isLoadingArchiveImages ? 'Loading...' : 'Fetch from archive'}
      </Button>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {referenceImages.map(img => (
        <button
          key={img.id}
          onClick={() => onToggle(img.imageUrl)}
          className={cn(
            'rounded-lg overflow-hidden relative border-2 transition-all',
            selectedImages.includes(img.imageUrl)
              ? 'border-primary ring-2 ring-primary ring-offset-2'
              : 'border-muted hover:border-primary/50'
          )}
        >
          <Image
            src={img.imageUrl}
            alt={img.description}
            width={200}
            height={200}
            className="object-cover aspect-square"
            data-ai-hint={img.imageHint}
          />
          {selectedImages.includes(img.imageUrl) && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
              <CheckCircle size={16} />
            </div>
          )}
        </button>
      ))}
    </div>
  </div>
);
