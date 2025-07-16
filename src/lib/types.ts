export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'sales_agent' | 'admin';
  avatarUrl: string;
  initials: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  price: number;
}

export type ProposalStatus = 'Draft' | 'Sent' | 'Viewed' | 'Changes Requested' | 'Accepted' | 'Signed' | 'Paid';

export interface Proposal {
  id:string;
  title: string;
  client: Client;
  status: ProposalStatus;
  lastUpdated: string;
  version: number;
  modules: Module[];
  totalValue: number;
}

export interface Comment {
  id: string;
  author: {
    uid: string;
    name: string;
    avatarUrl: string;
    initials: string;
  }
  timestamp: string;
  content: string;
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
