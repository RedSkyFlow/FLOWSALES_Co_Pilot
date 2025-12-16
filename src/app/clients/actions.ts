
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface AddClientInput {
    tenantId: string;
    name: string;
    industry: string;
    contactPerson: string;
    contactEmail: string;
    notes?: string;
}

export async function addClient(data: AddClientInput) {
    if (!data.tenantId || !data.name || !data.contactEmail) {
        throw new Error('Tenant ID, Name, and Email are required.');
    }

    try {
        const clientsCollectionRef = collection(db, 'tenants', data.tenantId, 'clients');
        await addDoc(clientsCollectionRef, {
            name: data.name,
            industry: data.industry,
            contactPerson: data.contactPerson,
            contactEmail: data.contactEmail,
            notes: data.notes || '',
        });
        revalidatePath('/clients');
        revalidatePath('/proposals/new');
    } catch (error) {
        console.error("Error adding client: ", error);
        throw new Error('Could not create the client. Please try again.');
    }
}
