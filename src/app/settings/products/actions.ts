
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

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
    if (!data.tenantId || !data.name || !data.basePrice) {
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
