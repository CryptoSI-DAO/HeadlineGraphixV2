import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export const ImageDetailsDialog = ({
  image,
  onClose,
  onDownloadClick,
}: {
  image: ImagePlaceholder | null;
  onClose: () => void;
  onDownloadClick: (image: ImagePlaceholder) => void;
}) => (
  <Dialog open={!!image} onOpenChange={open => !open && onClose()}>
    <DialogContent className="max-w-2xl">
      <DialogHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <DialogTitle>Image Details</DialogTitle>
        <DialogDescription className="sr-only">
          View image metadata and download the selected asset.
        </DialogDescription>
        {image && (
          <Button variant="outline" size="sm" onClick={() => onDownloadClick(image)}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
      </DialogHeader>
      {image && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="relative aspect-square rounded-lg overflow-hidden border">
            <Image src={image.imageUrl} alt={image.description} fill unoptimized className="object-cover" />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{image.description}</h3>
              <p className="text-sm text-muted-foreground">ID: {image.id}</p>
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
                <span className="font-mono bg-muted px-2 py-1 rounded-md">
                  {(image as any).aiHint ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);
