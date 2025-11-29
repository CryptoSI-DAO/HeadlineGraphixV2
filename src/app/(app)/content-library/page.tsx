'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import type { GeneratedContent } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Eye, FileText, Plus } from 'lucide-react';

const TOTAL_SLOTS = 10;

export default function ContentLibraryPage() {
  const { history, deleteHistoryItem } = useAppContext();
  const [selectedItem, setSelectedItem] = useState<GeneratedContent | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GeneratedContent | null>(null);

  const handleViewClick = (item: GeneratedContent) => {
    setSelectedItem(item);
  };

  const handleDeleteClick = (item: GeneratedContent) => {
    setItemToDelete(item);
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteHistoryItem(itemToDelete.id);
      setItemToDelete(null);
    }
  }

  const slots = Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
    return history[index] || null;
  });

  return (
    <>
      <Header title="Content Library" />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {slots.map((item, index) => item ? (
                <Card key={item.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="truncate">{item.headline}</CardTitle>
                        <CardDescription>
                            {item.date.toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <div>
                            <Badge variant="secondary">{item.config.brandTone}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText size={16}/>
                            <span>{item.type}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewClick(item)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                         <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(item)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card key={`empty-${index}`} className="flex items-center justify-center border-2 border-dashed bg-muted/50">
                    <div className="text-center text-muted-foreground">
                        <Plus className="mx-auto h-8 w-8 mb-2" />
                        <p className="font-semibold">Slot #{index + 1}</p>
                        <p className="text-sm">Empty</p>
                    </div>
                </Card>
            ))}
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

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this content pack from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
