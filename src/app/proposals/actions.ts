'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, addDoc, collection } from 'firebase/firestore';
import type { Proposal, VenueOSModule } from '@/lib/types';
import { mockClients } from '@/lib/mock-data';

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
