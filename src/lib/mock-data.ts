import type { Proposal, Client, VenueOSModule, User, Comment, Version, ContentLibraryItem, OldProposal } from './types';

export const mockUser: User = {
  uid: 'abc-123',
  email: 'alex.johnson@flowsales.com',
  displayName: 'Alex Johnson',
  role: 'sales_agent',
  avatarUrl: 'https://i.pravatar.cc/150?u=alexjohnson',
  initials: 'AJ',
};

export const mockClients: Client[] = [
  { id: 'cli-001', name: 'Global Stadium Corp', industry: 'Sports & Entertainment', contactPerson: 'John Doe', contactEmail: 'john.doe@globalstadium.com', notes: 'Interested in fan engagement and ticketing.' },
  { id: 'cli-002', name: 'Metro Retail Group', industry: 'Retail', contactPerson: 'Jane Smith', contactEmail: 'jane.smith@metroretail.com', notes: 'Needs analytics and location-based marketing.' },
  { id: 'cli-003', name: 'ConnectaTel', industry: 'Telecommunications', contactPerson: 'Sam Wilson', contactEmail: 'sam.wilson@connectatel.com', notes: 'Looking to modernize their network infrastructure.' },
  { id: 'cli-004', name: 'City Arena Holdings', industry: 'Sports & Entertainment', contactPerson: 'Emily White', contactEmail: 'emily.white@cityarena.com', notes: 'Previous discussions about upgrading their POS system.' },
];

export const mockVenueOSModules: VenueOSModule[] = [
  { id: 'mod-001', name: 'Fan Engagement Platform', description: 'Engage fans with interactive content and rewards.', pricingModel: 'subscription', basePrice: 15000, tags: ['sports', 'engagement'] },
  { id: 'mod-002', name: 'Smart Ticketing System', description: 'NFC and QR-based secure ticketing.', pricingModel: 'one-time', basePrice: 12000, tags: ['operations', 'ticketing'] },
  { id: 'mod-003', name: 'In-Seat Concessions Ordering', description: 'Allow fans to order food and drinks from their seats.', pricingModel: 'subscription', basePrice: 8500, tags: ['food_beverage', 'operations'] },
  { id: 'mod-004', name: 'Retail Analytics Dashboard', description: 'Track foot traffic, sales, and inventory in real-time.', pricingModel: 'subscription', basePrice: 20000, tags: ['retail', 'analytics'] },
  { id: 'mod-005', name: 'Location-Based Promotions', description: 'Send targeted offers to shoppers based on their location.', pricingModel: 'subscription', basePrice: 7000, tags: ['retail', 'marketing'] },
  { id: 'mod-006', name: 'Network Optimization Suite', description: 'AI-powered network traffic management.', pricingModel: 'one-time', basePrice: 25000, tags: ['telco', 'network'] },
  { id: 'mod-007', name: '5G Infrastructure Rollout', description: 'End-to-end 5G deployment services.', pricingModel: 'one-time', basePrice: 50000, tags: ['telco', '5g'] },
];

