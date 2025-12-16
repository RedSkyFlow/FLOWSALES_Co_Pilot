'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface EditableProductTableProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

export function EditableProductTable({ products, onProductsChange }: EditableProductTableProps) {
  const [editableProducts, setEditableProducts] = useState(products);

  const handleProductChange = (index: number, field: keyof Product, value: any) => {
    const updatedProducts = [...editableProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setEditableProducts(updatedProducts);
    onProductsChange(updatedProducts);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {editableProducts.map((product, index) => (
          <TableRow key={product.id}>
            <TableCell>
              <Input
                value={product.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
              />
            </TableCell>
            <TableCell>
              <Input
                value={product.description}
                onChange={(e) => handleProductChange(index, 'description', e.target.value)}
              />
            </TableCell>
            <TableCell>
              <Input
                type="number"
                value={product.price}
                onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value))}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
