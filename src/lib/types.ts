export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: 'sales_agent' | 'admin';
  avatarUrl?: string;
  initials?: string;
}

export interface Client {
  id: string;
  name: string;
  industry: 'Hospitality' | 'Retail' | 'Education' | 'Sports & Entertainment' | 'Telecommunications';
  contactPerson: string;
  contactEmail: string;
  notes: string;
}

export interface VenueOSModule {
  id: string;
  name: string;
  description: string;
  pricingModel: 'subscription' | 'one-time';
  basePrice: number;
  tags: string[];
}

export interface ContentLibraryItem {
  id: string;
  type: 'case_study' | 'team_bio' | 'legal_clause';
  title: string;
  content: string; // Markdown
  tags: string[];
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'signed' | 'declined' | 'changes_requested' | 'paid';

export interface ProposalSection {
    title: string;
    content: string;
    type: 'ai_generated' | 'manual' | 'template';
}

export interface Proposal {
  id: string;
  title: string;
  status: ProposalStatus;
  salesAgentId: string; // Reference to users collection
  clientId: string; // Reference to clients collection
  version: number;
  totalPrice: number;
  createdAt: string; // ISO 8601 date string
  lastModified: string; // ISO 8601 date string
  sections: ProposalSection[];
  selectedModules: VenueOSModule[];
  engagementData: {
    views: number;
    timeOnPage: number;
    lastViewed: string | null; // ISO 8601 date string
  };
  signatureData: {
    status: 'pending' | 'signed';
    signedAt: string | null; // ISO 8601 date string
    auditTrailUrl: string | null;
  };
  paymentData: {
    status: 'pending' | 'paid_deposit' | 'paid_full';
    paymentLink: string | null;
    paidAt: string | null; // ISO 8601 date string
  };
  meetingTranscript?: string;
}

// Below are the original, simpler types that will be replaced or updated.
// We keep them here temporarily for reference during migration but they should be removed.

export interface OldModule {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface OldProposal {
  id: string;
  title: string;
  client: { id: string, name: string };
  status: 'Draft' | 'Sent' | 'Viewed' | 'Changes Requested' | 'Accepted' | 'Signed' | 'Paid';
  lastUpdated: string;
  version: number;
  modules: OldModule[];
  totalValue: number;
}


export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: Date | null; // Firestore serverTimestamp is null on client until it's set
}

export interface Version {
  number: number;
  date: string;
  author: {
    uid: string;
    name: string;
    avatarUrl: string;
    initials: string;
  }
  summary: string;
}