export const mockContentLibrary: ContentLibraryItem[] = [
    { id: 'cl-001', type: 'case_study', title: 'Case Study: Rival Arena Fan Engagement Boost', content: 'Rival Arena saw a 40% increase in fan engagement...', tags: ['sports', 'engagement'] },
    { id: 'cl-002', type: 'team_bio', title: 'Alex Johnson - Senior Sales Executive', content: 'Alex has over 10 years of experience...', tags: ['sales_team'] },
    { id: 'cl-003', type: 'legal_clause', title: 'Standard NDA Clause', content: 'This agreement is confidential...', tags: ['legal', 'standard'] },
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
    selectedModules: [mockVenueOSModules[0], mockVenueOSModules[1], mockVenueOSModules[2]],
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
    selectedModules: [mockVenueOSModules[3], mockVenueOSModules[4]],
    totalPrice: 27000,
    sections: [{ title: 'Executive Summary', content: 'Pilot program for retail analytics.', type: 'manual' }],
    engagementData: { views: 2, timeOnPage: 1200, lastViewed: '2024-07-30T16:00:00Z' },
    signatureData: { status: 'pending', signedAt: null, auditTrailUrl: null },
    paymentData: { status: 'pending', paymentLink: '/pay/prop-002', paidAt: null }
  },
   {
    id: 'prop-003',
    title: '5G Upgrade for ConnectaTel',
    clientId: 'cli-003',
    salesAgentId: 'abc-123',
    status: 'draft',
    lastModified: '2024-08-01T14:00:00Z',
    createdAt: '2024-08-01T11:00:00Z',
    version: 1,
    selectedModules: [mockVenueOSModules[6]],
    totalPrice: 50000,
    sections: [{ title: 'Executive Summary', content: 'Proposal to upgrade ConnectaTel\'s core network to 5G.', type: 'manual' }],
    engagementData: { views: 0, timeOnPage: 0, lastViewed: null },
    signatureData: { status: 'pending', signedAt: null, auditTrailUrl: null },
    paymentData: { status: 'pending', paymentLink: '/pay/prop-003', paidAt: null }
  },
   {
    id: 'prop-004',
    title: 'POS and Fan Engagement for City Arena',
    clientId: 'cli-004',
    salesAgentId: 'abc-123',
    status: 'changes_requested',
    lastModified: '2024-07-29T18:00:00Z',
    createdAt: '2024-07-25T10:00:00Z',
    version: 2,
    selectedModules: [mockVenueOSModules[0], mockVenueOSModules[2]],
    totalPrice: 23500,
    sections: [{ title: 'Executive Summary', content: 'A revised proposal to integrate fan engagement with a new POS system.', type: 'ai_generated' }],
    engagementData: { views: 5, timeOnPage: 1800, lastViewed: '2024-07-29T17:00:00Z' },
    signatureData: { status: 'pending', signedAt: null, auditTrailUrl: null },
    paymentData: { status: 'pending', paymentLink: '/pay/prop-004', paidAt: null }
  },
];

const mockClientAuthor = {
  uid: 'xyz-789',
  name: 'Sarah Chen (Client)',
  avatarUrl: 'https://i.pravatar.cc/150?u=sarahchen',
  initials: 'SC'
};

export const mockComments: Comment[] = [
    {
        id: 'com-001',
        author: mockClientAuthor,
        timestamp: '2 days ago',
        content: 'Could we get a more detailed breakdown of the implementation timeline for the Smart Ticketing System?'
    },
    {
        id: 'com-002',
        author: {
          uid: mockUser.uid,
          name: mockUser.displayName,
          avatarUrl: mockUser.avatarUrl || '',
          initials: mockUser.initials || '',
        },
        timestamp: '1 day ago',
        content: '@Sarah Chen Absolutely. I\'ve added a project plan to the appendix with a detailed timeline. Let me know if that works for you.'
    },
    {
        id: 'com-003',
        author: mockClientAuthor,
        timestamp: '4 hours ago',
        content: 'This looks great, thanks Alex! One more thing - is there an option for a phased rollout of the In-Seat Concessions Ordering module?'
    }
];


export const mockVersions: Version[] = [
    { number: 4, date: '2024-07-25', author: {uid: mockUser.uid, name: mockUser.displayName, avatarUrl: mockUser.avatarUrl || '', initials: mockUser.initials || ''}, summary: 'Updated pricing for retail analytics and added volume discount.' },
    { number: 3, date: '2024-07-22', author: mockClientAuthor, summary: 'Client requested removal of loyalty program module.' },
    { number: 2, date: '2024-07-21', author: {uid: mockUser.uid, name: mockUser.displayName, avatarUrl: mockUser.avatarUrl || '', initials: mockUser.initials || ''}, summary: 'Added new case study for a similar retail client.' },
    { number: 1, date: '2024-07-20', author: {uid: mockUser.uid, name: mockUser.displayName, avatarUrl: mockUser.avatarUrl || '', initials: mockUser.initials || ''}, summary: 'Initial draft sent to client.' },
];


// Old mock data for reference, to be removed later
export const oldMockProposals: OldProposal[] = [
  {
    id: 'prop-001',
    title: 'Stadium OS Implementation for Global Stadium',
    client: {id: 'cli-001', name: 'Global Stadium Corp'},
    status: 'Accepted',
    lastUpdated: '2024-07-28',
    version: 3,
    modules: [{ id: 'mod-001', name: 'Fan Engagement Platform', description: 'Engage fans with interactive content and rewards.', price: 15000 },
              { id: 'mod-002', name: 'Smart Ticketing System', description: 'NFC and QR-based secure ticketing.', price: 12000 }],
    totalValue: 35500,
  },
];
