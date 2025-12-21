import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { BrandingTabs } from './BrandingTabs';
import { ReferenceImageGrid } from './ReferenceImageGrid';
import { ImageSizePicker } from './ImageSizePicker';
import { imageSizeOptions } from '../constants';

export const ImageConfigPanel = ({
  headline,
  onHeadlineChange,
  content,
  onContentChange,
  watermark,
  onWatermarkChange,
  referenceImages,
  onOpenModal,
  onRemoveImage,
  imageSize,
  onImageSizeChange,
  brand,
  onBrandChange,
  brandTones,
  primaryColor,
  onPrimaryColorChange,
  font,
  onFontChange,
  artStyle,
  onArtStyleChange,
  onGenerate,
  isGenerating,
}: {
  headline: string;
  onHeadlineChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  watermark: string;
  onWatermarkChange: (value: string) => void;
  referenceImages: (string | null)[];
  onOpenModal: (index: number) => void;
  onRemoveImage: (index: number) => void;
  imageSize: string;
  onImageSizeChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  brandTones: string[];
  primaryColor: string;
  onPrimaryColorChange: (value: string) => void;
  font: string;
  onFontChange: (value: string) => void;
  artStyle: string;
  onArtStyleChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) => (
  <Card className="flex flex-col h-[calc(100vh-10rem)]">
    <CardHeader>
      <CardTitle>1. Configure Infographic</CardTitle>
    </CardHeader>
    <CardContent className="flex-1 overflow-hidden p-0">
      <ScrollArea className="h-full p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="headline">
              Enter Headline <span className="text-destructive">*</span>
            </Label>
            <Input
              id="headline"
              value={headline}
              onChange={event => onHeadlineChange(event.target.value)}
              placeholder="e.g., The Future of Renewable Energy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Add key points or information you want to highlight in your infographic..."
              value={content}
              onChange={event => onContentChange(event.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="watermark">Watermark</Label>
            <Input
              id="watermark"
              value={watermark}
              onChange={event => onWatermarkChange(event.target.value)}
              placeholder="This will appear as a subtle watermark"
            />
          </div>

          <ReferenceImageGrid
            referenceImages={referenceImages}
            onOpenModal={onOpenModal}
            onRemoveImage={onRemoveImage}
          />

          <ImageSizePicker
            imageSize={imageSize}
            onChange={onImageSizeChange}
            options={imageSizeOptions}
          />

          <BrandingTabs
            brand={brand}
            onBrandChange={onBrandChange}
            brandTones={brandTones}
            primaryColor={primaryColor}
            onPrimaryColorChange={onPrimaryColorChange}
            font={font}
            onFontChange={onFontChange}
            artStyle={artStyle}
            onArtStyleChange={onArtStyleChange}
          />
        </div>
      </ScrollArea>
    </CardContent>
    <div className="p-6 pt-0 mt-auto">
      <Button size="lg" className="w-full" onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Infographic'}
        <Sparkles className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </Card>
);
