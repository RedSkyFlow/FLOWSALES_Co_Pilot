
'use server';

import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { addDoc, collection, writeBatch, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

/**
 * A robust CSV parser that handles commas inside quoted fields.
 * @param line The CSV line to parse.
 * @returns An array of strings representing the columns.
 */
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}


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
        
        const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const products: Omit<Product, 'id'>[] = [];

        // Flexible header mapping
        const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('product') || h.includes('description'));
        const descriptionIndex = headers.findIndex(h => h.includes('description'));
        const basePriceIndex = headers.findIndex(h => h.includes('price') || h.includes('selling price') || h.includes('retail price'));
        const pricingModelIndex = headers.findIndex(h => h.includes('pricing') || h.includes('model'));
        const typeIndex = headers.findIndex(h => h.includes('type'));
        const tagsIndex = headers.indexOf('tags');

        if (nameIndex === -1) {
            return { success: false, message: 'CSV must contain at least a "name" or "description" column.', count: 0 };
        }

        for (let i = 1; i < lines.length; i++) {
            const values = parseCsvLine(lines[i]).map(v => v.trim().replace(/"/g, ''));
            
            // Skip empty lines or lines that don't match header length
            if (values.length < headers.length || values.every(v => v === '')) continue;

            // Use a default price of 0 if parsing fails or index is invalid
            const basePrice = basePriceIndex !== -1 ? parseFloat(values[basePriceIndex]) : NaN;

            const productName = values[nameIndex] || 'Unnamed Product';
            if (!productName || productName === 'Unnamed Product') {
                continue; // Skip rows without a valid name
            }

            const productData: Omit<Product, 'id'> = {
                name: productName,
                description: descriptionIndex !== -1 ? values[descriptionIndex] || '' : 'No description provided.',
                basePrice: isNaN(basePrice) ? 0 : basePrice,
                pricingModel: (pricingModelIndex !== -1 ? values[pricingModelIndex] as any : 'one-time') || 'one-time',
                type: (typeIndex !== -1 ? values[typeIndex] as any : 'product') || 'product',
                tags: tagsIndex !== -1 && values[tagsIndex] ? values[tagsIndex].split(';').map(t => t.trim()) : [],
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

        return { success: true, message: `Successfully imported ${products.length} products.`, count: products.length };

    } catch (error) {
        console.error("Error processing product catalog: ", error);
        // In a real app, you might want to log this error more formally
        return { success: false, message: 'An unexpected error occurred while processing the file.', count: 0 };
    }
}
