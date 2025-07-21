
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input';
import type { Proposal, ProposalStatus } from '@/lib/types';
import { Plus, ListFilter, FileText, Search, Loader2 } from 'lucide-react';
import { useState, useRef, type MouseEvent, useEffect } from 'react';
import { ClientDate } from '@/components/client-date';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useTour, TourStep } from '@/hooks/use-tour';


function StatusBadge({ status }: { status: ProposalStatus }) {
  const baseClasses = "capitalize text-xs font-medium px-3 py-1 rounded-full";
  let statusClasses = "";

  switch (status) {
    case 'accepted':
    case 'signed':
    case 'paid':
      statusClasses = 'bg-success/20 text-success';
      break;
    case 'sent':
    case 'viewed':
      statusClasses = 'bg-secondary/20 text-secondary';
      break;
    case 'changes_requested':
      statusClasses = 'bg-impact/20 text-impact';
      break;
    case 'draft':
    default:
      statusClasses = 'bg-muted text-muted-foreground';
      break;
  }
  return (
      <div className={cn(baseClasses, statusClasses)}>
          {status.replace('_', ' ')}
      </div>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <div data-tour-id="proposal-card">
        <Card className="glass-card flex flex-col group h-full">
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
                For: {proposal.clientName || 'Unknown Client'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" />
                <span>V{proposal.version} - Updated on <ClientDate dateString={proposal.lastModified} /></span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-black/20 py-3 px-6 rounded-b-lg">
                <span className="text-xl font-bold text-accent">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalPrice)}
                </span>
                <Button variant="link" asChild>
                <Link href={`/proposals/${proposal.id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}

const proposalStatuses: ProposalStatus[] = ['draft', 'sent', 'viewed', 'accepted', 'signed', 'declined', 'changes_requested', 'paid'];

const dashboardTourSteps: TourStep[] = [
    {
        selector: '[data-tour-id="dashboard-header"]',
        title: "Welcome to your Dashboard!",
        content: "This is your central hub. From here, you can see all your proposals, create new ones, and manage your sales workflow."
    },
    {
        selector: '[data-tour-id="create-proposal-btn"]',
        title: "Create New Proposals",
        content: "Click here to start the proposal wizard. Our AI co-pilot will help you generate a tailored proposal in minutes."
    },
    {
        selector: '[data-tour-id="search-input"]',
        title: "Search & Filter",
        content: "Quickly find any proposal by searching for its title or client name. Use the filter to view proposals by their current status."
    },
    {
        selector: '[data-tour-id="proposal-card"]',
        title: "Proposal Cards",
        content: "Each card gives you an at-a-glance view of a proposal, including its status, client, and total value. Hover for a cool effect and click to see details."
    },
    {
        selector: '[data-tour-id="sidebar-nav"]',
        title: "Navigation",
        content: "Use the sidebar to navigate to other key areas like your client list, proposal templates, and settings."
    }
];


export default function Dashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const { startTour } = useTour();
  
  useEffect(() => {
    startTour('dashboard', dashboardTourSteps);
  }, [startTour]);

  useEffect(() => {
    if (loadingAuth || !user) {
      if (!loadingAuth) setLoadingProposals(false);
      return;
    }

    setLoadingProposals(true);
    // NOTE: This uses a hardcoded tenant ID for now.
    const tenantId = 'tenant-001';
    const proposalsCollectionRef = collection(db, 'tenants', tenantId, 'proposals');
    
    const q = query(proposalsCollectionRef, where('salesAgentId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const proposalsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
        setProposals(proposalsData);
        setLoadingProposals(false);
    }, (error) => {
        console.error("Error fetching proposals: ", error);
        setLoadingProposals(false);
    });

    return () => unsubscribe();
  }, [user, loadingAuth]);


  const filteredProposals = proposals.filter(proposal => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      proposal.title.toLowerCase().includes(lowerSearchTerm) || 
      (proposal.clientName && proposal.clientName.toLowerCase().includes(lowerSearchTerm));
    const matchesFilter = filter === 'All' || proposal.status.replace('_', ' ').toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });


  return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-tour-id="dashboard-header">
          <div>
            <h1 className="text-4xl font-bold font-headline">Sales Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your proposals and track their progress.
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            className="font-semibold rounded-lg px-4 py-2 flex items-center gap-2 hover-glow-secondary"
            data-tour-id="create-proposal-btn"
          >
            <Link href="/proposals/new" className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create New Proposal
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4" data-tour-id="search-input">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto sm:min-w-[150px]">
                    <ListFilter className="mr-2 h-4 w-4" />
                    Filter: {filter}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                    <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                    {proposalStatuses.map(status => (
                        <DropdownMenuRadioItem key={status} value={status.replace('_', ' ')} className="capitalize">
                            {status.replace('_', ' ')}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {loadingAuth || loadingProposals ? (
            <div className="flex justify-center items-center py-16 col-span-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProposals.map((proposal) => {
                    return <ProposalCard key={proposal.id} proposal={proposal} />
                })}
                </div>
                {filteredProposals.length === 0 && !loadingProposals && (
                    <div className="text-center py-16 text-muted-foreground col-span-full">
                        <p>No proposals found. <Link href="/proposals/new" className="text-primary underline">Create one now</Link>.</p>
                    </div>
                )}
            </>
        )}
      </div>
  );
}
