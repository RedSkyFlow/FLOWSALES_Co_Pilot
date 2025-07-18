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
import { useState, useRef, useEffect, type MouseEvent } from 'react';
import { ClientDate } from '@/components/client-date';
import { cn } from '@/lib/utils';

function StatusBadge({ status }: { status: ProposalStatus }) {
  const baseClasses = "capitalize text-xs font-medium px-3 py-1 rounded-full";
  let statusClasses = "";

  switch (status) {
    case 'accepted':
    case 'signed':
    case 'paid':
      statusClasses = 'bg-success text-success-foreground';
      break;
    case 'sent':
    case 'viewed':
      statusClasses = 'bg-secondary text-secondary-foreground';
      break;
    case 'changes_requested':
      statusClasses = 'bg-impact text-impact-foreground';
      break;
    case 'draft':
    default:
      statusClasses = 'bg-border text-muted-foreground';
      break;
  }
  return (
      <div className={cn(baseClasses, statusClasses)}>
          {status.replace('_', ' ')}
      </div>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const client = mockClients.find(c => c.id === proposal.clientId);
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    const rotateX = (y - 0.5) * -15; // Max rotation 7.5 degrees
    const rotateY = (x - 0.5) * 15;  // Max rotation 7.5 degrees

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const onMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="transform-style-3d transition-transform duration-300 ease-out"
    >
        <Card className="bg-card/60 backdrop-blur-lg border border-border hover:border-primary transition-all duration-300 flex flex-col group h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        <Link href={`/proposals/${proposal.id}`}>
                        {proposal.title}
                        </Link>
                    </CardTitle>
                    <StatusBadge status={proposal.status} />
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
            <CardFooter className="flex justify-between items-center bg-black/20 py-3 px-6 rounded-b-lg">
                <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalPrice)}
                </span>
                <Button variant="outline" asChild>
                <Link href={`/proposals/${proposal.id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
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
          <Button
            asChild
            className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
            size="lg"
          >
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
