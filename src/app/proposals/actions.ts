
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, addDoc, collection, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import type { Proposal, Product, SuggestedEdit, ProposalSection, Client } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Tracks a view for a given proposal within a tenant.
 * Increments the view count and updates the last viewed timestamp.
 * @param tenantId The ID of the tenant.
 * @param proposalId The ID of the proposal to track.
 */
export async function trackProposalView(tenantId: string, proposalId: string) {
  if (!tenantId || !proposalId) {
    console.error('Tenant ID and Proposal ID are required for tracking.');
    return;
  }
  
  try {
    const proposalRef = doc(db, 'tenants', tenantId, 'proposals', proposalId);
    
    await updateDoc(proposalRef, {
      'engagementData.views': increment(1),
      'engagementData.lastViewed': new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error tracking proposal view:', error);
  }
}

interface CreateProposalInput {
    tenantId: string;
    selectedTemplate: string | null;
    selectedClientId: string;
    clientName?: string;
    executiveSummary: string;
    selectedProducts: Product[];
    totalValue: number;
    salesAgentId: string;
    extraSections: ProposalSection[];
}

export async function createProposal(data: CreateProposalInput): Promise<string> {
    if (!data.tenantId) {
        throw new Error('Tenant ID is required to create a proposal.');
    }
    if (!data.selectedTemplate || !data.selectedClientId) {
        throw new Error('Template and Client are required to create a proposal.');
    }
    
    const allSections = [...data.extraSections];
    if (data.executiveSummary) {
        const executiveSummarySection: ProposalSection = {
            title: 'Executive Summary',
            content: data.executiveSummary,
            type: 'ai_generated',
        };
        allSections.unshift(executiveSummarySection);
    }


    const newProposal: Omit<Proposal, 'id'> = {
        title: `${data.selectedTemplate} for ${data.clientName || 'Unknown Client'}`,
        clientId: data.selectedClientId,
        clientName: data.clientName,
        salesAgentId: data.salesAgentId,
        status: 'draft',
        version: 1,
        totalPrice: data.totalValue,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        selectedProducts: data.selectedProducts,
        sections: allSections,
        engagementData: {
            views: 0,
            timeOnPage: 0,
            lastViewed: null,
        },
        signatureData: {
            status: 'pending',
            signedAt: null,
            auditTrailUrl: null,
        },
        paymentData: {
            status: 'pending',
            paymentLink: null,
            paidAt: null,
        },
    };
    
    const proposalsCollectionRef = collection(db, 'tenants', data.tenantId, 'proposals');
    const docRef = await addDoc(proposalsCollectionRef, newProposal);
    revalidatePath('/');
    return docRef.id;
}


// --- Edit Suggestion Actions ---

interface CreateSuggestedEditInput {
    tenantId: string;
    proposalId: string;
    sectionIndex: number;
    suggestedContent: string;
    authorId: string;
    authorName: string;
}

export async function createSuggestedEdit(input: CreateSuggestedEditInput) {
    const proposalRef = doc(db, 'tenants', input.tenantId, 'proposals', input.proposalId);
    const proposalSnap = await getDoc(proposalRef);

    if (!proposalSnap.exists()) {
        throw new Error("Proposal not found");
    }

    const proposalData = proposalSnap.data() as Proposal;
    const section = proposalData.sections[input.sectionIndex];

    if (!section) {
        throw new Error("Section not found");
    }

    const suggestion: Omit<SuggestedEdit, 'id' | 'createdAt'> = {
        proposalId: input.proposalId,
        sectionIndex: input.sectionIndex,
        sectionTitle: section.title,
        originalContent: section.content,
        suggestedContent: input.suggestedContent,
        status: 'pending',
        authorId: input.authorId,
        authorName: input.authorName,
    };
    
    const editsCollectionPath = `tenants/${input.tenantId}/proposals/${input.proposalId}/suggested_edits`;
    await addDoc(collection(db, editsCollectionPath), {
        ...suggestion,
        createdAt: serverTimestamp(),
    });

    revalidatePath(`/proposals/${input.proposalId}`);
}

export async function acceptSuggestedEdit(tenantId: string, suggestion: SuggestedEdit) {
    const batch = writeBatch(db);

    const proposalRef = doc(db, 'tenants', tenantId, 'proposals', suggestion.proposalId);
    const suggestionRef = doc(db, `tenants/${tenantId}/proposals/${suggestion.proposalId}/suggested_edits`, suggestion.id);

    const proposalSnap = await getDoc(proposalRef);
    if (!proposalSnap.exists()) throw new Error("Proposal not found");
    const proposalData = proposalSnap.data() as Proposal;
    
    const updatedSections = [...proposalData.sections];
    updatedSections[suggestion.sectionIndex].content = suggestion.suggestedContent;

    batch.update(proposalRef, { 
        sections: updatedSections,
        lastModified: new Date().toISOString(),
        version: increment(1)
    });

    batch.update(suggestionRef, { status: 'accepted' });

    await batch.commit();
    revalidatePath(`/proposals/${suggestion.proposalId}`);
}

export async function rejectSuggestedEdit(tenantId: string, suggestion: SuggestedEdit) {
    const suggestionRef = doc(db, `tenants/${tenantId}/proposals/${suggestion.proposalId}/suggested_edits`, suggestion.id);
    await updateDoc(suggestionRef, { status: 'rejected' });
    revalidatePath(`/proposals/${suggestion.proposalId}`);
}
