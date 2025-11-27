'use client';

import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function GenerateContentPage() {
  return (
    <>
      <Header title="Generate Content" />
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Generate Content</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This page is where you'll generate content. For now, you can go to the <Link href="/headlines" className="text-primary underline">Headlines</Link> page to start.</p>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
