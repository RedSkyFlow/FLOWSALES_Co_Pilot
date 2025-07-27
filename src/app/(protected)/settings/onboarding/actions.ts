
'use server';

import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { addDoc, collection, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

/**
 * Parses a CSV file content and creates unverified products for a given tenant.
 * @param tenantId The ID of the tenant.
 * @param csvContent The string content of the uploaded CSV file.
 */
export async function processProductCatalog(tenantId: string, csvContent: string): Promise<{ success: boolean; message: string; count: number }> {
    if (!tenantId || !csvContent) {
        throw new Error('Tenant ID and CSV content are required.');
    }

    try {
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');
        if (lines.length <= 1) {
            return { success: false, message: 'CSV file must have a header and at least one data row.', count: 0 };
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const products: Omit<Product, 'id'>[] = [];

        // Basic validation for required headers
        const requiredHeaders = ['name', 'description', 'baseprice', 'pricingmodel', 'type'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            return { success: false, message: `CSV is missing required headers: ${missingHeaders.join(', ')}.`, count: 0 };
        }
        
        const nameIndex = headers.indexOf('name');
        const descriptionIndex = headers.indexOf('description');
        const basePriceIndex = headers.indexOf('baseprice');
        const pricingModelIndex = headers.indexOf('pricingmodel');
        const typeIndex = headers.indexOf('type');
        const tagsIndex = headers.indexOf('tags');


        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            
            const basePrice = parseFloat(values[basePriceIndex]);
            if (isNaN(basePrice)) continue; // Skip rows with invalid price

            const productData: Omit<Product, 'id'> = {
                name: values[nameIndex] || 'Unnamed Product',
                description: values[descriptionIndex] || '',
                basePrice: basePrice,
                pricingModel: (values[pricingModelIndex] as any) || 'one-time',
                type: (values[typeIndex] as any) || 'product',
                tags: tagsIndex !== -1 ? values[tagsIndex]?.split(';').map(t => t.trim()) : [],
                // @ts-ignore - Adding a temporary status for the onboarding flow
                status: 'unverified'
            };
            products.push(productData);
        }

        if (products.length === 0) {
            return { success: false, message: 'No valid products found in the CSV file.', count: 0 };
        }

        const batch = writeBatch(db);
        const productsCollectionRef = collection(db, 'tenants', tenantId, 'products');

        products.forEach(product => {
            const newProductRef = doc(productsCollectionRef);
            batch.set(newProductRef, product);
        });

        await batch.commit();
        
        revalidatePath('/settings/products');
        revalidatePath('/settings/onboarding');

        return { success: true, message: 'Successfully imported products.', count: products.length };

    } catch (error) {
        console.error("Error processing product catalog: ", error);
        // In a real app, you might want to log this error more formally
        return { success: false, message: 'An unexpected error occurred while processing the file.', count: 0 };
    }
}
