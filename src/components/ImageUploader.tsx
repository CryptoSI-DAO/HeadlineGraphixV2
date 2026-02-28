
'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export type UploadFile = { file: File; preview: string };

type ImageUploaderProps = {
  onFilesChange?: (files: UploadFile[]) => void;
  resetSignal?: number;
  disabled?: boolean;
};

export function ImageUploader({ onFilesChange, resetSignal, disabled = false }: ImageUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp']
    },
    disabled,
  });

  useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  useEffect(() => {
    if (resetSignal === undefined) {
      return;
    }
    setFiles([]);
    onFilesChange?.([]);
  }, [resetSignal, onFilesChange]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors',
          isDragActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p className="text-muted-foreground">Drag files here, or click to select files</p>
        )}
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={file.preview}
                alt={`preview ${index}`}
                fill
                className="object-cover rounded-md"
                onLoad={() => { URL.revokeObjectURL(file.preview) }}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
