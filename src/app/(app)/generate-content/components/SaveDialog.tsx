import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlusSquare } from 'lucide-react';

export const SaveDialog = ({
  isOpen,
  onOpenChange,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (slot: number) => void;
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Choose a Save Slot</DialogTitle>
        <DialogDescription>
          Select one of your 10 available slots to save this content pack.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-5 gap-4 py-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Button
            key={index}
            variant="outline"
            className="aspect-square h-auto w-full flex flex-col gap-2"
            onClick={() => onSave(index + 1)}
          >
            <PlusSquare className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-semibold">Slot #{index + 1}</span>
          </Button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);
