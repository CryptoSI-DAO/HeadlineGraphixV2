import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BrandPreset } from '../types';

export const EditBrandModal = ({
  preset,
  onClose,
  onSave,
  onFieldChange,
  isSaving = false,
}: {
  preset: BrandPreset | null;
  onClose: () => void;
  onSave: (logoFile?: File) => void;
  onFieldChange: (field: keyof BrandPreset, value: string) => void;
  isSaving?: boolean;
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  if (!preset) return null;

  const isArtStyleOther = !['Geometric', 'Cartoon', 'Minimalist'].includes(preset.artStyle);
  const isNewBrand = !preset.id || preset.id.startsWith('empty-');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(logoFile || undefined);
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleCancel = () => {
    setLogoFile(null);
    setLogoPreview('');
    onClose();
  };

  return (
    <Dialog open={!!preset} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNewBrand ? 'Add New Brand' : 'Edit Brand'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand-name" className="text-right">
              Brand Name
            </Label>
            <Input
              id="brand-name"
              value={preset.name}
              onChange={e => onFieldChange('name', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Primary Color</Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md border"
                style={{ backgroundColor: preset.primaryColor }}
              />
              <Input
                value={preset.primaryColor}
                onChange={e => onFieldChange('primaryColor', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Secondary Color</Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md border"
                style={{ backgroundColor: preset.secondaryColor }}
              />
              <Input
                value={preset.secondaryColor}
                onChange={e => onFieldChange('secondaryColor', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Trim Color</Label>
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md border"
                style={{ backgroundColor: preset.trimColor }}
              />
              <Input
                value={preset.trimColor}
                onChange={e => onFieldChange('trimColor', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="font-family" className="text-right">
              Font Family
            </Label>
            <Input
              id="font-family"
              value={preset.font}
              onChange={e => onFieldChange('font', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="art-style" className="text-right">
              Art Style
            </Label>
            <div className="col-span-3 space-y-2">
              <Select
                value={isArtStyleOther ? 'Other' : preset.artStyle}
                onValueChange={value => {
                  if (value !== 'Other') {
                    onFieldChange('artStyle', value);
                  } else {
                    onFieldChange('artStyle', '');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select art style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geometric">Geometric</SelectItem>
                  <SelectItem value="Cartoon">Cartoon</SelectItem>
                  <SelectItem value="Minimalist">Minimalist</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {isArtStyleOther && (
                <Input
                  value={preset.artStyle}
                  onChange={e => onFieldChange('artStyle', e.target.value)}
                  placeholder="Afro-Futuristic Minimalism"
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="logo-upload" className="text-right">
              Logo
            </Label>
            <div className="col-span-3 space-y-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
              />
              {(logoPreview || preset.logoUrl) && (
                <div className="flex items-center gap-2">
                  <Image
                    src={logoPreview || preset.logoUrl}
                    alt={preset.logoAlt || 'Logo preview'}
                    width={40}
                    height={40}
                    className="rounded-md bg-muted"
                  />
                  <span className="text-sm text-muted-foreground">
                    {logoFile ? logoFile.name : 'Current logo'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="logo-alt" className="text-right">
              Logo Alt Text
            </Label>
            <Input
              id="logo-alt"
              value={preset.logoAlt}
              onChange={e => onFieldChange('logoAlt', e.target.value)}
              className="col-span-3"
              placeholder="Brand logo"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
