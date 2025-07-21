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
  id:string;
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

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: Date;
}

export type SuggestedEditStatus = 'pending' | 'accepted' | 'rejected';

export interface SuggestedEdit {
    id: string;
    proposalId: string;
    sectionIndex: number;
    sectionTitle: string;
    originalContent: string;
    suggestedContent: string;
    status: SuggestedEditStatus;
    authorId: string;
    authorName: string;
    createdAt: Date;
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
