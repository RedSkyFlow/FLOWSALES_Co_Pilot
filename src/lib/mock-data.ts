import type { Proposal, Client, Module, User, Comment, Version } from './types';

export const mockUser: User = {
  uid: 'abc-123',
  email: 'alex.johnson@flowsales.com',
  displayName: 'Alex Johnson',
  role: 'sales_agent',
  avatarUrl: 'https://i.pravatar.cc/150?u=alexjohnson',
  initials: 'AJ',
};

export const mockClients: Client[] = [
  { id: 'cli-001', name: 'Global Stadium Corp', industry: 'Sports & Entertainment' },
  { id: 'cli-002', name: 'Metro Retail Group', industry: 'Retail' },
  { id: 'cli-003', name: 'ConnectaTel', industry: 'Telecommunications' },
  { id: 'cli-004', name: 'City Arena Holdings', industry: 'Sports & Entertainment' },
];

export const mockModules: Module[] = [
  { id: 'mod-001', name: 'Fan Engagement Platform', description: 'Engage fans with interactive content and rewards.', price: 15000 },
  { id: 'mod-002', name: 'Smart Ticketing System', description: 'NFC and QR-based secure ticketing.', price: 12000 },
  { id: 'mod-003', name: 'In-Seat Concessions Ordering', description: 'Allow fans to order food and drinks from their seats.', price: 8500 },
  { id: 'mod-004', name: 'Retail Analytics Dashboard', description: 'Track foot traffic, sales, and inventory in real-time.', price: 20000 },
  { id: 'mod-005', name: 'Location-Based Promotions', description: 'Send targeted offers to shoppers based on their location.', price: 7000 },
  { id: 'mod-006', name: 'Network Optimization Suite', description: 'AI-powered network traffic management.', price: 25000 },
  { id: 'mod-007', name: '5G Infrastructure Rollout', description: 'End-to-end 5G deployment services.', price: 50000 },
];

export const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    title: 'Stadium OS Implementation for Global Stadium',
    client: mockClients[0],
    status: 'Accepted',
    lastUpdated: '2024-07-28',
    version: 3,
    modules: [mockModules[0], mockModules[1], mockModules[2]],
    totalValue: 35500,
  },
  {
    id: 'prop-002',
    title: 'Pilot Program for Metro Retail',
    client: mockClients[1],
    status: 'Sent',
    lastUpdated: '2024-07-30',
    version: 1,
    modules: [mockModules[3], mockModules[4]],
    totalValue: 27000,
  },
  {
    id: 'prop-003',
    title: 'Network Modernization with ConnectaTel',
    client: mockClients[2],
    status: 'Draft',
    lastUpdated: '2024-08-01',
    version: 1,
    modules: [mockModules[5]],
    totalValue: 25000,
  },
  {
    id: 'prop-004',
    title: 'Fan Experience Upgrade - City Arena',
    client: mockClients[3],
    status: 'Viewed',
    lastUpdated: '2024-07-29',
    version: 2,
    modules: [mockModules[0], mockModules[1]],
    totalValue: 27000,
  },
   {
    id: 'prop-005',
    title: 'Shopping Mall Digital Transformation',
    client: mockClients[1],
    status: 'Changes Requested',
    lastUpdated: '2024-07-25',
    version: 4,
    modules: [mockModules[3], mockModules[4]],
    totalValue: 27000,
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
          avatarUrl: mockUser.avatarUrl,
          initials: mockUser.initials,
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
    { number: 4, date: '2024-07-25', author: {uid: mockUser.uid, name: mockUser.displayName, avatarUrl: mockUser.avatarUrl, initials: mockUser.initials}, summary: 'Updated pricing for retail analytics and added volume discount.' },
    { number: 3, date: '2024-07-22', author: mockClientAuthor, summary: 'Client requested removal of loyalty program module.' },
    { number: 2, date: '2024-07-21', author: {uid: mockUser.uid, name: mockUser.displayName, avatarUrl: mockUser.avatarUrl, initials: mockUser.initials}, summary: 'Added new case study for a similar retail client.' },
    { number: 1, date: '2024-07-20', author: {uid: mockUser.uid, name: mockUser.displayName, avatarUrl: mockUser.avatarUrl, initials: mockUser.initials}, summary: 'Initial draft sent to client.' },
];
