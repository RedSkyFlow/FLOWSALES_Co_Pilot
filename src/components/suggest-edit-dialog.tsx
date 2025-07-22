
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
import { Textarea } from '@/components/ui/textarea';
import { createSuggestedEdit } from '@/app/proposals/actions';
import type { Proposal, ProposalSection } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from './hooks/use-toast';

interface SuggestEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: Proposal;
  section: ProposalSection;
  sectionIndex: number;
  tenantId: string;
  currentUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export function SuggestEditDialog({
  open,
  onOpenChange,
  proposal,
  section,
  sectionIndex,
  tenantId,
  currentUser,
}: SuggestEditDialogProps) {
  const [suggestedContent, setSuggestedContent] = useState(section.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!suggestedContent.trim() || suggestedContent.trim() === section.content) {
        toast({
            title: "No changes made",
            description: "Please suggest a change before submitting.",
            variant: "destructive"
        });
        return;
    }

    setIsSubmitting(true);
    try {
      await createSuggestedEdit({
        tenantId,
        proposalId: proposal.id,
        sectionIndex,
        suggestedContent,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatarUrl: currentUser.avatarUrl,
      });
      toast({
        title: "Suggestion Submitted",
        description: "The sales team has been notified of your suggested change.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit suggestion:', error);
       toast({
        title: "Submission Failed",
        description: "There was an error submitting your suggestion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset content when dialog is opened
  useState(() => {
    if(open) {
        setSuggestedContent(section.content);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Suggest an Edit for "{section.title}"</DialogTitle>
          <DialogDescription>
            Propose a change to this section. The sales agent will be notified to review and approve your suggestion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <h4 className="font-semibold text-sm">Original Content</h4>
                <div className="p-3 bg-muted/50 rounded-md text-sm max-h-40 overflow-y-auto border">
                    {section.content}
                </div>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold text-sm">Your Suggested Version</h4>
                <Textarea
                    value={suggestedContent}
                    onChange={(e) => setSuggestedContent(e.target.value)}
                    rows={8}
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
