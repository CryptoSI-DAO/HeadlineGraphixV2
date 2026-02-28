import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { brandTones } from '../constants';

export const StudioConfigPanel = ({
  headlineTitle,
  brandTone,
  onBrandToneChange,
  selectedImage,
  onSelectImage,
  userAngle,
  onUserAngleChange,
  onGenerate,
  isGenerating,
}: {
  headlineTitle: string;
  brandTone: string;
  onBrandToneChange: (value: string) => void;
  selectedImage: string;
  onSelectImage: (value: string) => void;
  userAngle: string;
  onUserAngleChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) => {
  const referenceImages = PlaceHolderImages.slice(0, 3);

  return (
    <Card className="h-fit lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>Generate content for: &ldquo;{headlineTitle}&rdquo;</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="brand-tone">Brand Tone</Label>
          <Select value={brandTone} onValueChange={onBrandToneChange}>
            <SelectTrigger id="brand-tone">
              <SelectValue placeholder="Select a tone" />
            </SelectTrigger>
            <SelectContent>
              {brandTones.map(tone => (
                <SelectItem key={tone} value={tone}>
                  {tone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Reference Image</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {referenceImages.map(img => (
              <button
                key={img.id}
                onClick={() => onSelectImage(img.imageUrl)}
                className={cn(
                  'rounded-md overflow-hidden relative border-2',
                  selectedImage === img.imageUrl
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-transparent'
                )}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.description}
                  width={150}
                  height={150}
                  className="object-cover aspect-square"
                  data-ai-hint={img.imageHint}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-angle">Your Angle (Optional)</Label>
          <Textarea
            id="user-angle"
            placeholder="e.g., Focus on the sustainability aspect..."
            value={userAngle}
            onChange={event => onUserAngleChange(event.target.value)}
          />
        </div>
        <Button size="lg" className="w-full" onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Drafts'}
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
