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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/main-layout';
import type { Proposal, ProposalStatus } from '@/lib/types';
import { mockProposals, mockClients } from '@/lib/mock-data';
import { PlusCircle, ListFilter, FileText } from 'lucide-react';
import { useState } from 'react';
import { ClientDate } from '@/components/client-date';
import { cn } from '@/lib/utils';

function getStatusBadgeVariant(status: ProposalStatus) {
  const baseClasses = "capitalize";
  switch (status) {
    case 'accepted':
    case 'signed':
    case 'paid':
      return cn(baseClasses, 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800');
    case 'sent':
    case 'viewed':
      return cn(baseClasses, 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800');
    case 'changes_requested':
      return cn(baseClasses, 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800');
    case 'draft':
    default:
      return cn(baseClasses, 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600');
  }
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const client = mockClients.find(c => c.id === proposal.clientId);
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl mb-1">
            <Link href={`/proposals/${proposal.id}`} className="hover:text-primary transition-colors">
              {proposal.title}
            </Link>
          </CardTitle>
           <Badge variant="outline" className={getStatusBadgeVariant(proposal.status)}>
            {proposal.status.replace('_', ' ')}
          </Badge>
        </div>
        <CardDescription>
          For: {client?.name || 'Unknown Client'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <FileText className="mr-2 h-4 w-4" />
          <span>V{proposal.version} - Updated on <ClientDate dateString={proposal.lastModified} /></span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
            <span className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalPrice)}
            </span>
          <Button variant="secondary" asChild>
            <Link href={`/proposals/${proposal.id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredProposals = mockProposals.filter(proposal => {
    const client = mockClients.find(c => c.id === proposal.clientId);
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) || (client && client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'All' || proposal.status === filter.toLowerCase().replace(' ', '_');
    return matchesSearch && matchesFilter;
  });

  const filterOptions: ProposalStatus[] = ['draft', 'sent', 'viewed', 'changes_requested', 'accepted', 'paid'];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Sales Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your proposals and track their progress.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/proposals/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Proposal
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Input
              placeholder="Search proposals..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <ListFilter className="mr-2 h-4 w-4" />
                Filter: {filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setFilter('All')}>All</DropdownMenuItem>
              {filterOptions.map(status => (
                <DropdownMenuItem key={status} onSelect={() => setFilter(status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '))}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
        {filteredProposals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground col-span-full">
                <p>No proposals found.</p>
            </div>
        )}
      </div>
    </MainLayout>
  );
}
