
import type { Proposal, Client, Product, User, Version, ProposalTemplate } from './types';

export const mockUser: User = {
  uid: 'abc-123',
  email: 'alex.johnson@flowsales.com',
  displayName: 'Alex Johnson',
  role: 'sales_agent',
  tenantId: 'tenant-001',
};

// These are now clients OF a tenant
export const mockClients: Client[] = [
  { id: 'cli-001', name: 'Global Stadium Corp', industry: 'Sports & Entertainment', contactPerson: 'John Doe', contactEmail: 'john.doe@globalstadium.com', notes: 'Interested in fan engagement and ticketing.' },
  { id: 'cli-002', name: 'Metro Retail Group', industry: 'Retail', contactPerson: 'Jane Smith', contactEmail: 'jane.smith@metroretail.com', notes: 'Needs analytics and location-based marketing.' },
  { id: 'cli-003', name: 'ConnectaTel', industry: 'Telecommunications', contactPerson: 'Sam Wilson', contactEmail: 'sam.wilson@connectatel.com', notes: 'Looking to modernize their network infrastructure.' },
  { id: 'cli-004', name: 'City Arena Holdings', industry: 'Sports & Entertainment', contactPerson: 'Emily White', contactEmail: 'emily.white@cityarena.com', notes: 'Previous discussions about upgrading their POS system.' },
];

// This is now a tenant-specific product catalog
export const mockTenantProducts: Product[] = [
  { id: 'mod-001', name: 'Fan Engagement Platform', description: 'Engage fans with interactive content and rewards.', pricingModel: 'subscription', basePrice: 15000, tags: ['sports', 'engagement'], type: 'product' },
  { id: 'mod-002', name: 'Smart Ticketing System', description: 'NFC and QR-based secure ticketing.', pricingModel: 'one-time', basePrice: 12000, tags: ['operations', 'ticketing'], type: 'product' },
  { id: 'mod-003', name: 'In-Seat Concessions Ordering', description: 'Allow fans to order food and drinks from their seats.', pricingModel: 'subscription', basePrice: 8500, tags: ['food_beverage', 'operations'], type: 'service' },
  { id: 'mod-004', name: 'Retail Analytics Dashboard', description: 'Track foot traffic, sales, and inventory in real-time.', pricingModel: 'subscription', basePrice: 20000, tags: ['retail', 'analytics'], type: 'product' },
  { id: 'mod-005', name: 'Location-Based Promotions', description: 'Send targeted offers to shoppers based on their location.', pricingModel: 'subscription', basePrice: 7000, tags: ['retail', 'marketing'], type: 'service' },
  { id: 'mod-006', name: 'Network Optimization Suite', description: 'AI-powered network traffic management.', pricingModel: 'one-time', basePrice: 25000, tags: ['telco', 'network'], type: 'license' },
  { id: 'mod-007', name: '5G Infrastructure Rollout', description: 'End-to-end 5G deployment services.', pricingModel: 'one-time', basePrice: 50000, tags: ['telco', '5g'], type: 'service' },
];

// Templates are now simpler, as their config is in the tenant's collections
export const mockTemplates: ProposalTemplate[] = [
  {
    id: 'tmpl-001',
    name: "Stadium OS Proposal",
    description: "For sports venues and large arenas.",
    icon: "Users"
  },
  {
    id: 'tmpl-002',
    name: "Shopping Mall Pilot Proposal",
    description: "For retail centers and commercial properties.",
    icon: "Package"
  },
  {
    id: 'tmpl-003',
    name: "Telco Proposal",
    description: "For telecommunication infrastructure projects.",
    icon: "FileText"
  },
];

export const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    title: 'Stadium OS Implementation for Global Stadium',
    clientId: 'cli-001',
    salesAgentId: 'abc-123',
    status: 'accepted',
    lastModified: '2024-07-28T10:00:00Z',
    createdAt: '2024-07-20T09:00:00Z',
    version: 3,
    selectedProducts: [mockTenantProducts[0], mockTenantProducts[1], mockTenantProducts[2]],
    totalPrice: 35500,
    sections: [{ title: 'Executive Summary', content: 'This is a proposal for a new stadium OS.', type: 'ai_generated' }],
    engagementData: { views: 10, timeOnPage: 3600, lastViewed: '2024-07-27T15:30:00Z' },
    signatureData: { status: 'signed', signedAt: '2024-07-28T11:00:00Z', auditTrailUrl: '/audit/prop-001' },
    paymentData: { status: 'paid_deposit', paymentLink: '/pay/prop-001', paidAt: '2024-07-28T12:00:00Z' }
  },
  {
    id: 'prop-002',
    title: 'Pilot Program for Metro Retail',
    clientId: 'cli-002',
    salesAgentId: 'abc-123',
    status: 'sent',
    lastModified: '2024-07-30T14:00:00Z',
    createdAt: '2024-07-29T11:00:00Z',
    version: 1,
    selectedProducts: [mockTenantProducts[3], mockTenantProducts[4]],
    totalPrice: 27000,
    sections: [{ title: 'Executive Summary', content: 'Pilot program for retail analytics.', type: 'manual' }],
    engagementData: { views: 2, timeOnPage: 1200, lastViewed: '2024-07-30T16:00:00Z' },
    signatureData: { status: 'pending', signedAt: null, auditTrailUrl: null },
    paymentData: { status: 'pending', paymentLink: '/pay/prop-002', paidAt: null }
  },
];

export const mockVersions: Version[] = [
    { number: 4, date: '2024-07-25', author: {uid: mockUser.uid, name: mockUser.displayName || 'User', avatarUrl: '', initials: 'U'}, summary: 'Updated pricing for retail analytics and volume discount.' },
    { number: 3, date: '2024-07-22', author: {uid: 'xyz-789', name: 'Sarah Chen (Client)', avatarUrl: '', initials: 'SC'}, summary: 'Client requested removal of loyalty program module.' },
    { number: 2, date: '2024-07-21', author: {uid: mockUser.uid, name: mockUser.displayName || 'User', avatarUrl: '', initials: 'U'}, summary: 'Added new case study for a similar retail client.' },
    { number: 1, date: '2024-07-20', author: {uid: mockUser.uid, name: mockUser.displayName || 'User', avatarUrl: '', initials: 'U'}, summary: 'Initial draft sent to client.' },
];
