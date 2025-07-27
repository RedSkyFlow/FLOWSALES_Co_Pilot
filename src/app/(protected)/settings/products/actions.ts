
'use server';

import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

type ProductInput = Omit<Product, 'id'>;

/**
 * Creates a new product for a given tenant.
 * @param tenantId The ID of the tenant.
 * @param data The product data.
 */
export async function createProduct(tenantId: string, data: ProductInput) {
    if (!tenantId || !data.name) {
        throw new Error('Tenant ID and Product Name are required.');
    }

    try {
        const productsCollectionRef = collection(db, 'tenants', tenantId, 'products');
        await addDoc(productsCollectionRef, data);
        revalidatePath('/settings/products');
    } catch (error) {
        console.error("Error creating product: ", error);
        throw new Error('Could not create the product. Please try again.');
    }
}

/**
 * Updates an existing product for a given tenant.
 * @param tenantId The ID of the tenant.
 * @param productId The ID of the product to update.
 * @param data The updated product data.
 */
export async function updateProduct(tenantId: string, productId: string, data: Partial<ProductInput>) {
     if (!tenantId || !productId) {
        throw new Error('Tenant ID and Product ID are required.');
    }

    try {
        const productDocRef = doc(db, 'tenants', tenantId, 'products', productId);
        await updateDoc(productDocRef, data);
        revalidatePath('/settings/products');
    } catch (error) {
        console.error("Error updating product: ", error);
        throw new Error('Could not update the product. Please try again.');
    }
}
