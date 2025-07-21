
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { addClient } from '@/app/clients/actions';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

const clientSchema = z.object({
  name: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  industry: z.string().min(1, { message: "Please select an industry." }),
  contactPerson: z.string().min(2, { message: "Contact person must be at least 2 characters." }),
  contactEmail: z.string().email({ message: "Please enter a valid email address." }),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const industries = [
    'Sports & Entertainment',
    'Retail',
    'Telecommunications',
    'Hospitality',
    'Education',
    'Other'
];

export function AddClientDialog({ open, onOpenChange }: AddClientDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
        name: '',
        industry: '',
        contactPerson: '',
        contactEmail: '',
        notes: '',
    }
  });

  const handleDialogClose = (isOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(isOpen);
      if (!isOpen) {
        reset();
      }
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      // Hardcoded tenantId for now
      const tenantId = 'tenant-001';
      await addClient({ ...data, tenantId });
      toast({
        title: "Client Added",
        description: `${data.name} has been successfully added to your client list.`,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Fill in the details for your new client. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <div className="col-span-3">
                <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="industry" className="text-right">Industry</Label>
                <div className="col-span-3">
                    <Controller
                        name="industry"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="industry" className={errors.industry ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select an industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    {industries.map(industry => (
                                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.industry && <p className="text-destructive text-xs mt-1">{errors.industry.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPerson" className="text-right">Contact</Label>
              <div className="col-span-3">
                <Input id="contactPerson" {...register('contactPerson')} placeholder="e.g. Jane Doe" className={errors.contactPerson ? 'border-destructive' : ''} />
                {errors.contactPerson && <p className="text-destructive text-xs mt-1">{errors.contactPerson.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactEmail" className="text-right">Email</Label>
              <div className="col-span-3">
                <Input id="contactEmail" {...register('contactEmail')} placeholder="jane.doe@example.com" className={errors.contactEmail ? 'border-destructive' : ''} />
                {errors.contactEmail && <p className="text-destructive text-xs mt-1">{errors.contactEmail.message}</p>}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <div className="col-span-3">
                <Textarea id="notes" {...register('notes')} placeholder="Any relevant notes about the client..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
