import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { ReferenceImageGrid } from './ReferenceImageGrid';
import { ImageSizePicker } from './ImageSizePicker';
import { imageSizeOptions } from '../constants';

export const ImageConfigPanel = ({
  headline,
  onHeadlineChange,
  content,
  onContentChange,
  onSummarize,
  isSummarizing,
  watermark,
  onWatermarkChange,
  watermarkOptions,
  referenceImages,
  onOpenModal,
  onRemoveImage,
  imageSize,
  onImageSizeChange,
  brand,
  onBrandChange,
  brandOptions,
  isLoadingBrands,
  brandPreview,
  useCustomBranding,
  onCustomBrandingChange,
  primaryColor,
  onPrimaryColorChange,
  secondaryColor,
  onSecondaryColorChange,
  trimColor,
  onTrimColorChange,
  font,
  onFontChange,
  artStyle,
  onArtStyleChange,
  onGenerate,
  isGeneratingPrompt,
  promptModelLabel,
}: {
  headline: string;
  onHeadlineChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  onSummarize: () => void;
  isSummarizing: boolean;
  watermark: string;
  onWatermarkChange: (value: string) => void;
  watermarkOptions: string[];
  referenceImages: (string | null)[];
  onOpenModal: (index: number) => void;
  onRemoveImage: (index: number) => void;
  imageSize: string;
  onImageSizeChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  brandOptions: string[];
  isLoadingBrands: boolean;
  brandPreview: {
    primaryColor: string;
    secondaryColor: string;
    trimColor: string;
    logoUrl: string;
    logoAlt: string;
    artStyle: string;
  } | null;
  useCustomBranding: boolean;
  onCustomBrandingChange: (value: boolean) => void;
  primaryColor: string;
  onPrimaryColorChange: (value: string) => void;
  secondaryColor: string;
  onSecondaryColorChange: (value: string) => void;
  trimColor: string;
  onTrimColorChange: (value: string) => void;
  font: string;
  onFontChange: (value: string) => void;
  artStyle: string;
  onArtStyleChange: (value: string) => void;
  onGenerate: () => void;
  isGeneratingPrompt: boolean;
  promptModelLabel: string;
}) => (
  <Card className="flex flex-col lg:h-[calc(100vh-10rem)]">
    <CardHeader>
      <CardTitle>1. Configure Infographic</CardTitle>
    </CardHeader>
    <CardContent className="flex-1 min-h-0 p-0 lg:overflow-hidden">
      <div className="lg:h-full lg:overflow-y-auto">
        <div className="space-y-6 p-6">
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
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="content">Content</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onSummarize}
                disabled={isSummarizing}
                aria-label="Generate visual summary"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              id="content"
              placeholder="Add key points or information you want to highlight in your infographic..."
              value={content}
              onChange={event => onContentChange(event.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            {brand === 'None' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="use-custom-branding"
                    checked={useCustomBranding}
                    onCheckedChange={(checked) => onCustomBrandingChange(checked === true)}
                  />
                  <Label htmlFor="use-custom-branding" className="text-xs text-muted-foreground">
                    Use custom branding
                  </Label>
                </div>
                {useCustomBranding ? (
                  <div className="space-y-3 rounded-md border border-input bg-muted/40 p-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label htmlFor="primary-color" className="text-xs">
                          Primary
                        </Label>
                        <Input
                          id="primary-color"
                          value={primaryColor}
                          onChange={(event) => onPrimaryColorChange(event.target.value)}
                          placeholder="#3B82F6"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="secondary-color" className="text-xs">
                          Secondary
                        </Label>
                        <Input
                          id="secondary-color"
                          value={secondaryColor}
                          onChange={(event) => onSecondaryColorChange(event.target.value)}
                          placeholder="#93C5FD"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="trim-color" className="text-xs">
                          Trim
                        </Label>
                        <Input
                          id="trim-color"
                          value={trimColor}
                          onChange={(event) => onTrimColorChange(event.target.value)}
                          placeholder="#E5E7EB"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="font" className="text-xs">
                          Font
                        </Label>
                        <Select value={font} onValueChange={onFontChange}>
                          <SelectTrigger id="font">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="art-style" className="text-xs">
                          Art Style
                        </Label>
                        <Select value={artStyle} onValueChange={onArtStyleChange}>
                          <SelectTrigger id="art-style">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Minimalist">Minimalist</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                            <SelectItem value="Playful">Playful</SelectItem>
                            <SelectItem value="Geometric">Geometric</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <Select value={brand} onValueChange={onBrandChange} disabled={isLoadingBrands}>
                      <SelectTrigger id="brand">
                        <SelectValue placeholder="Select a brand tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandOptions.map((tone) => (
                          <SelectItem key={tone} value={tone}>
                            {tone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="rounded-md border border-input bg-muted/40 p-3 text-xs text-muted-foreground">
                      <span>Select a saved brand to preview colors and logo.</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <Select value={brand} onValueChange={onBrandChange} disabled={isLoadingBrands}>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select a brand tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandOptions.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="rounded-md border border-input bg-muted/40 p-3 text-xs text-muted-foreground">
                  {brandPreview ? (
                    <div className="flex items-start gap-3">
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: brandPreview.primaryColor || 'transparent' }}
                          />
                          <span>Primary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: brandPreview.secondaryColor || 'transparent' }}
                          />
                          <span>Secondary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: brandPreview.trimColor || 'transparent' }}
                          />
                          <span>Trim</span>
                        </div>
                        <div className="text-[11px]">Art Style: {brandPreview.artStyle || '—'}</div>
                      </div>
                      {brandPreview.logoUrl ? (
                        <img
                          src={brandPreview.logoUrl}
                          alt={brandPreview.logoAlt || `${brand} logo`}
                          className="h-14 w-14 rounded-md border object-contain bg-background"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-md border bg-background text-[10px]">
                          No logo
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>Select a saved brand to preview colors and logo.</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="watermark">Watermark</Label>
            <Select
              value=""
              onValueChange={(value) => onWatermarkChange(value)}
              disabled={watermarkOptions.length === 0}
            >
              <SelectTrigger id="watermark-options">
                <SelectValue placeholder="Choose a backlink" />
              </SelectTrigger>
              <SelectContent>
                {watermarkOptions.map((url) => (
                  <SelectItem key={url} value={url}>
                    {url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        </div>
      </div>
    </CardContent>
    <div className="p-6 pt-0 mt-auto">
      <Button size="lg" className="w-full" onClick={onGenerate} disabled={isGeneratingPrompt}>
        {isGeneratingPrompt ? 'Generating Prompt...' : 'Generate Full Prompt'}
        <Sparkles className="ml-2 h-5 w-5" />
      </Button>
      {isGeneratingPrompt ? (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-primary" />
          <span>Using {promptModelLabel}</span>
        </div>
      ) : null}
    </div>
  </Card>
);
