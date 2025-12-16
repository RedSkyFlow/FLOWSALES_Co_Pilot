
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
import { MainLayout } from '@/components/main-layout';
import type { Proposal, ProposalStatus, User } from '@/lib/types';
import { Plus, ListFilter, FileText, Search, Loader2 } from 'lucide-react';
import { useState, useRef, type MouseEvent, useEffect } from 'react';
import { ClientDate } from '@/components/client-date';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { useTour } from '@/components/tour/use-tour';
import { dashboardTourSteps } from '@/components/tour/tour-steps';


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
      style={{ transformStyle: "preserve-3d" }}
      className="transition-transform duration-300 ease-out"
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
                <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalPrice)}
                </span>
                <Button variant="ghost" asChild>
                <Link href={`/proposals/${proposal.id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}

const proposalStatuses: ProposalStatus[] = ['draft', 'sent', 'viewed', 'accepted', 'signed', 'declined', 'changes_requested', 'paid'];


export default function Dashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const { setSteps } = useTour();

  useEffect(() => {
    setSteps(dashboardTourSteps);
  }, [setSteps]);

  useEffect(() => {
    if (loadingAuth || !user) {
      if (!loadingAuth) setLoadingProposals(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const uData = docSnap.data() as User;
            setUserData(uData);

            if (uData.tenantId) {
                setLoadingProposals(true);
                const proposalsCollectionRef = collection(db, 'tenants', uData.tenantId, 'proposals');
                const q = query(proposalsCollectionRef, where('salesAgentId', '==', user.uid));
                
                const unsubscribeProposals = onSnapshot(q, (querySnapshot) => {
                    const proposalsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
                    setProposals(proposalsData);
                    setLoadingProposals(false);
                }, (error) => {
                    console.error("Error fetching proposals: ", error);
                    setLoadingProposals(false);
                });
                return () => unsubscribeProposals();
            } else {
                setLoadingProposals(false);
            }
        } else {
            setLoadingProposals(false);
        }
    });

    return () => unsubUser();
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Sales Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your proposals and track their progress.
            </p>
          </div>
          <Button
            asChild
            id="tour-step-1"
            className="font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-primary/90 hover:shadow-glow-primary hover:-translate-y-0.5"
          >
            <Link href="/proposals/new" className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create New Proposal
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div id="tour-step-2" className="relative w-full sm:flex-1">
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
                <div id="tour-step-3" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
