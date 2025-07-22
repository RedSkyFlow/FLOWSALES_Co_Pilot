
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Proposal, BrandingSettings, Client, ProposalSection, ProposalStatus } from '@/lib/types';
import { Loader2, MessageSquare, Edit3, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ClientDate } from '@/components/client-date';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { ProposalComments } from '@/components/proposal-comments';
import { SuggestEditDialog } from '@/components/suggest-edit-dialog';
import { AcceptProposalDialog } from '@/components/accept-proposal-dialog';
import { useToast } from '@/hooks/use-toast';

// Helper function to convert hex color to HSL string for CSS variables
function hexToHsl(hex: string): string | null {
    if (!hex || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) return null;
    let r, g, b;
    hex = hex.substring(1);
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `${(h * 360).toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%`;
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Proposal...</p>
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
            <p className="text-xl font-semibold text-destructive">{message}</p>
        </div>
    );
}

export default function ProposalViewPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const tenantId = searchParams.get('tenantId');
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [branding, setBranding] = useState<BrandingSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    
    // State for dialogs
    const [isSuggestingEdit, setIsSuggestingEdit] = useState(false);
    const [selectedSection, setSelectedSection] = useState<{section: ProposalSection, index: number} | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);

    // This local state will track the proposal's status for immediate UI feedback
    const [proposalStatus, setProposalStatus] = useState<ProposalStatus | null>(null);

    useEffect(() => {
        if (!params.id || !tenantId) {
            setError('This proposal link is invalid or incomplete.');
            setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                const proposalRef = doc(db, 'tenants', tenantId!, 'proposals', params.id);
                const proposalSnap = await getDoc(proposalRef);

                if (!proposalSnap.exists()) {
                    setError('Proposal not found.');
                    return;
                }
                const proposalData = { id: proposalSnap.id, ...proposalSnap.data() } as Proposal;
                setProposal(proposalData);
                setProposalStatus(proposalData.status);

                if (proposalData.clientId) {
                    const clientRef = doc(db, 'tenants', tenantId!, 'clients', proposalData.clientId);
                    const clientSnap = await getDoc(clientRef);
                    if(clientSnap.exists()) setClient(clientSnap.data() as Client);
                }

                const settingsRef = collection(db, 'tenants', tenantId!, 'settings');
                const q = query(settingsRef, where('id', '==', 'branding'), limit(1));
                const settingsSnap = await getDocs(q);

                if (!settingsSnap.empty) {
                    const brandingData = settingsSnap.docs[0].data() as BrandingSettings;
                    setBranding(brandingData);
                    
                    const primaryHsl = hexToHsl(brandingData.primaryColor || '#000000');
                    if (primaryHsl) document.documentElement.style.setProperty('--p', primaryHsl);
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred while loading the proposal.');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [params.id, tenantId]);

    const handleSuggestEditClick = (section: ProposalSection, index: number) => {
        setSelectedSection({ section, index });
        setIsSuggestingEdit(true);
    }

    const handleAcceptance = async () => {
        // This function will be called after the dialog confirms acceptance.
        // It simulates the final "signing" step.
        setProposalStatus('signed');
        try {
            const proposalRef = doc(db, 'tenants', tenantId!, 'proposals', params.id);
            await updateDoc(proposalRef, { 
                status: 'signed',
                'signatureData.status': 'signed',
                'signatureData.signedAt': new Date().toISOString(),
             });
        } catch (e) {
            console.error("Could not update proposal to 'signed'", e);
            toast({title: "Error", description: "Could not finalize signature.", variant: "destructive"});
        }
    }
    
    const isProposalActionable = proposalStatus && !['accepted', 'signed', 'paid', 'declined'].includes(proposalStatus);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;
    if (!proposal || !tenantId) return <ErrorState message="Proposal data could not be loaded." />;
    
    const mockCurrentUser = {
        id: client?.id || 'client-viewer',
        name: client?.contactPerson || 'Client Viewer',
        avatarUrl: ''
    };
    
    return (
        <div className="min-h-screen bg-muted/20 font-body">
            <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border shadow-sm">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                           {branding?.logoUrl && (
                                <Image src={branding.logoUrl} alt="Company Logo" width={40} height={40} className="object-contain" />
                            )}
                            <h1 className="text-xl font-bold text-foreground font-headline">{branding?.companyName || proposal.title}</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-foreground tracking-tight">{proposal.title}</h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Prepared for: {proposal.clientName} | Last updated: <ClientDate dateString={proposal.lastModified} />
                        </p>
                    </div>

                    <div className="space-y-8">
                        {proposal.sections.map((section, index) => (
                            <Card key={index} className="overflow-hidden shadow-lg border-2 border-primary/10 group relative">
                                <CardHeader className="bg-primary/5 p-6 flex flex-row justify-between items-center">
                                    <h2 className="text-2xl font-bold font-headline text-primary">{section.title}</h2>
                                    {isProposalActionable && (
                                         <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleSuggestEditClick(section, index)}
                                        >
                                            <Edit3 className="mr-2 h-4 w-4" /> Suggest Edit
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="p-6 prose prose-lg max-w-none prose-p:text-foreground/80 prose-headings:text-foreground"
                                    dangerouslySetInnerHTML={{ __html: section.content.replace(/
/g, '<br />') }} 
                                />
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
            
            <footer className="sticky bottom-0 z-20 bg-background/90 backdrop-blur-sm border-t border-border py-4">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-4">
                    {proposalStatus === 'signed' ? (
                        <div className="flex items-center gap-2 text-success font-semibold">
                            <ShieldCheck className="h-6 w-6" />
                            <span>Proposal Signed & Accepted on <ClientDate dateString={proposal.signatureData.signedAt || new Date().toISOString()} /></span>
                        </div>
                    ) : (
                        <>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button size="lg" variant="secondary" disabled={!isProposalActionable}><MessageSquare className="mr-2 h-5 w-5"/> Leave a Comment</Button>
                                </SheetTrigger>
                                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                                    <SheetHeader>
                                        <SheetTitle>Proposal Comments</SheetTitle>
                                        <SheetDescription>
                                            Discuss this proposal with the sales team. Your comments are visible to everyone with access.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="flex-1 overflow-y-auto pr-6">
                                    <ProposalComments 
                                            tenantId={tenantId} 
                                            proposalId={proposal.id} 
                                            currentUser={mockCurrentUser} 
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <Button size="lg" className="hover-glow-primary" disabled={!isProposalActionable} onClick={() => setIsAccepting(true)}>
                                <CheckCircle className="mr-2 h-5 w-5"/> Accept & Sign Proposal
                            </Button>
                        </>
                    )}
                </div>
            </footer>
            {selectedSection && (
                 <SuggestEditDialog
                    open={isSuggestingEdit}
                    onOpenChange={setIsSuggestingEdit}
                    proposal={proposal}
                    section={selectedSection.section}
                    sectionIndex={selectedSection.index}
                    tenantId={tenantId}
                    currentUser={mockCurrentUser}
                 />
            )}
            <AcceptProposalDialog
                open={isAccepting}
                onOpenChange={(isOpen) => {
                    setIsAccepting(isOpen);
                    if (!isOpen) handleAcceptance();
                }}
                proposal={proposal}
                tenantId={tenantId}
            />
        </div>
    );
}
