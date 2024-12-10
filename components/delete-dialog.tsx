import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-destructive/20">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete QR Code</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to delete this QR code? This action cannot
                be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="my-4 p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium">{itemName}</p>
        </div>
        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete QR Code
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
