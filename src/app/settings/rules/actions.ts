
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { ProductRule } from '@/lib/types';

interface AddRuleInput {
    tenantId: string;
    primaryProductId: string;
    relatedProductIds: string[];
    type: 'dependency' | 'conflict' | 'recommendation';
    condition: 'requires_one' | 'requires_all' | 'conflicts_with';
}

export async function addProductRule(data: AddRuleInput) {
    if (!data.tenantId || !data.primaryProductId || !data.relatedProductIds || data.relatedProductIds.length === 0) {
        throw new Error('Tenant ID and product selections are required.');
    }

    try {
        const rulesCollectionRef = collection(db, 'tenants', data.tenantId, 'product_rules');
        
        const newRule: Omit<ProductRule, 'id'> = {
            primaryProductId: data.primaryProductId,
            relatedProductIds: data.relatedProductIds,
            type: data.type,
            condition: data.condition,
            status: 'active'
        };

        await addDoc(rulesCollectionRef, newRule);

        revalidatePath('/settings/rules');
        revalidatePath('/proposals/new'); 
    } catch (error) {
        console.error("Error adding product rule: ", error);
        throw new Error('Could not create the product rule. Please try again.');
    }
}
