
export interface Tenant {
  id: string;
  companyName: string;
  subscriptionStatus: 'active' | 'trial' | 'lapsed';
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  // Role is now within the context of a tenant
  role: 'admin' | 'sales_agent';
  tenantId: string; // The tenant this user belongs to
}

// Client of our Tenant
export interface Client {
  id: string;
  name: string;
  industry: 'Hospitality' | 'Retail' | 'Education' | 'Sports & Entertainment' | 'Telecommunications';
  contactPerson: string;
  contactEmail: string;
  notes: string;
}

// A product or service offered by a Tenant
export interface Product {
  id: string;
  name: string;
  description: string;
  pricingModel: 'subscription' | 'one-time' | 'per_item';
  basePrice: number;
  tags: string[];
  dependencies?: string[]; // IDs of other products
  type: 'product' | 'service' | 'license';
}

export interface BrandAsset {
    id: string;
    logoUrl: string;
    primaryColor: string; // hex
    secondaryColor: string; // hex
    fontHeadline: string;
    fontBody: string;
    brandVoiceTone: string;
}

export interface LegalDocument {
    id:string;
    title: string;
    content: string; // markdown
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
  // This now refers to a user within the tenant
  salesAgentId: string;
  // This refers to a client of the tenant
  clientId: string;
  version: number;
  totalPrice: number;
  createdAt: string; // ISO 8601 date string
  lastModified: string; // ISO 8601 date string
  sections: ProposalSection[];
  selectedProducts: Product[]; // Formerly selectedModules
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

// Templates are now tenant-specific configurations
export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  icon: 'Users' | 'Package' | 'FileText';
}
