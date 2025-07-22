
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { bulkAddProducts } from '@/app/settings/products/actions';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Loader2, Sparkles } from 'lucide-react';

const bulkAddSchema = z.object({
  productList: z.string().min(10, { message: "Please paste a list of products." }),
});

type BulkAddFormData = z.infer<typeof bulkAddSchema>;

interface BulkAddProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId?: string | null;
}

export function BulkAddProductsDialog({ open, onOpenChange, tenantId }: BulkAddProductsDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BulkAddFormData>({
    resolver: zodResolver(bulkAddSchema),
  });

  const handleDialogClose = (isOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(isOpen);
      if (!isOpen) {
        reset();
      }
    }
  };

  const onSubmit = async (data: BulkAddFormData) => {
    if (!tenantId) {
        toast({ title: "Error", description: "Tenant not identified. Cannot save products.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const count = await bulkAddProducts(tenantId, data.productList);
      toast({
        title: "Products Added",
        description: `${count} products have been successfully added to your catalog.`,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add products. Please check the list format and try again.",
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
            <DialogTitle>Bulk Add Products</DialogTitle>
            <DialogDescription>
              Paste your product list below. The AI will parse the name, price, and description for each item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="productList" className="sr-only">Product List</Label>
              <Textarea
                id="productList"
                {...register('productList')}
                className={errors.productList ? 'border-destructive' : ''}
                rows={10}
                placeholder="Example:
- Venue OS License - $15,000 - Annual license for our core operating system.
- Retail Analytics Suite - $5,000 - Advanced analytics for retail clients.
- On-site Installation Service - 2500 - One-time installation and setup."
              />
              {errors.productList && <p className="text-destructive text-sm mt-1">{errors.productList.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Parse & Add Products
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
