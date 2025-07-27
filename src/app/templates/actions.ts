
'use server';

import { db } from '@/lib/firebase';
import type { ProposalSection, ProposalTemplate } from '@/lib/types';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { generateTemplateFromDocument } from '@/ai/flows/generate-template-from-document';

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

/**
 * Generates a proposal template from a document using an AI flow.
 * @param tenantId The ID of the tenant.
 * @param templateName The name for the new template.
 * @param documentContent The text content of the uploaded document.
 */
interface GenerateTemplateFromDocInput {
    tenantId: string;
    templateName: string;
    documentContent: string;
}
export async function generateTemplate(data: GenerateTemplateFromDocInput) {
    if (!data.tenantId || !data.templateName || !data.documentContent) {
        throw new Error("Tenant ID, template name, and document content are required.");
    }

    try {
        // Call the AI flow to get structured sections
        const { sections } = await generateTemplateFromDocument({
            documentContent: data.documentContent
        });
        
        if (!sections || sections.length === 0) {
            throw new Error("AI could not generate sections from the document.");
        }

        // Create the new template in Firestore
        const templatesCollectionRef = collection(db, 'tenants', data.tenantId, 'proposal_templates');
        await addDoc(templatesCollectionRef, {
            name: data.templateName,
            description: `AI-generated from uploaded document on ${new Date().toLocaleDateString()}`,
            icon: 'FileText',
            sections: sections,
        });

        revalidatePath('/templates');
        
    } catch (error) {
        console.error("Error generating template from document: ", error);
        // Re-throw to be caught by the client-side caller
        throw new Error('Failed to generate template from document.');
    }
}
