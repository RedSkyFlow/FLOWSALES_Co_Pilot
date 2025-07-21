
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { addProduct } from '@/app/settings/products/actions';

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

const productSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  type: z.enum(['product', 'service', 'license']),
  pricingModel: z.enum(['subscription', 'one-time', 'per_item']),
  basePrice: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
        name: '',
        description: '',
        type: 'product',
        pricingModel: 'one-time',
        basePrice: 0,
        tags: '',
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

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Hardcoded tenantId for now
      const tenantId = 'tenant-001';
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
      await addProduct({ ...data, tenantId, tags: tagsArray });
      toast({
        title: "Product Added",
        description: `${data.name} has been successfully added to your catalog.`,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
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
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details for your new product or service.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>
             <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} className={errors.description ? 'border-destructive' : ''} />
              {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="type">Type</Label>
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="product">Product</SelectItem>
                                    <SelectItem value="service">Service</SelectItem>
                                    <SelectItem value="license">License</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="pricingModel">Pricing Model</Label>
                    <Controller
                        name="pricingModel"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="pricingModel"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one-time">One-Time</SelectItem>
                                    <SelectItem value="subscription">Subscription</SelectItem>
                                    <SelectItem value="per_item">Per Item</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>
             <div className="space-y-1">
              <Label htmlFor="basePrice">Base Price (USD)</Label>
              <Input id="basePrice" type="number" step="0.01" {...register('basePrice')} className={errors.basePrice ? 'border-destructive' : ''} />
              {errors.basePrice && <p className="text-destructive text-xs mt-1">{errors.basePrice.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" {...register('tags')} placeholder="e.g. retail, engagement, analytics" />
              <p className="text-xs text-muted-foreground">Separate tags with a comma.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
