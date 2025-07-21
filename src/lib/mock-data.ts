
import type { User, Product, Version, ProposalTemplate } from './types';

export const mockUser: User = {
  uid: 'abc-123',
  email: 'alex.johnson@flowsales.com',
  displayName: 'Alex Johnson',
  role: 'sales_agent',
  tenantId: 'tenant-001',
};

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


export const mockVersions: Version[] = [
    { number: 4, date: '2024-07-25', author: {uid: mockUser.uid, name: mockUser.displayName || 'User', avatarUrl: '', initials: 'U'}, summary: 'Updated pricing for retail analytics and volume discount.' },
    { number: 3, date: '2024-07-22', author: {uid: 'xyz-789', name: 'Sarah Chen (Client)', avatarUrl: '', initials: 'SC'}, summary: 'Client requested removal of loyalty program module.' },
    { number: 2, date: '2024-07-21', author: {uid: mockUser.uid, name: mockUser.displayName || 'User', avatarUrl: '', initials: 'U'}, summary: 'Added new case study for a similar retail client.' },
    { number: 1, date: '2024-07-20', author: {uid: mockUser.uid, name: mockUser.displayName || 'User', avatarUrl: '', initials: 'U'}, summary: 'Initial draft sent to client.' },
];
