
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { acceptProposal } from '@/app/proposals/actions';
import type { Proposal } from '@/lib/types';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from './hooks/use-toast';

interface AcceptProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  tenantId: string;
}

export function AcceptProposalDialog({
  open,
  onOpenChange,
  proposal,
  tenantId,
}: AcceptProposalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await acceptProposal(tenantId, proposal.id);
      
      toast({
        title: "Proposal Accepted!",
        description: "You have formally accepted this proposal. The sales team has been notified.",
      });
      onOpenChange(false);
      // The parent component will now handle the UI change to 'signed'
    } catch (error) {
      console.error('Failed to accept proposal:', error);
       toast({
        title: "Action Failed",
        description: "There was an error accepting the proposal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                <ShieldCheck className="h-6 w-6 text-success" aria-hidden="true" />
            </div>
          <DialogTitle className="text-center mt-4">Accept Proposal</DialogTitle>
          <DialogDescription className="text-center px-4">
            You are about to formally accept the terms and conditions of this proposal. This action is binding and will notify the sales team.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-success hover:bg-success/90 text-success-foreground"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            I Understand, Accept Proposal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
