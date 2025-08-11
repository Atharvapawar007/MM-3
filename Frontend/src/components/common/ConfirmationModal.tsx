import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmationModal({
  open,
  title = 'Confirm Action',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md p-0 bg-white border shadow-lg overflow-hidden">
        <div className="flex flex-col items-center text-center gap-6 p-6">
          <div className="bg-red-50 p-4 rounded-full">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-muted-foreground text-sm">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 px-6 pb-6">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            disabled={loading} 
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading} 
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
