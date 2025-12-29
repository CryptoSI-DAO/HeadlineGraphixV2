import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { useAuth } from '@/context/AuthContext';

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
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const { session } = useAuth();

  if (!preset) return null;

  const isArtStyleOther = !['Geometric', 'Cartoon', 'Minimalist'].includes(preset.artStyle);
  const isNewBrand = !preset.id || preset.id.startsWith('empty-');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setScanError(null);
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

  const handleScanLogo = async () => {
    if (!logoFile) {
      setScanError('Upload a logo before scanning.');
      return;
    }
    if (!session?.access_token) {
      setScanError('Sign in to scan a logo.');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await fetch('/api/brand-kits/scan-logo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let message = 'Logo scan failed.';
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload?.error) {
            message = payload.error;
          }
        } catch (parseError) {
          console.warn('Unable to parse scan response', parseError);
        }
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        result?: {
          brandName: string;
          primaryColor: string;
          secondaryColor: string;
          trimColor: string;
          font: string;
          artStyle: string;
        };
      };

      if (!payload?.result) {
        throw new Error('Logo scan returned no results.');
      }

      if (isNewBrand || !preset.name) {
        onFieldChange('name', payload.result.brandName);
        if (!preset.logoAlt) {
          onFieldChange('logoAlt', `${payload.result.brandName} logo`);
        }
      }
      onFieldChange('primaryColor', payload.result.primaryColor);
      onFieldChange('secondaryColor', payload.result.secondaryColor);
      onFieldChange('trimColor', payload.result.trimColor);
      onFieldChange('font', payload.result.font);
      onFieldChange('artStyle', payload.result.artStyle);
    } catch (error) {
      console.error('Logo scan failed', error);
      setScanError((error as Error).message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCancel = () => {
    setLogoFile(null);
    setLogoPreview('');
    setScanError(null);
    onClose();
  };

  return (
    <Dialog open={!!preset} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNewBrand ? 'Add New Brand' : 'Edit Brand'}</DialogTitle>
          <DialogDescription>
            Update the brand details, colors, and logo for this kit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="logo-upload" className="sm:text-right">
              Logo
            </Label>
            <div className="space-y-2 sm:col-span-3">
              <Input
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
              />
              {isNewBrand && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleScanLogo}
                    disabled={isScanning || !logoFile}
                  >
                    {isScanning ? 'Scanning...' : 'Scan Logo'}
                  </Button>
                  {scanError && <span className="text-sm text-destructive">{scanError}</span>}
                </div>
              )}
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="logo-alt" className="sm:text-right">
              Logo Alt Text
            </Label>
            <Input
              id="logo-alt"
              value={preset.logoAlt}
              onChange={e => onFieldChange('logoAlt', e.target.value)}
              className="sm:col-span-3"
              placeholder="Brand logo"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="brand-name" className="sm:text-right">
              Brand Name
            </Label>
            <Input
              id="brand-name"
              value={preset.name}
              onChange={e => {
                const nextName = e.target.value;
                onFieldChange('name', nextName);
                if (!preset.logoAlt) {
                  onFieldChange('logoAlt', nextName ? `${nextName} logo` : '');
                }
              }}
              className="sm:col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label className="sm:text-right">Primary Color</Label>
            <div className="flex items-center gap-2 sm:col-span-3">
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label className="sm:text-right">Secondary Color</Label>
            <div className="flex items-center gap-2 sm:col-span-3">
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label className="sm:text-right">Trim Color</Label>
            <div className="flex items-center gap-2 sm:col-span-3">
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="font-family" className="sm:text-right">
              Font Family
            </Label>
            <Input
              id="font-family"
              value={preset.font}
              onChange={e => onFieldChange('font', e.target.value)}
              className="sm:col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
            <Label htmlFor="art-style" className="sm:text-right">
              Art Style
            </Label>
            <div className="space-y-2 sm:col-span-3">
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
