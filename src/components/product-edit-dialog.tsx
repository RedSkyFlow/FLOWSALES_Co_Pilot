
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { createProduct, updateProduct } from '@/app/(protected)/settings/products/actions';

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
import type { Product } from '@/lib/types';
import { InputWithLabel } from './input-with-label';

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  type: z.enum(['product', 'service', 'license']),
  pricingModel: z.enum(['subscription', 'one-time', 'per_item']),
  basePrice: z.coerce.number().min(0, "Price must be a positive number."),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  product: Product | null;
}

export function ProductEditDialog({ open, onOpenChange, tenantId, product }: ProductEditDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        tags: product.tags?.join(', '),
      });
    } else {
      reset({
        name: '',
        description: '',
        type: 'product',
        pricingModel: 'one-time',
        basePrice: 0,
        tags: '',
      });
    }
  }, [product, open, reset]);


  const handleDialogClose = (isOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(isOpen);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const productData = {
        ...data,
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
      };
      
      if (product) {
        await updateProduct(tenantId, product.id, productData);
        toast({ title: "Product Updated", description: `${data.name} has been updated.` });
      } else {
        await createProduct(tenantId, productData);
        toast({ title: "Product Added", description: `${data.name} has been added to your catalog.` });
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Failed to save product. Please try again.`,
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
            <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              Fill in the details for this product or service. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              <InputWithLabel label="Product Name" id="name" register={register('name')} error={errors.name} />
              <InputWithLabel label="Description" id="description" register={register('description')} error={errors.description} useTextarea />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <InputWithLabel label="Type" error={errors.type}>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="product">Product</SelectItem>
                                    <SelectItem value="service">Service</SelectItem>
                                    <SelectItem value="license">License</SelectItem>
                                </SelectContent>
                            </Select>
                        </InputWithLabel>
                    )}
                />
                 <Controller
                    name="pricingModel"
                    control={control}
                    render={({ field }) => (
                         <InputWithLabel label="Pricing Model" error={errors.pricingModel}>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="subscription">Subscription</SelectItem>
                                    <SelectItem value="one-time">One-Time</SelectItem>
                                    <SelectItem value="per_item">Per Item</SelectItem>
                                </SelectContent>
                            </Select>
                        </InputWithLabel>
                    )}
                />
              </div>

              <InputWithLabel label="Base Price ($)" id="basePrice" type="number" register={register('basePrice')} error={errors.basePrice} />
              <InputWithLabel label="Tags" id="tags" register={register('tags')} error={errors.tags} placeholder="e.g. sports, engagement, retail" />
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
