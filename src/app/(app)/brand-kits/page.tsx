
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

type BrandPreset = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  trimColor: string;
  font: string;
  artStyle: string;
  logoUrl: string;
  logoAlt: string;
};

const mockBrandPresets: BrandPreset[] = [
  {
    id: '1',
    name: 'Afroball connect',
    primaryColor: '#F44336',
    secondaryColor: '#121212',
    trimColor: '#FFD700',
    font: 'Montserrat',
    artStyle: 'Afro-Futuristic Minimalism',
    logoUrl: 'https://picsum.photos/seed/afroball/40/40',
    logoAlt: 'Afroball connect logo',
  },
  {
    id: '2',
    name: 'Lex Consulting',
    primaryColor: '#708090',
    secondaryColor: '#F8F8F8',
    trimColor: '#007BFF',
    font: 'Cinzel',
    artStyle: 'Geometric',
    logoUrl: 'https://picsum.photos/seed/lex/40/40',
    logoAlt: 'Lex Consulting logo',
  },
  {
    id: '3',
    name: 'Crypto Waffle',
    primaryColor: '#43C4CC',
    secondaryColor: '#FFD878',
    trimColor: '#2A2B2D',
    font: 'Fredoka',
    artStyle: 'Cartoon',
    logoUrl: 'https://picsum.photos/seed/waffle/40/40',
    logoAlt: 'Crypto Waffle logo',
  },
];

const ColorSwatch = ({ color }: { color: string }) => (
  <div className="flex items-center gap-2">
    <div
      className="h-6 w-6 rounded-md border"
      style={{ backgroundColor: color }}
    />
    <span className="font-mono text-sm">{color.toUpperCase()}</span>
  </div>
);

const EditBrandModal = ({
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
              onChange={(e) => onFieldChange('name', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Primary Color</Label>
            <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: preset.primaryColor }} />
                <Input
                    value={preset.primaryColor}
                    onChange={(e) => onFieldChange('primaryColor', e.target.value)}
                />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Secondary Color</Label>
            <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: preset.secondaryColor }} />
                <Input
                    value={preset.secondaryColor}
                    onChange={(e) => onFieldChange('secondaryColor', e.target.value)}
                />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Trim Color</Label>
            <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: preset.trimColor }} />
                <Input
                    value={preset.trimColor}
                    onChange={(e) => onFieldChange('trimColor', e.target.value)}
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
              onChange={(e) => onFieldChange('font', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="art-style" className="text-right">
              Art Style
            </Label>
            <div className="col-span-3 space-y-2">
                <Select 
                    value={isArtStyleOther ? "Other" : preset.artStyle} 
                    onValueChange={(value) => {
                        if (value !== 'Other') {
                            onFieldChange('artStyle', value);
                        } else {
                            onFieldChange('artStyle', '');
                        }
                    }}>
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
                        onChange={(e) => onFieldChange('artStyle', e.target.value)}
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
          <Button type="submit" onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function BrandKitsPage() {
  const [allPresets, setAllPresets] = useState(mockBrandPresets);
  const [editingPreset, setEditingPreset] = useState<BrandPreset | null>(null);

  const handleEditClick = (preset: BrandPreset) => {
    setEditingPreset({ ...preset });
  };

  const handleCloseModal = () => {
    setEditingPreset(null);
  };
  
  const handleFieldChange = (field: keyof BrandPreset, value: string) => {
    if (editingPreset) {
      setEditingPreset({ ...editingPreset, [field]: value });
    }
  };

  const handleSavePreset = () => {
    if (editingPreset) {
        setAllPresets(allPresets.map(p => p.id === editingPreset.id ? editingPreset : p));
        setEditingPreset(null);
    }
  }

  const presets = [...allPresets];
  while (presets.length < 10) {
    presets.push({
      id: `empty-${presets.length}`,
      name: '',
      primaryColor: '',
      secondaryColor: '',
      trimColor: '',
      font: '',
      artStyle: '',
      logoUrl: '',
      logoAlt: ''
    });
  }


  return (
    <>
      <Header title="Brand Presets">
        <Button>Add New Brand</Button>
      </Header>
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Secondary</TableHead>
                  <TableHead>Trim</TableHead>
                  <TableHead>Font</TableHead>
                  <TableHead>Art Style</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presets.map((preset) =>
                  preset.name ? (
                    <TableRow key={preset.id}>
                      <TableCell className="font-medium">{preset.name}</TableCell>
                      <TableCell>
                        <ColorSwatch color={preset.primaryColor} />
                      </TableCell>
                      <TableCell>
                        <ColorSwatch color={preset.secondaryColor} />
                      </TableCell>
                      <TableCell>
                        <ColorSwatch color={preset.trimColor} />
                      </TableCell>
                      <TableCell>{preset.font}</TableCell>
                      <TableCell>{preset.artStyle}</TableCell>
                      <TableCell>
                        <Image
                          src={preset.logoUrl}
                          alt={preset.logoAlt}
                          width={40}
                          height={40}
                          className="rounded-md bg-muted"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(preset)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={preset.id}>
                      <TableCell colSpan={8} className="text-center text-muted-foreground h-16">
                        Empty Slot
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <EditBrandModal 
        preset={editingPreset}
        onClose={handleCloseModal}
        onSave={handleSavePreset}
        onFieldChange={handleFieldChange}
      />
    </>
  );
}
