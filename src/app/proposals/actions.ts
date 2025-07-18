'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

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
