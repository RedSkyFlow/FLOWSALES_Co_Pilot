
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { addProductRule } from '@/app/settings/rules/actions';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Product } from '@/lib/types';

const ruleSchema = z.object({
  primaryProductId: z.string().min(1, "Please select a primary product."),
  relatedProductId: z.string().min(1, "Please select a related product."), // Simplified for now
  type: z.enum(['dependency', 'conflict', 'recommendation']),
  condition: z.enum(['requires_one', 'requires_all', 'conflicts_with']),
}).refine(data => data.primaryProductId !== data.relatedProductId, {
    message: "Primary and related products cannot be the same.",
    path: ["relatedProductId"],
});

type RuleFormData = z.infer<typeof ruleSchema>;

interface AddRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  tenantId?: string | null;
}

export function AddRuleDialog({ open, onOpenChange, products, tenantId }: AddRuleDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
        primaryProductId: '',
        relatedProductId: '',
        type: 'dependency',
        condition: 'requires_one',
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

  const onSubmit = async (data: RuleFormData) => {
    if (!tenantId) {
        toast({ title: "Error", description: "Tenant not identified. Cannot save rule.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      await addProductRule({ 
          ...data, 
          tenantId,
          relatedProductIds: [data.relatedProductId] // Convert single product to array
      });
      toast({
        title: "Rule Added",
        description: `A new product rule has been created.`,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add rule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Product Rule</DialogTitle>
            <DialogDescription>
              Define a relationship between two products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="type">Rule Type</Label>
               <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="dependency">Dependency</SelectItem>
                              <SelectItem value="conflict">Conflict</SelectItem>
                              <SelectItem value="recommendation">Recommendation</SelectItem>
                          </SelectContent>
                      </Select>
                  )}
              />
            </div>
            <div className="space-y-1">
              <Label>IF this product is selected...</Label>
               <Controller
                  name="primaryProductId"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className={errors.primaryProductId ? 'border-destructive' : ''}><SelectValue placeholder="Select a product..." /></SelectTrigger>
                          <SelectContent>
                              {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  )}
              />
              {errors.primaryProductId && <p className="text-destructive text-xs mt-1">{errors.primaryProductId.message}</p>}
            </div>
             <div className="space-y-1">
              <Label>THEN the following condition applies...</Label>
               <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="condition"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="requires_one">It Requires</SelectItem>
                              <SelectItem value="conflicts_with">It Conflicts With</SelectItem>
                          </SelectContent>
                      </Select>
                  )}
              />
            </div>
             <div className="space-y-1">
              <Label>...to this product.</Label>
               <Controller
                  name="relatedProductId"
                  control={control}
                  render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className={errors.relatedProductId ? 'border-destructive' : ''}><SelectValue placeholder="Select a product..."/></SelectTrigger>
                          <SelectContent>
                              {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  )}
              />
               {errors.relatedProductId && <p className="text-destructive text-xs mt-1">{errors.relatedProductId.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
