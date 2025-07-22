
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { notFound, useParams } from "next/navigation";
import {
  FileText,
  MessageCircle,
  Clock,
  CheckCircle,
  DollarSign,
  PenSquare,
  Download,
  Send,
  Eye,
  CalendarDays,
  GitPullRequest,
  Check,
  X,
  Loader2,
  Briefcase,
  Pencil,
  Share2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ClientDate } from "@/components/client-date";
import type { Proposal, ProposalStatus, Comment, SuggestedEdit, ProposalSection, Product, Version } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { formatDistanceToNow } from 'date-fns';
import { trackProposalView, createSuggestedEdit, acceptSuggestedEdit, rejectSuggestedEdit, acceptProposal } from "@/app/proposals/actions";
import { useToast } from '@/hooks/use-toast';
import { Label } from "@/components/ui/label";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAppContext } from "@/components/app-data-provider";
import Image from "next/image";

function getStatusBadgeClasses(status: ProposalStatus) {
  const baseClasses = "capitalize text-base font-semibold px-4 py-2 rounded-lg border";
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

function getInitials(name: string) {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

// Helper function to convert hex color to HSL string
function hexToHsl(hex: string): string | null {
    if (!hex || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
        return null;
    }
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
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}


export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [user, loadingAuth] = useAuthState(auth);
  const { toast } = useToast();
  const proposalContentRef = useRef<HTMLDivElement>(null);
  const { brandingSettings, loading: loadingAppData } = useAppContext();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [suggestedEdits, setSuggestedEdits] = useState<SuggestedEdit[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);


  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<{ section: ProposalSection; index: number } | null>(null);
  const [suggestionText, setSuggestionText] = useState("");
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  useEffect(() => {
    // Hardcoded tenantId for now
    const tenantId = 'tenant-001'; 
    if (proposalId && user && proposal?.status === 'sent') {
      trackProposalView(tenantId, proposalId);
    }
  }, [proposalId, user, proposal?.status]);

  useEffect(() => {
    if (!proposalId) return;

    // Hardcoded tenantId for now
    const tenantId = 'tenant-001';
    const docRef = doc(db, 'tenants', tenantId, 'proposals', proposalId);
    const unsubscribeProposal = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            setProposal({ id: docSnap.id, ...docSnap.data() } as Proposal);
        } else {
            notFound();
        }
        setIsLoading(false);
    });
    
    const proposalSubCollectionPath = `tenants/${tenantId}/proposals/${proposalId}`;

    const commentsQuery = query(collection(db, proposalSubCollectionPath, "comments"), orderBy("createdAt", "asc"));
    const unsubscribeComments = onSnapshot(commentsQuery, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() })) as Comment[];
      setComments(commentsData);
    });

    const editsQuery = query(collection(db, proposalSubCollectionPath, "suggested_edits"), orderBy("createdAt", "desc"));
    const unsubscribeEdits = onSnapshot(editsQuery, (querySnapshot) => {
      const editsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() })) as SuggestedEdit[];
      setSuggestedEdits(editsData);
    });
    
    const versionsQuery = query(collection(db, proposalSubCollectionPath, "versions"), orderBy("createdAt", "desc"));
    const unsubscribeVersions = onSnapshot(versionsQuery, (querySnapshot) => {
        const versionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() })) as Version[];
        setVersions(versionsData);
    });


    return () => {
        unsubscribeProposal();
        unsubscribeComments();
        unsubscribeEdits();
        unsubscribeVersions();
    };
  }, [proposalId]);


  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !user) return;
      try {
        // Hardcoded tenantId for now
        const tenantId = 'tenant-001';
        const commentsCollectionPath = `tenants/${tenantId}/proposals/${proposalId}/comments`;
        await addDoc(collection(db, commentsCollectionPath), {
          text: newComment,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          authorAvatarUrl: user.photoURL || "",
          createdAt: serverTimestamp(),
        });
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment: ", error);
        toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
      }
  };

  const handleSuggestEditClick = (section: ProposalSection, index: number) => {
      setCurrentSection({ section, index });
      setSuggestionText(section.content);
      setIsSheetOpen(true);
  };

  const handleSuggestionSubmit = async () => {
    if (!suggestionText.trim() || !user || !currentSection) return;
    setIsSubmittingSuggestion(true);
    try {
        // Hardcoded tenantId for now
        const tenantId = 'tenant-001';
        await createSuggestedEdit({
            tenantId,
            proposalId: proposalId,
            sectionIndex: currentSection.index,
            suggestedContent: suggestionText,
            authorId: user.uid,
            authorName: user.displayName || "Anonymous User",
        });
        toast({ title: "Suggestion Submitted", description: "The sales agent has been notified of your suggestion." });
        setIsSheetOpen(false);
    } catch (error) {
        console.error("Error submitting suggestion:", error);
        toast({ title: "Error", description: "Could not submit suggestion. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmittingSuggestion(false);
    }
  };
  
  const handleAcceptSuggestion = async (suggestion: SuggestedEdit) => {
      if (!user) return;
      try {
          const tenantId = 'tenant-001';
          await acceptSuggestedEdit({
              tenantId,
              suggestion,
              actor: { id: user.uid, name: user.displayName || 'Sales Agent' }
            });
          toast({ title: "Suggestion Accepted", description: "The proposal has been updated." });
      } catch (error) {
          console.error("Error accepting suggestion:", error);
          toast({ title: "Error", description: "Could not accept suggestion.", variant: "destructive" });
      }
  };

  const handleRejectSuggestion = async (suggestion: SuggestedEdit) => {
      try {
          // Hardcoded tenantId for now
          const tenantId = 'tenant-001';
          await rejectSuggestedEdit(tenantId, suggestion);
          toast({ title: "Suggestion Rejected", description: "The suggestion has been archived." });
      } catch (error) {
          console.error("Error rejecting suggestion:", error);
          toast({ title: "Error", description: "Could not reject suggestion.", variant: "destructive" });
      }
  };

  const handleDownloadPdf = async () => {
    const elementToCapture = proposalContentRef.current;
    if (!elementToCapture || !proposal) return;

    setIsDownloading(true);
    toast({ title: "Preparing PDF...", description: "Please wait while we generate your document." });

    elementToCapture.classList.add('pdf-export-light');

    try {
      const canvas = await html2canvas(elementToCapture, {
        scale: 2,
        backgroundColor: null, 
        useCORS: true,
        height: elementToCapture.scrollHeight,
        windowHeight: elementToCapture.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;

      let imgHeightOnPage = pdfWidth / canvasAspectRatio;
      let totalCanvasPixelHeight = canvasHeight;
      let canvasPixelHeightLeft = totalCanvasPixelHeight;
      let position = 0;

      const pagePixelHeight = canvasWidth / (pdfWidth / pdfHeight);

      while (canvasPixelHeightLeft > 0) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = pagePixelHeight;
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
            pageCtx.drawImage(canvas, 0, -position, canvasWidth, totalCanvasPixelHeight);
        }

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.9);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');

        canvasPixelHeightLeft -= pagePixelHeight;
        position += pagePixelHeight;

        if (canvasPixelHeightLeft > 0) {
          pdf.addPage();
        }
      }

      pdf.save(`${proposal.title}.pdf`);
      toast({ title: "Download Started", description: "Your PDF is being generated." });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Error", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      elementToCapture.classList.remove('pdf-export-light');
      setIsDownloading(false);
    }
  };

  const handleAcceptProposal = async () => {
    if (!proposal) return;
    setIsAccepting(true);
    try {
        const tenantId = 'tenant-001'; // Hardcoded for now
        await acceptProposal(tenantId, proposal.id);
        toast({ title: "Proposal Accepted!", description: "The sales agent has been notified.", variant: "success" });
    } catch (error) {
        console.error("Error accepting proposal:", error);
        toast({ title: "Error", description: "Could not accept the proposal.", variant: "destructive" });
    } finally {
        setIsAccepting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: proposal?.title || 'FlowSales Proposal',
      text: `Here is the proposal: ${proposal?.title || ''}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: 'Proposal Shared',
          description: 'The proposal was shared successfully.',
        });
      } catch (error) {
        // This can happen if the user cancels the share dialog
        console.log('Share was cancelled or failed', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
          title: "Link Copied!",
          description: "The collaboration link has been copied to your clipboard.",
      });
    }
  };


  if (isLoading || loadingAuth || loadingAppData) {
      return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  if (!proposal) {
    return <div></div>;
  }

  const isSalesAgent = user?.uid === proposal.salesAgentId;
  const pendingSuggestions = suggestedEdits.filter(s => s.status === 'pending');
  const canBeAccepted = proposal.status === 'sent' || proposal.status === 'viewed' || proposal.status === 'changes_requested';
  const canBeEdited = isSalesAgent && (proposal.status === 'draft' || proposal.status === 'sent' || proposal.status === 'viewed' || proposal.status === 'changes_requested');

  const dynamicStyles: React.CSSProperties = {};
  if (brandingSettings?.primaryColor) {
      const primaryHsl = hexToHsl(brandingSettings.primaryColor);
      if (primaryHsl) {
        dynamicStyles['--primary-color'] = primaryHsl;
      }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div ref={proposalContentRef} className="space-y-8 bg-card p-8 rounded-lg proposal-brand-scope" style={dynamicStyles}>
                {/* Header */}
                <div className="pb-6 border-b border-border">
                    <div className="flex justify-between items-start gap-4">
                        {brandingSettings?.logoUrl && (
                            <div className="relative w-32 h-16 shrink-0">
                                <Image src={brandingSettings.logoUrl} alt={`${brandingSettings.companyName || ''} Logo`} fill className="object-contain" />
                            </div>
                        )}
                        <div className="flex-grow">
                            <h1 className="text-4xl font-bold text-foreground">{proposal.title}</h1>
                            <p className="text-lg text-muted-foreground mt-1">For {proposal.clientName || 'Unknown Client'}</p>
                        </div>
                        <div className={getStatusBadgeClasses(proposal.status)}>
                            {proposal.status.replace('_', ' ')}
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span>Version {proposal.version}</span>
                        <Separator orientation="vertical" className="h-4 bg-border" />
                        <span>Last updated on <ClientDate dateString={proposal.lastModified} /></span>
                        <Separator orientation="vertical" className="h-4 bg-border" />
                        <span className="font-bold text-lg text-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalPrice)}</span>
                    </div>
                </div>

                {isSalesAgent && pendingSuggestions.length > 0 && (
                <Card className="border-impact/50">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-impact"><GitPullRequest /> Pending Suggestions</CardTitle>
                    <CardDescription>The client has suggested the following edits. Accept or reject them below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {pendingSuggestions.map(edit => (
                        <div key={edit.id} className="border p-4 rounded-lg bg-muted/20">
                        <p className="text-sm font-semibold">Section: "{edit.sectionTitle}"</p>
                        <p className="text-xs text-muted-foreground mb-2">Suggested by {edit.authorName} - {edit.createdAt ? formatDistanceToNow(edit.createdAt, { addSuffix: true }) : 'just now'}</p>
                        <div className="mt-2 p-2 bg-background rounded-md border border-dashed">
                            <p className="text-sm whitespace-pre-wrap">{edit.suggestedContent}</p>
                        </div>
                        <div className="flex gap-2 mt-4 justify-end">
                            <Button size="sm" variant="destructive" onClick={() => handleRejectSuggestion(edit)}><X className="h-4 w-4 mr-2" /> Reject</Button>
                            <Button size="sm" variant="success" onClick={() => handleAcceptSuggestion(edit)}><Check className="h-4 w-4 mr-2" /> Accept</Button>
                        </div>
                        </div>
                    ))}
                    </CardContent>
                </Card>
                )}

            {/* Proposal Content */}
            <Card>
                <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><FileText className="text-primary-color"/> Proposal Sections</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-6">
                    {proposal.sections.map((section, index) => (
                        <div key={index} className="relative group p-2 -m-2 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                        <div className="flex justify-between items-start">
                             <h3 className="text-xl font-semibold border-b border-transparent pb-2 mb-2">{section.title}</h3>
                            {!isSalesAgent && (
                                <Button size="sm" variant="ghost" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-secondary hover:bg-secondary/10" onClick={() => handleSuggestEditClick(section, index)}>
                                    <PenSquare className="h-4 w-4" /> Suggest Edit
                                </Button>
                            )}
                        </div>
                        <p className="whitespace-pre-wrap">{section.content}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl flex items-center gap-2"><Briefcase className="text-primary-color"/> Included Products</CardTitle>
                        <CardDescription>The products and services included in this proposal.</CardDescription>
                    </div>
                     {canBeEdited && (
                        <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4 mr-2" /> Edit Products
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-0">
                    <div className="divide-y divide-border">
                        {proposal.selectedProducts.map((product: Product) => (
                            <div key={product.id} className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground">{product.description}</p>
                                </div>
                                <p className="text-right font-bold shrink-0 ml-4">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.basePrice)}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="bg-card-foreground/5 p-4 rounded-b-lg flex justify-end">
                    <div className="text-right">
                        <p className="text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold text-primary-color">{new Intl.NumberFormat('en-US', { style: 'currency', 'currency': 'USD' }).format(proposal.totalPrice)}</p>
                    </div>
                </CardFooter>
            </Card>
           </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle /> Client Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                variant="success" 
                disabled={isSalesAgent || !canBeAccepted || isAccepting}
                onClick={handleAcceptProposal}
              >
                {isAccepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Accept & E-Sign
              </Button>
               <Button variant="outline" className="w-full" onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download as PDF
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              <Separator className="my-2 bg-border" />
               <Button variant="default" className="w-full" disabled>
                <DollarSign className="mr-2 h-4 w-4" /> Pay Deposit or Full Amount
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye /> Engagement Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground flex items-center gap-2"><Eye /> Total Views</span>
                   <span className="font-bold">{proposal.engagementData.views}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground flex items-center gap-2"><CalendarDays /> Last Viewed</span>
                   <span className="font-bold">
                       {proposal.engagementData.lastViewed ? <ClientDate dateString={proposal.engagementData.lastViewed} /> : 'Never'}
                   </span>
               </div>
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle /> Comments & Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={comment.authorAvatarUrl} />
                    <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                            {comment.createdAt ? formatDistanceToNow(comment.createdAt, { addSuffix: true }) : 'just now'}
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to start the conversation!</p>
              )}
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
                <form onSubmit={handleCommentSubmit} className="w-full space-y-2">
                    <Textarea 
                        placeholder="Add a comment or start a discussion..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!user}
                    />
                    <Button 
                        size="sm" 
                        className="w-full" 
                        type="submit" 
                        disabled={!newComment.trim() || !user}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Post Comment
                    </Button>
                </form>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock /> Version History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {versions.length > 0 ? versions.map((version) => (
                <div key={version.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-8 h-8 mb-1">
                      <AvatarImage src={version.authorAvatarUrl} />
                      <AvatarFallback>{getInitials(version.authorName)}</AvatarFallback>
                    </Avatar>
                    <div className="w-px flex-1 bg-border"></div>
                  </div>
                  <div>
                    <p className="font-semibold">Version {version.versionNumber}</p>
                    <p className="text-sm text-muted-foreground">{version.summary}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {version.createdAt ? formatDistanceToNow(version.createdAt, { addSuffix: true }) : 'just now'} by {version.authorName}
                    </p>
                  </div>
                </div>
              )) : (
                 <p className="text-sm text-muted-foreground text-center py-4">No version history yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent>
              <SheetHeader>
                  <SheetTitle>Suggest an Edit</SheetTitle>
                  <SheetDescription>
                      Propose a change for the section: <strong>{currentSection?.section.title}</strong>. The sales agent will be notified to review your suggestion.
                  </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                 <div>
                    <Label htmlFor="original-content">Original Content</Label>
                    <Textarea id="original-content" value={currentSection?.section.content} readOnly rows={5} className="bg-muted/50" />
                 </div>
                 <div>
                    <Label htmlFor="suggested-content">Your Suggestion</Label>
                    <Textarea id="suggested-content" value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} rows={8} placeholder="Type your suggested changes here..."/>
                 </div>
              </div>
              <SheetFooter>
                  <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                  <Button onClick={handleSuggestionSubmit} disabled={isSubmittingSuggestion || !suggestionText.trim()}>
                      {isSubmittingSuggestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Suggestion
                  </Button>
              </SheetFooter>
          </SheetContent>
      </Sheet>
    </>
  );
}
