
'use server';

import { db } from '@/lib/firebase';
import type { ProposalSection, ProposalTemplate } from '@/lib/types';
import { addDoc, collection, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { ingestDocumentForTemplate } from '@/ai/flows/ingest-document-for-template';

interface CreateTemplateInput {
    tenantId: string;
    name: string;
    description: string;
    icon: 'Users' | 'Package' | 'FileText';
    sections: ProposalSection[];
    createdBy: string;
}

type UpdateTemplateInput = Omit<CreateTemplateInput, 'tenantId' | 'createdBy'>;

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
            createdAt: new Date().toISOString(),
            createdBy: data.createdBy,
        });
        revalidatePath('/templates');
        revalidatePath('/proposals/new'); // Revalidate wizard to pick up new template
    } catch (error) {
        console.error("Error creating template: ", error);
        throw new Error('Could not create the template. Please try again.');
    }
}

export async function updateTemplate(tenantId: string, templateId: string, data: UpdateTemplateInput) {
    if (!tenantId || !templateId) {
        throw new Error('Tenant ID and Template ID are required.');
    }
    try {
        const templateDocRef = doc(db, 'tenants', tenantId, 'proposal_templates', templateId);
        await updateDoc(templateDocRef, data);
        revalidatePath('/templates');
        revalidatePath(`/templates/${templateId}/edit`);
        revalidatePath('/proposals/new');
    } catch (error) {
        console.error("Error updating template: ", error);
        throw new Error('Could not update the template. Please try again.');
    }
}


export async function deleteTemplate(tenantId: string, templateId: string) {
    if (!tenantId || !templateId) {
        throw new Error('Tenant ID and Template ID are required.');
    }
    try {
        const templateDocRef = doc(db, 'tenants', tenantId, 'proposal_templates', templateId);
        await deleteDoc(templateDocRef);
        revalidatePath('/templates');
        revalidatePath('/proposals/new');
    } catch (error) {
        console.error("Error deleting template: ", error);
        throw new Error('Could not delete the template. Please try again.');
    }
}

export async function duplicateTemplate(tenantId: string, template: ProposalTemplate) {
    if (!tenantId || !template) {
        throw new Error('Tenant ID and template data are required.');
    }
    try {
        const newTemplateData = {
            ...template,
            name: `${template.name} (Copy)`,
            createdAt: new Date().toISOString(),
        };
        delete (newTemplateData as any).id; // Remove ID before adding new doc

        const templatesCollectionRef = collection(db, 'tenants', tenantId, 'proposal_templates');
        await addDoc(templatesCollectionRef, newTemplateData);

        revalidatePath('/templates');
        revalidatePath('/proposals/new');
    } catch (error) {
        console.error("Error duplicating template: ", error);
        throw new Error('Could not duplicate template. Please try again.');
    }
}

export async function ingestDocument(documentContent: string) {
    try {
        const output = await ingestDocumentForTemplate(documentContent);
        return output;
    } catch (error) {
        console.error("Error in ingestDocument server action:", error);
        throw new Error("Failed to analyze the document with AI.");
    }
}
