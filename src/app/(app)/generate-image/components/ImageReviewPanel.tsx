import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ImageIcon, Pencil, RefreshCw } from 'lucide-react';
import type { GenerateImageOutput } from '@/ai/flows/generate-image';

export const ImageReviewPanel = ({
  generatedImage,
  isGenerating,
  onGenerate,
}: {
  generatedImage: GenerateImageOutput | null;
  isGenerating: boolean;
  onGenerate: () => void;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>2. Review & Edit</CardTitle>
      {generatedImage && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Pencil className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onGenerate} disabled={isGenerating}>
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-5 w-5" />
          </Button>
        </div>
      )}
    </CardHeader>
    <CardContent className="min-h-[400px] flex items-center justify-center p-6">
      {isGenerating ? (
        <div className="w-full aspect-square max-w-sm">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      ) : generatedImage ? (
        <div className="relative aspect-square w-full max-w-sm rounded-lg overflow-hidden border">
          <Image
            src={generatedImage.imageUrl}
            alt="Generated visual asset"
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <ImageIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1 text-foreground">
            Your infographic will appear here
          </h3>
          <p className="max-w-xs mx-auto text-sm">
            Configure your inputs and click &lsquo;Generate Infographic&rsquo; to begin.
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);
