
'use server';

import { db } from '@/lib/firebase';
import type { ProposalSection } from '@/lib/types';
import { addDoc, collection } from 'firebase/firestore';
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
        revalidatePath('/proposals/new'); // Revalidate wizard to pick up new template
    } catch (error) {
        console.error("Error creating template: ", error);
        throw new Error('Could not create the template. Please try again.');
    }
}

    