import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageUploader, type UploadFile } from '@/components/ImageUploader';

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
}) => (
  <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload Image</DialogTitle>
        <DialogDescription>
          Add a new image to your archive. You can upload from your device.
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
