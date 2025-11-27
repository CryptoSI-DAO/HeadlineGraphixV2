'use client';

import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

export default function GenerateImagePage() {
  return (
    <>
      <Header title="Generate Image" />
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Image Generation Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This page is under construction. Check back later for options to generate images with AI.</p>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
