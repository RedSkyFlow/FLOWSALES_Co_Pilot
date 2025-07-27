
'use server';

import { db } from '@/lib/firebase';
import type { ProposalSection, ProposalTemplate } from '@/lib/types';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface CreateTemplateInput {
    tenantId: string;
    name: string;
    description: string;
    icon: 'Users' | 'Package' | 'FileText';
    sections: ProposalSection[];
}

export async function createTemplate(data: CreateTemplateInput) {
    if (!data.tenantId || !data.name) {
        throw new Error('Tenant ID and Name are required.');
    }

    try {
        const templatesCollectionRef = collection(db, 'tenants', data.tenantId, 'proposal_templates');
        await addDoc(templatesCollectionRef, {
            name: data.name,
            description: data.description,
            icon: data.icon,
            sections: data.sections,
        });
        revalidatePath('/templates');
    } catch (error) {
        console.error("Error creating template: ", error);
        throw new Error('Could not create the template. Please try again.');
    }
}

export async function updateTemplate(tenantId: string, templateId: string, data: Partial<Omit<ProposalTemplate, 'id'>>) {
    if (!tenantId || !templateId) {
        throw new Error('Tenant ID and Template ID are required.');
    }

    try {
        const templateDocRef = doc(db, 'tenants', tenantId, 'proposal_templates', templateId);
        await updateDoc(templateDocRef, data);
        revalidatePath('/templates');
    } catch (error) {
        console.error("Error updating template: ", error);
        throw new Error('Could not update the template. Please try again.');
    }
}


/**
 * Duplicates an existing proposal template for a given tenant.
 * @param tenantId The ID of the tenant.
 * @param templateId The ID of the template to duplicate.
 */
export async function duplicateTemplate(tenantId: string, templateId: string) {
    if (!tenantId || !templateId) {
        throw new Error('Tenant ID and Template ID are required.');
    }
    
    try {
        const templateDocRef = doc(db, 'tenants', tenantId, 'proposal_templates', templateId);
        const templateSnap = await getDoc(templateDocRef);

        if (!templateSnap.exists()) {
            throw new Error('Template not found');
        }

        const originalTemplate = templateSnap.data() as Omit<ProposalTemplate, 'id'>;
        const newTemplateData = {
            ...originalTemplate,
            name: `${originalTemplate.name} (Copy)`,
        };

        const templatesCollectionRef = collection(db, 'tenants', tenantId, 'proposal_templates');
        await addDoc(templatesCollectionRef, newTemplateData);

        revalidatePath('/templates');
    } catch (error) {
        console.error("Error duplicating template: ", error);
        throw new Error('Could not duplicate the template. Please try again.');
    }
}
