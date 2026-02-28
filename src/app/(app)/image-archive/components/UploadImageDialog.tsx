import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageUploader, type UploadFile } from '@/components/ImageUploader';
import { MAX_REFERENCE_IMAGES, MAX_REFERENCE_IMAGE_SIZE_BYTES } from '@/lib/reference-images';

export const UploadImageDialog = ({
  isOpen,
  isUploading,
  pendingUploads,
  onPendingUploadsChange,
  onClose,
  onUpload,
  resetSignal,
}: {
  isOpen: boolean;
  isUploading: boolean;
  pendingUploads: UploadFile[];
  onPendingUploadsChange: (files: UploadFile[]) => void;
  onClose: () => void;
  onUpload: () => void;
  resetSignal: number;
}) => {
  const maxSizeMb = Math.max(1, Math.round(MAX_REFERENCE_IMAGE_SIZE_BYTES / (1024 * 1024)));

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>
            Add a new image to your archive. Up to {MAX_REFERENCE_IMAGES} images total, {maxSizeMb} MB each.
          </DialogDescription>
        </DialogHeader>
        <ImageUploader
          onFilesChange={onPendingUploadsChange}
          resetSignal={resetSignal}
          disabled={isUploading}
        />
        <Button
          onClick={onUpload}
          className="w-full"
          disabled={!pendingUploads.length || isUploading}
        >
          {isUploading
            ? 'Uploading...'
            : pendingUploads.length
              ? `Upload ${pendingUploads.length} file(s)`
              : 'Select files to upload'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
