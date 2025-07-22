
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface ConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConsentDialog({
  open,
  onOpenChange,
  onConfirm,
}: ConsentDialogProps) {

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Confirm Consent to Record</DialogTitle>
          <DialogDescription className="text-center px-4">
            Before starting the live co-pilot, you must confirm you have received explicit consent from all meeting participants to record and process this conversation.
          </DialogDescription>
        </DialogHeader>
        <Alert variant="destructive" className="my-4">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Legal Requirement</AlertTitle>
            <AlertDescription>
                Recording conversations without consent may be illegal in your jurisdiction. Ensure you comply with all applicable laws and company policies.
            </AlertDescription>
        </Alert>
        <DialogFooter className="sm:justify-center pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            I Have Consent, Start Co-pilot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
