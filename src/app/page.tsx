'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/main-layout';
import type { Proposal, ProposalStatus } from '@/lib/types';
import { mockProposals, mockClients } from '@/lib/mock-data';
import { Plus, ListFilter, FileText, Search } from 'lucide-react';
import { useState } from 'react';
import { ClientDate } from '@/components/client-date';
import { cn } from '@/lib/utils';

function getStatusBadgeClasses(status: ProposalStatus) {
  const baseClasses = "capitalize text-xs font-semibold px-2.5 py-1 rounded-full border";
  switch (status) {
    case 'accepted':
    case 'signed':
    case 'paid':
      return cn(baseClasses, 'bg-success/20 text-success border-success/30');
    case 'sent':
    case 'viewed':
      return cn(baseClasses, 'bg-secondary/20 text-secondary border-secondary/30');
    case 'changes_requested':
      return cn(baseClasses, 'bg-impact/20 text-impact border-impact/30');
    case 'draft':
    default:
      return cn(baseClasses, 'bg-muted/20 text-muted-foreground border-muted-foreground/20');
  }
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const client = mockClients.find(c => c.id === proposal.clientId);
  return (
    <Card className="bg-card border border-border hover:border-primary transition-all duration-300 flex flex-col group shadow-lg hover:shadow-primary/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
            <Link href={`/proposals/${proposal.id}`}>
              {proposal.title}
            </Link>
          </CardTitle>
           <div className={getStatusBadgeClasses(proposal.status)}>
            {proposal.status.replace('_', ' ')}
          </div>
        </div>
        <CardDescription className="text-muted-foreground pt-1">
          For: {client?.name || 'Unknown Client'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <FileText className="mr-2 h-4 w-4" />
          <span>V{proposal.version} - Updated on <ClientDate dateString={proposal.lastModified} /></span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-black/20 py-3 px-6">
        <span className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalPrice)}
        </span>
        <Button variant="outline" asChild>
          <Link href={`/proposals/${proposal.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredProposals = mockProposals.filter(proposal => {
    const client = mockClients.find(c => c.id === proposal.clientId);
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      proposal.title.toLowerCase().includes(lowerSearchTerm) || 
      (client && client.name.toLowerCase().includes(lowerSearchTerm));
    const matchesFilter = filter === 'All' || proposal.status.replace('_', ' ').toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });


  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Sales Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your proposals and track their progress.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/proposals/new" className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create New Proposal
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              className="bg-input border-border pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="w-full sm:w-auto">
            <ListFilter className="mr-2 h-4 w-4" />
            Filter: {filter}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
        {filteredProposals.length === 0 && (
            <div className="text-center py-16 text-muted-foreground col-span-full">
                <p>No proposals found for the current filter.</p>
            </div>
        )}
      </div>
    </MainLayout>
  );
}
