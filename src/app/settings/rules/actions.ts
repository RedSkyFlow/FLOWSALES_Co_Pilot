
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { ProductRule } from '@/lib/types';

interface RuleFormData {
    primaryProductId: string;
    relatedProductIds: string[];
    type: 'dependency' | 'conflict' | 'recommendation';
    condition: 'requires_one' | 'requires_all' | 'conflicts_with';
}

interface AddRuleInput extends RuleFormData {
    tenantId: string;
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

export async function updateProductRule(tenantId: string, ruleId: string, data: RuleFormData) {
    if (!tenantId || !ruleId) {
        throw new Error('Tenant ID and Rule ID are required for update.');
    }
     try {
        const ruleDocRef = doc(db, 'tenants', tenantId, 'product_rules', ruleId);
        await updateDoc(ruleDocRef, {
            primaryProductId: data.primaryProductId,
            relatedProductIds: data.relatedProductIds,
            type: data.type,
            condition: data.condition,
        });

        revalidatePath('/settings/rules');
        revalidatePath('/proposals/new'); 
    } catch (error) {
        console.error("Error updating product rule: ", error);
        throw new Error('Could not update the product rule. Please try again.');
    }
}

export async function deleteProductRule(tenantId: string, ruleId: string) {
    if (!tenantId || !ruleId) {
        throw new Error('Tenant ID and Rule ID are required for deletion.');
    }
     try {
        const ruleDocRef = doc(db, 'tenants', tenantId, 'product_rules', ruleId);
        await deleteDoc(ruleDocRef);
        revalidatePath('/settings/rules');
    } catch (error) {
        console.error("Error deleting product rule: ", error);
        throw new Error('Could not delete the product rule. Please try again.');
    }
}
