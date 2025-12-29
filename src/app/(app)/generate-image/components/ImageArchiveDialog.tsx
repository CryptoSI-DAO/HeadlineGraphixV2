import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ImageUploader, type UploadFile } from '@/components/ImageUploader';
import type { ReferenceImage } from '@/hooks/use-reference-images';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const ImageArchiveDialog = ({
  isOpen,
  onOpenChange,
  archiveImages,
  isLoadingArchiveImages,
  isUploading,
  onUpload,
  onSelect,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  archiveImages: ReferenceImage[];
  isLoadingArchiveImages: boolean;
  isUploading: boolean;
  onUpload: (files: File[]) => Promise<ReferenceImage[]>;
  onSelect: (imageUrl: string) => void;
}) => {
  const { toast } = useToast();
  const [pendingUploads, setPendingUploads] = useState<UploadFile[]>([]);
  const [resetSignal, setResetSignal] = useState(0);

  const handleUpload = async () => {
    if (!pendingUploads.length) return;
    try {
      const files = pendingUploads.map((item) => item.file);
      const uploaded = await onUpload(files);
      if (uploaded[0]?.imageUrl) {
        onSelect(uploaded[0].imageUrl);
      }
      setPendingUploads([]);
      setResetSignal((prev) => prev + 1);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setPendingUploads([]);
          setResetSignal((prev) => prev + 1);
        }
      }}
    >
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
            {isLoadingArchiveImages ? (
              <p className="text-sm text-muted-foreground">Loading reference images...</p>
            ) : archiveImages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reference images found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {archiveImages.map((image) => (
                  <button
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all group"
                    onClick={() => onSelect(image.imageUrl)}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.description ?? 'Reference image'}
                      fill
                      className="object-cover"
                      data-ai-hint={image.aiHint}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-sm font-semibold">Select</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="upload" className="mt-4 space-y-4">
            <ImageUploader
              onFilesChange={setPendingUploads}
              resetSignal={resetSignal}
              disabled={isUploading}
            />
            <Button onClick={handleUpload} disabled={!pendingUploads.length || isUploading}>
              {isUploading
                ? 'Uploading...'
                : pendingUploads.length
                ? `Upload ${pendingUploads.length} file(s)`
                : 'Select files to upload'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
