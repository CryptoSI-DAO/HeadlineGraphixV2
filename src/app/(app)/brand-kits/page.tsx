'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useBrandKits, type BrandPreset } from '@/hooks/use-brand-kits';
import { BrandPresetsTable, EditBrandModal } from './components';

export default function BrandKitsPage() {
  const { presets, isLoading, isSaving, saveBrand, deleteBrand } = useBrandKits();
  const [editingPreset, setEditingPreset] = useState<BrandPreset | null>(null);

  const handleEditClick = (preset: BrandPreset) => {
    setEditingPreset({ ...preset });
  };

  const handleAddNew = () => {
    setEditingPreset({
      id: '',
      name: '',
      primaryColor: '',
      secondaryColor: '',
      trimColor: '',
      font: '',
      artStyle: '',
      logoUrl: '',
      logoAlt: '',
    });
  };

  const handleCloseModal = () => {
    setEditingPreset(null);
  };

  const handleFieldChange = (field: keyof BrandPreset, value: string) => {
    if (editingPreset) {
      setEditingPreset({ ...editingPreset, [field]: value });
    }
  };

  const handleSavePreset = async (logoFile?: File) => {
    if (editingPreset) {
      try {
        await saveBrand(editingPreset, logoFile);
        setEditingPreset(null);
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await deleteBrand(id);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const displayPresets = [...presets];
  while (displayPresets.length < 10) {
    displayPresets.push({
      id: `empty-${displayPresets.length}`,
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
        <Button onClick={handleAddNew} disabled={isLoading || isSaving}>
          Add New Brand
        </Button>
      </Header>
      <main className="flex-1 p-4 md:p-6">
        <BrandPresetsTable
          presets={displayPresets}
          onEdit={handleEditClick}
          onDelete={handleDeletePreset}
          isLoading={isLoading}
        />
      </main>

      <EditBrandModal
        preset={editingPreset}
        onClose={handleCloseModal}
        onSave={handleSavePreset}
        onFieldChange={handleFieldChange}
        isSaving={isSaving}
      />
    </>
  );
}
