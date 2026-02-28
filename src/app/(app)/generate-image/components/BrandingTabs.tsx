import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brush, Palette, Type } from 'lucide-react';

export const BrandingTabs = ({
  brand,
  onBrandChange,
  brandOptions,
  primaryColor,
  onPrimaryColorChange,
  font,
  onFontChange,
  artStyle,
  onArtStyleChange,
}: {
  brand: string;
  onBrandChange: (value: string) => void;
  brandOptions: string[];
  primaryColor: string;
  onPrimaryColorChange: (value: string) => void;
  font: string;
  onFontChange: (value: string) => void;
  artStyle: string;
  onArtStyleChange: (value: string) => void;
}) => (
  <Tabs defaultValue="preset">
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="preset">Use Saved Preset</TabsTrigger>
      <TabsTrigger value="custom">Custom Branding</TabsTrigger>
    </TabsList>
    <TabsContent value="preset" className="pt-4">
      <Select value={brand} onValueChange={onBrandChange}>
        <SelectTrigger>
        <SelectValue placeholder="Select a brand preset" />
      </SelectTrigger>
      <SelectContent>
        {brandOptions.map(tone => (
          <SelectItem key={tone} value={tone}>
            {tone}
          </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </TabsContent>
    <TabsContent value="custom" className="space-y-4 pt-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primary-color" className="flex items-center gap-2">
            <Palette size={16} /> Primary Color
          </Label>
          <Input
            id="primary-color"
            value={primaryColor}
            onChange={event => onPrimaryColorChange(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="font" className="flex items-center gap-2">
            <Type size={16} /> Font
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="art-style" className="flex items-center gap-2">
          <Brush size={16} /> Art Style
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
    </TabsContent>
  </Tabs>
);
