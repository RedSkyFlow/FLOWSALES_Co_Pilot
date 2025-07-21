'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, addDoc, collection, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import type { Proposal, VenueOSModule, SuggestedEdit } from '@/lib/types';
import { mockClients } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';

/**
 * Tracks a view for a given proposal.
 * Increments the view count and updates the last viewed timestamp.
 * @param proposalId The ID of the proposal to track.
 */
export async function trackProposalView(proposalId: string) {
  if (!proposalId) {
    console.error('Proposal ID is required for tracking.');
    return;
  }
  
  try {
    const proposalRef = doc(db, 'proposals', proposalId);
    
    await updateDoc(proposalRef, {
      'engagementData.views': increment(1),
      'engagementData.lastViewed': new Date().toISOString(), // Using ISO string to match type
    });

  } catch (error) {
    console.error('Error tracking proposal view:', error);
    // In a real app, you might want more robust error handling or logging.
  }
}

interface CreateProposalInput {
    selectedTemplate: string | null;
    selectedClientId: string;
    executiveSummary: string;
    selectedModules: VenueOSModule[];
    totalValue: number;
    salesAgentId: string; // Assuming we'll pass the current user's ID
}

/**
 * Creates a new proposal document in Firestore.
 * @param data The data for the new proposal from the wizard.
 * @returns The ID of the newly created proposal.
 */
export async function createProposal(data: CreateProposalInput): Promise<string> {
    if (!data.selectedTemplate || !data.selectedClientId) {
        throw new Error('Template and Client are required to create a proposal.');
    }

    const client = mockClients.find(c => c.id === data.selectedClientId);

    const newProposal: Omit<Proposal, 'id'> = {
        title: `${data.selectedTemplate} for ${client?.name || 'New Client'}`,
        clientId: data.selectedClientId,
        salesAgentId: data.salesAgentId,
        status: 'draft',
        version: 1,
        totalPrice: data.totalValue,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        selectedModules: data.selectedModules,
        sections: [
            {
                title: 'Executive Summary',
                content: data.executiveSummary || 'No summary was generated.',
                type: data.executiveSummary ? 'ai_generated' : 'manual',
            }
        ],
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

    const docRef = await addDoc(collection(db, 'proposals'), newProposal);
    return docRef.id;
}


// --- Edit Suggestion Actions ---

interface CreateSuggestedEditInput {
    proposalId: string;
    sectionIndex: number;
    suggestedContent: string;
    authorId: string;
    authorName: string;
}

export async function createSuggestedEdit(input: CreateSuggestedEditInput) {
    const proposalRef = doc(db, 'proposals', input.proposalId);
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

    await addDoc(collection(db, 'proposals', input.proposalId, 'suggested_edits'), {
        ...suggestion,
        createdAt: serverTimestamp(),
    });

    revalidatePath(`/proposals/${input.proposalId}`);
}

export async function acceptSuggestedEdit(suggestion: SuggestedEdit) {
    const batch = writeBatch(db);

    const proposalRef = doc(db, 'proposals', suggestion.proposalId);
    const suggestionRef = doc(db, 'proposals', suggestion.proposalId, 'suggested_edits', suggestion.id);

    // Update the specific section in the proposal's sections array
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

    // Update the suggestion's status
    batch.update(suggestionRef, { status: 'accepted' });

    await batch.commit();
    revalidatePath(`/proposals/${suggestion.proposalId}`);
}

export async function rejectSuggestedEdit(suggestion: SuggestedEdit) {
    const suggestionRef = doc(db, 'proposals', suggestion.proposalId, 'suggested_edits', suggestion.id);
    await updateDoc(suggestionRef, { status: 'rejected' });
    revalidatePath(`/proposals/${suggestion.proposalId}`);
}
