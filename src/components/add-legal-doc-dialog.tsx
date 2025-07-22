
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { addLegalDocument, updateLegalDocument } from '@/app/settings/legal/actions';
import type { LegalDocument } from '@/lib/types';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';

const legalDocSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  content: z.string().min(20, { message: "Content must be at least 20 characters." }),
});

type LegalDocFormData = z.infer<typeof legalDocSchema>;

interface AddLegalDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docToEdit?: LegalDocument | null;
  tenantId?: string | null;
}

export function AddLegalDocDialog({ open, onOpenChange, docToEdit, tenantId }: AddLegalDocDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!docToEdit;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LegalDocFormData>({
    resolver: zodResolver(legalDocSchema),
    defaultValues: {
        title: '',
        content: '',
    }
  });

  useEffect(() => {
    if (docToEdit) {
      reset({
        title: docToEdit.title,
        content: docToEdit.content,
      });
    } else {
      reset({
        title: '',
        content: '',
      });
    }
  }, [docToEdit, reset]);

  const handleDialogClose = (isOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(isOpen);
    }
  };

  const onSubmit = async (data: LegalDocFormData) => {
    if (!tenantId) {
        toast({ title: "Error", description: "Tenant not identified. Cannot save document.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateLegalDocument(tenantId, docToEdit.id, data);
        toast({
          title: "Document Updated",
          description: `"${data.title}" has been successfully updated.`,
        });
      } else {
        await addLegalDocument({ ...data, tenantId });
        toast({
          title: "Document Added",
          description: `"${data.title}" has been successfully added.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const action = isEditMode ? 'update' : 'add';
      toast({
        title: "Error",
        description: `Failed to ${action} document. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Document' : 'Add New Legal Document'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details for this document.' : 'Create a new reusable legal document.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} className={errors.title ? 'border-destructive' : ''} placeholder="e.g., Standard Terms & Conditions" />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="content">Content (Markdown supported)</Label>
              <Textarea id="content" {...register('content')} className={errors.content ? 'border-destructive' : ''} rows={12} placeholder="Enter the full text of your legal document here..." />
              {errors.content && <p className="text-destructive text-xs mt-1">{errors.content.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Save Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
