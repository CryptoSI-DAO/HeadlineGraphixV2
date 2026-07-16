
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import type { GeneratedContent } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Eye, FileText, Plus, Library, MoreHorizontal, Calendar } from 'lucide-react';

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

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await deleteHistoryItem(itemToDelete.id);
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
        {/* Desktop: Table */}
        <Card className="hidden md:block">
            <CardContent className="p-0">
                <Table className="min-w-[700px]">
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[80px]">Slot</TableHead>
                        <TableHead>Headline</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {slots.map((item, index) => item ? (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">#{index + 1}</TableCell>
                                <TableCell className="font-semibold">{item.headline}</TableCell>
                                <TableCell><Badge variant="secondary">{item.config.brandTone}</Badge></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <FileText size={16}/>
                                        <span>{item.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{item.date.toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleViewClick(item)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="mr-2 h-4 w-4" />
                                                <span>Download</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(item)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow key={`empty-${index}`}>
                                <TableCell className="font-medium text-muted-foreground">#{index + 1}</TableCell>
                                <TableCell colSpan={4} className="text-muted-foreground italic">Empty Slot</TableCell>
                                <TableCell className="text-right"></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {history.length === 0 && (
                    <div className="text-center text-muted-foreground p-12 h-full flex flex-col items-center justify-center">
                        <Library className="h-10 w-10 mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-1">Your Library is Empty</h3>
                        <p className="max-w-xs mx-auto">Generated content will appear here once you save it.</p>
                  </div>
                )}
            </CardContent>
        </Card>

        {/* Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {slots.map((item, index) => item ? (
            <Card key={item.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <Badge variant="secondary" className="shrink-0">{item.config.brandTone}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewClick(item)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(item)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-semibold text-sm leading-snug">{item.headline}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {item.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {item.date.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={`empty-${index}`} className="opacity-50">
              <CardContent className="p-4 flex items-center gap-2 text-muted-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {index + 1}
                </span>
                <span className="italic text-sm">Empty Slot</span>
              </CardContent>
            </Card>
          ))}
          {history.length === 0 && (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
              <Library className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-1">Your Library is Empty</h3>
              <p className="max-w-xs">Generated content will appear here once you save it.</p>
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8">{selectedItem?.headline}</DialogTitle>
            <DialogDescription>
              Generated on {selectedItem?.date.toLocaleString()} with a &lsquo;{selectedItem?.config.brandTone}&rsquo; tone.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
             <Tabs defaultValue="blog" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="blog" className="flex-1">Blog Post</TabsTrigger>
                  <TabsTrigger value="linkedin" className="flex-1">LinkedIn</TabsTrigger>
                </TabsList>
                <TabsContent value="blog" className="mt-4 max-h-[50vh] overflow-y-auto bg-muted p-4 rounded-md text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{selectedItem.drafts.blogPost}</pre>
                </TabsContent>
                <TabsContent value="linkedin" className="mt-4 max-h-[50vh] overflow-y-auto bg-muted p-4 rounded-md text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{selectedItem.drafts.linkedInPost}</pre>
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
