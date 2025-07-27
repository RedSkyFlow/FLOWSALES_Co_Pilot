
'use server';

import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { writeBatch, collection, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { DocumentAnalysisOutput } from '@/ai/flows/ingest-and-analyze-configurator';

/**
 * Saves the entire extracted product and rule configuration to Firestore.
 * @param tenantId The ID of the tenant.
 * @param configuration The extracted products and rules from the AI analysis.
 */
export async function saveConfiguration(tenantId: string, configuration: DocumentAnalysisOutput): Promise<{ success: boolean; message: string; }> {
    if (!tenantId || !configuration) {
        throw new Error('Tenant ID and configuration data are required.');
    }
    
    const { products, rules } = configuration;

    if (!products || products.length === 0) {
        return { success: false, message: 'No products were found in the configuration to save.' };
    }

    try {
        const batch = writeBatch(db);
        const productsCollectionRef = collection(db, 'tenants', tenantId, 'products');
        const rulesCollectionRef = collection(db, 'tenants', tenantId, 'rules');

        // Add all new products to the batch
        products.forEach(product => {
            const newProductRef = doc(productsCollectionRef);
            // Ensure status is 'verified' upon bulk approval
            batch.set(newProductRef, { ...product, status: 'verified' });
        });
        
        // Add all new rules to the batch
        // Note: The 'rules' collection and its type would need to be formally defined in a real app.
        // For now, we are saving them as-is.
        rules.forEach(rule => {
            const newRuleRef = doc(rulesCollectionRef);
            batch.set(newRuleRef, rule);
        });

        await batch.commit();

        revalidatePath('/settings/products');
        revalidatePath('/settings/onboarding');

        return { success: true, message: `Successfully saved ${products.length} products and ${rules.length} rules.` };

    } catch (error) {
        console.error("Error saving configuration: ", error);
        return { success: false, message: 'An unexpected error occurred while saving the configuration.' };
    }
}
