
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Product } from '@/lib/types';

interface AddProductInput {
    tenantId: string;
    name: string;
    description: string;
    type: 'product' | 'service' | 'license';
    pricingModel: 'subscription' | 'one-time' | 'per_item';
    basePrice: number;
    tags: string[];
}

export async function addProduct(data: AddProductInput) {
    if (!data.tenantId || !data.name || data.basePrice === undefined) {
        throw new Error('Tenant ID, Name, and Price are required.');
    }

    try {
        const productsCollectionRef = collection(db, 'tenants', data.tenantId, 'products');
        await addDoc(productsCollectionRef, {
            name: data.name,
            description: data.description,
            type: data.type,
            pricingModel: data.pricingModel,
            basePrice: data.basePrice,
            tags: data.tags,
        });
        revalidatePath('/settings/products');
        revalidatePath('/proposals/new'); // To refresh products in wizard
    } catch (error) {
        console.error("Error adding product: ", error);
        throw new Error('Could not create the product. Please try again.');
    }
}


export async function updateProduct(tenantId: string, productId: string, data: Omit<AddProductInput, 'tenantId'>) {
    if (!tenantId || !productId) {
        throw new Error('Tenant ID and Product ID are required.');
    }

    try {
        const productDocRef = doc(db, 'tenants', tenantId, 'products', productId);
        await updateDoc(productDocRef, {
            name: data.name,
            description: data.description,
            type: data.type,
            pricingModel: data.pricingModel,
            basePrice: data.basePrice,
            tags: data.tags,
        });
        revalidatePath('/settings/products');
        revalidatePath('/proposals/new');
    } catch (error) {
        console.error("Error updating product: ", error);
        throw new Error('Could not update the product. Please try again.');
    }
}

export async function deleteProduct(tenantId: string, productId: string) {
    if (!tenantId || !productId) {
        throw new Error('Tenant ID and Product ID are required.');
    }

    try {
        const productDocRef = doc(db, 'tenants', tenantId, 'products', productId);
        await deleteDoc(productDocRef);
        revalidatePath('/settings/products');
        revalidatePath('/proposals/new');
    } catch (error) {
        console.error("Error deleting product: ", error);
        throw new Error('Could not delete the product. Please try again.');
    }
}
