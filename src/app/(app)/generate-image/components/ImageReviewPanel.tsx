import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';

export const ImageReviewPanel = ({
  prompt,
  onPromptChange,
  onGenerateImage,
  isGeneratingImage,
  generatedImage,
  referenceImageCount,
  brandLabel,
  sizeLabel,
  sizeDims,
  watermarkLabel,
  onSaveToArchive,
  isSavingToArchive,
  onDownloadImage,
}: {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
  generatedImage: { imageUrl: string } | null;
  referenceImageCount: number;
  brandLabel: string;
  sizeLabel: string;
  sizeDims: string;
  watermarkLabel: string;
  onSaveToArchive: () => void;
  isSavingToArchive: boolean;
  onDownloadImage: () => void;
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>2. Review & Edit</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px] p-6">
          {prompt.trim().length > 0 ? (
            <div className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(event) => onPromptChange(event.target.value)}
                className="min-h-[200px]"
              />
              {generatedImage ? (
                <button
                  type="button"
                  className="relative w-full max-w-sm overflow-hidden rounded-lg border mx-auto"
                  style={{
                    aspectRatio: sizeDims.includes('x')
                      ? sizeDims.replace('x', ' / ')
                      : undefined,
                  }}
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Image
                    src={generatedImage.imageUrl}
                    alt="Generated visual asset"
                    fill
                    className="object-cover"
                  />
                </button>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  Generated image will appear here.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-foreground">
                Your prompt will appear here
              </h3>
              <p className="max-w-xs mx-auto text-sm">
                Configure your inputs and click &lsquo;Generate Full Prompt&rsquo; to begin.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={onGenerateImage}
            disabled={isGeneratingImage || prompt.trim().length === 0}
          >
            {isGeneratingImage ? 'Generating Image...' : 'Generate Image'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isGeneratingImage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generating Image</DialogTitle>
            <DialogDescription>
              Using OpenAI gpt-image-1.5 with {referenceImageCount} reference
              {referenceImageCount === 1 ? ' image' : ' images'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Brand: {brandLabel}</div>
            <div>Size: {sizeLabel}</div>
            <div>Watermark: {watermarkLabel}</div>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>Review the full-size image.</DialogDescription>
          </DialogHeader>
          {generatedImage ? (
            <div className="space-y-4">
              <div
                className="relative w-full overflow-hidden rounded-lg border"
                style={{
                  aspectRatio: sizeDims.includes('x')
                    ? sizeDims.replace('x', ' / ')
                    : undefined,
                }}
              >
                <Image
                  src={generatedImage.imageUrl}
                  alt="Generated visual asset"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button onClick={onSaveToArchive} disabled={isSavingToArchive}>
                  {isSavingToArchive ? 'Saving...' : 'Save to Archive'}
                </Button>
                <Button variant="outline" onClick={onDownloadImage}>
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No image available yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
