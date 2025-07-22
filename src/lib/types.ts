
export type SubscriptionTier = 'bronze' | 'silver' | 'gold';
export type SubscriptionStatus = 'active' | 'trial' | 'lapsed' | 'deactivated';

export interface Tenant {
  id: string;
  companyName: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: SubscriptionTier;
  monthlyAiBudget: number; // e.g., 20.00 for $20
  currentAiUsage: number;
}

export interface UsageLedgerEntry {
    id: string;
    flowName: string; // e.g., 'generateFullProposal'
    triggeredBy: string; // User UID
    timestamp: string; // ISO 8601
    costIncurred: number; // Estimated cost for this action
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  // Role is now within the context of a tenant
  role: 'admin' | 'sales_agent' | 'client' | 'super_admin'; // Added super_admin
  tenantId: string; // The tenant this user belongs to
}

// Client of our Tenant
export interface Client {
  id: string;
  name: string;
  industry: string;
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
  type: 'product' | 'service' | 'license';
  status?: 'verified' | 'unverified'; // For onboarding flow
}

export interface ProductRule {
    id: string;
    // The product that triggers the rule
    primaryProductId: string; 
    // The products affected by the rule
    relatedProductIds: string[]; 
    // The type of rule
    type: 'dependency' | 'conflict' | 'recommendation'; 
    // The condition of the rule
    condition: 'requires_one' | 'requires_all' | 'conflicts_with';
    // The status of the rule, for AI onboarding
    status: 'active' | 'awaiting_review' | 'rejected';
    explanation?: string;
}

export interface BrandingSettings {
    id: string;
    companyName: string;
    websiteUrl?: string;
    logoUrl?: string;
    primaryColor?: string; // hex
    secondaryColor?: string; // hex
    fontHeadline?: string;
    fontBody?: string;
    brandVoice?: string;
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
  clientName?: string;
  version: number;
  totalPrice: number;
  createdAt: string; // ISO 8601 date string
  lastModified: string; // ISO 8601 date string
  sections: ProposalSection[];
  selectedProducts: Product[];
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
    authorAvatarUrl?: string;
    createdAt: Date;
}

export interface Version {
  id: string;
  versionNumber: number;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  summary: string; // e.g., "Accepted suggestion on 'Executive Summary'"
}


// Templates are now tenant-specific configurations
export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: ProposalSection[];
  createdAt?: string; // ISO 8601 date string
}
