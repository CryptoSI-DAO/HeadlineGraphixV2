'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import type { BrandPreset } from './types';
import { mockBrandPresets } from './mock-data';
import { BrandPresetsTable, EditBrandModal } from './components';

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
      setAllPresets(
        allPresets.map(preset => (preset.id === editingPreset.id ? editingPreset : preset))
      );
      setEditingPreset(null);
    }
  };

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
      logoAlt: '',
    });
  }

  return (
    <>
      <Header title="Brand Presets">
        <Button>Add New Brand</Button>
      </Header>
      <main className="flex-1 p-4 md:p-6">
        <BrandPresetsTable presets={presets} onEdit={handleEditClick} />
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
