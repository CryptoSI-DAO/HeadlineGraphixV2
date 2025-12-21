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
}: {
  preset: BrandPreset | null;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (field: keyof BrandPreset, value: string) => void;
}) => {
  if (!preset) return null;

  const isArtStyleOther = !['Geometric', 'Cartoon', 'Minimalist'].includes(preset.artStyle);

  return (
    <Dialog open={!!preset} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Brand</DialogTitle>
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
              Logo Upload
            </Label>
            <Input id="logo-upload" type="file" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
