import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlusSquare } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const SaveDialog = ({
  isOpen,
  onOpenChange,
  onSave,
  filledSlots,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (slot: number) => void;
  filledSlots: boolean[];
}) => (
  <SaveDialogBody
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    onSave={onSave}
    filledSlots={filledSlots}
  />
);

const SaveDialogBody = ({
  isOpen,
  onOpenChange,
  onSave,
  filledSlots,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (slot: number) => void;
  filledSlots: boolean[];
}) => {
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);

  const handleSlotClick = (slot: number, isFilled: boolean) => {
    if (isFilled) {
      setPendingSlot(slot);
      return;
    }
    onSave(slot);
  };

  const handleConfirmOverwrite = () => {
    if (!pendingSlot) return;
    const slot = pendingSlot;
    setPendingSlot(null);
    onSave(slot);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose a Save Slot</DialogTitle>
            <DialogDescription>
              Select one of your 10 available slots to save this content pack.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-3 md:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => {
              const slotNumber = index + 1;
              const isFilled = Boolean(filledSlots[index]);
              return (
                <Button
                  key={slotNumber}
                  variant="outline"
                  className="aspect-square h-auto w-full flex flex-col gap-2"
                  onClick={() => handleSlotClick(slotNumber, isFilled)}
                >
                  <PlusSquare className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-semibold">Slot #{slotNumber}</span>
                  {isFilled && <span className="text-xs text-muted-foreground">Filled</span>}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pendingSlot !== null} onOpenChange={(open) => !open && setPendingSlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite this slot?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose this content in this slot permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingSlot(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverwrite}>Overwrite</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
