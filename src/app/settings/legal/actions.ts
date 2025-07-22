
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { LegalDocument } from '@/lib/types';

interface LegalDocFormData {
    title: string;
    content: string;
}

interface AddLegalDocInput extends LegalDocFormData {
    tenantId: string;
}

export async function addLegalDocument(data: AddLegalDocInput) {
    if (!data.tenantId || !data.title || !data.content) {
        throw new Error('Tenant ID, title, and content are required.');
    }

    try {
        const docsCollectionRef = collection(db, 'tenants', data.tenantId, 'legal_documents');
        await addDoc(docsCollectionRef, {
            title: data.title,
            content: data.content,
        });
        revalidatePath('/settings/legal');
    } catch (error) {
        console.error("Error adding legal document: ", error);
        throw new Error('Could not create the legal document. Please try again.');
    }
}

export async function updateLegalDocument(tenantId: string, docId: string, data: LegalDocFormData) {
    if (!tenantId || !docId) {
        throw new Error('Tenant ID and Document ID are required for update.');
    }
     try {
        const docRef = doc(db, 'tenants', tenantId, 'legal_documents', docId);
        await updateDoc(docRef, {
            title: data.title,
            content: data.content,
        });
        revalidatePath('/settings/legal');
    } catch (error) {
        console.error("Error updating legal document: ", error);
        throw new Error('Could not update the legal document. Please try again.');
    }
}

export async function deleteLegalDocument(tenantId: string, docId: string) {
    if (!tenantId || !docId) {
        throw new Error('Tenant ID and Document ID are required for deletion.');
    }
     try {
        const docRef = doc(db, 'tenants', tenantId, 'legal_documents', docId);
        await deleteDoc(docRef);
        revalidatePath('/settings/legal');
    } catch (error)
        {
        console.error("Error deleting legal document: ", error);
        throw new Error('Could not delete the legal document. Please try again.');
    }
}
