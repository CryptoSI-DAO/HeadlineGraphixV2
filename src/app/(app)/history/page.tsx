'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import type { GeneratedContent } from '@/lib/types';

export default function HistoryPage() {
  const { history } = useAppContext();
  const [selectedItem, setSelectedItem] = useState<GeneratedContent | null>(null);

  const handleRowClick = (item: GeneratedContent) => {
    setSelectedItem(item);
  };

  return (
    <>
      <Header title="Generation History" />
      <main className="flex-1 p-4 md:p-6">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Brand Tone</TableHead>
                <TableHead className="text-right">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(item => (
                <TableRow key={item.id} onClick={() => handleRowClick(item)} className="cursor-pointer">
                  <TableCell>{item.date.toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium max-w-sm truncate">{item.headline}</TableCell>
                  <TableCell><Badge variant="secondary">{item.config.brandTone}</Badge></TableCell>
                  <TableCell className="text-right"><Badge>{item.type}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.headline}</DialogTitle>
            <DialogDescription>
              Generated on {selectedItem?.date.toLocaleString()} with a '{selectedItem?.config.brandTone}' tone.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
             <Tabs defaultValue="blog" className="w-full">
                <TabsList>
                  <TabsTrigger value="blog">Blog Post</TabsTrigger>
                  <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                  <TabsTrigger value="infographic">Infographic</TabsTrigger>
                </TabsList>
                <TabsContent value="blog" className="mt-4 max-h-[50vh] overflow-y-auto bg-muted p-4 rounded-md text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{selectedItem.drafts.blogPost}</pre>
                </TabsContent>
                <TabsContent value="linkedin" className="mt-4 max-h-[50vh] overflow-y-auto bg-muted p-4 rounded-md text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{selectedItem.drafts.linkedInPost}</pre>
                </TabsContent>
                <TabsContent value="infographic" className="mt-4 flex justify-center">
                    <div className="relative aspect-[2/3] w-full max-w-xs rounded-lg overflow-hidden border">
                        <Image src={selectedItem.drafts.infographic} alt="Generated Infographic" fill className="object-cover" />
                    </div>
                </TabsContent>
              </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
