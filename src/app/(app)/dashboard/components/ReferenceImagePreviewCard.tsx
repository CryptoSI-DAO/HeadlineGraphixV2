import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export const ReferenceImagePreviewCard = ({
  images,
  isLoading,
}: {
  images: ImagePlaceholder[];
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Reference Image Library</CardTitle>
        <CardDescription>A preview of your most recent images.</CardDescription>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/image-archive">View All</Link>
      </Button>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your reference images...</p>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map(image => (
            <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border">
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
          <Archive className="w-10 h-10 mb-4" />
          <p>Your image archive is empty.</p>
          <Button asChild variant="link">
            <Link href="/image-archive">Upload your first image</Link>
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);
