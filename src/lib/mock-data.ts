
import type { User, Version, ProposalTemplate } from './types';

export const mockUser: User = {
  uid: 'abc-123',
  email: 'alex.johnson@flowsales.com',
  displayName: 'Alex Johnson',
  role: 'sales_agent',
  tenantId: 'tenant-001',
};

// Templates are now simpler, as their config is in the tenant's collections
export const mockTemplates: ProposalTemplate[] = [
  {
    id: 'tmpl-001',
    name: "Stadium OS Proposal",
    description: "For sports venues and large arenas.",
    icon: "Users",
    sections: [],
  },
  {
    id: 'tmpl-002',
    name: "Shopping Mall Pilot Proposal",
    description: "For retail centers and commercial properties.",
    icon: "Package",
    sections: [],
  },
  {
    id: 'tmpl-003',
    name: "Telco Proposal",
    description: "For telecommunication infrastructure projects.",
    icon: "FileText",
    sections: [],
  },
];


export const mockVersions: Version[] = [
    { number: 4, date: '2024-07-25', author: {uid: mockUser.uid, name: mockUser.displayName || 'User', avatarUrl: '', initials: 'U'}, summary: 'Updated pricing for retail analytics and volume discount.' },
    { number: 3, date: '2024-07-22', author: {uid: 'xyz-789', name: 'Sarah Chen (Client)', avatarUrl: '', initials: 'SC'}, summary: 'Client requested removal of loyalty program module.' },
    { number: 2, date: '2024-07-21', author: {uid: mockUser.uid, name: mockUser.displayName || 'User', avatarUrl: '', initials: 'U'}, summary: 'Added new case study for a similar retail client.' },
    { number: 1, date: '2024-07-20', author: {uid: mockUser.uid, name: mockUser.displayName || 'User', avatarUrl: '', initials: 'U'}, summary: 'Initial draft sent to client.' },
];
