
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { inviteUser } from '@/app/(protected)/settings/users/actions';

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

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(['admin', 'sales_agent'], { required_error: "Please select a role." }),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId?: string | null;
}

export function InviteUserDialog({ open, onOpenChange, tenantId }: InviteUserDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
        email: '',
        role: 'sales_agent',
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

  const onSubmit = async (data: InviteFormData) => {
    if (!tenantId) {
        toast({ title: "Error", description: "Your organization could not be identified.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      await inviteUser({ ...data, tenantId });
      toast({
        title: "User Invited",
        description: `An invitation has been sent to ${data.email}. They can now set their password and log in.`,
      });
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast({
        title: "Invitation Failed",
        description: error.message || "An unknown error occurred.",
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
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              The new user will receive an email to set up their password and access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
                <Label htmlFor="role">Role</Label>
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="role" className={errors.role ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sales_agent">Sales Agent</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                <p className="text-xs text-muted-foreground">Admins can manage users and settings.</p>
                {errors.role && <p className="text-destructive text-xs mt-1">{errors.role.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
