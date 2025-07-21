
'use client';
import { MainLayout } from "@/components/main-layout";
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
import { mockVersions } from "@/lib/mock-data";
import { notFound } from "next/navigation";
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
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ClientDate } from "@/components/client-date";
import type { Proposal, ProposalStatus, Comment, SuggestedEdit, ProposalSection, Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { formatDistanceToNow } from 'date-fns';
import { trackProposalView, createSuggestedEdit, acceptSuggestedEdit, rejectSuggestedEdit } from "@/app/proposals/actions";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

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

export default function ProposalDetailPage({
  params: { id: proposalId },
}: {
  params: { id: string };
}) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [user, loadingAuth] = useAuthState(auth);
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [suggestedEdits, setSuggestedEdits] = useState<SuggestedEdit[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<{ section: ProposalSection; index: number } | null>(null);
  const [suggestionText, setSuggestionText] = useState("");
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);
  
  useEffect(() => {
    // Hardcoded tenantId for now
    const tenantId = 'tenant-001'; 
    if (proposalId && user) {
      trackProposalView(tenantId, proposalId);
    }
  }, [proposalId, user]);

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

    return () => {
        unsubscribeProposal();
        unsubscribeComments();
        unsubscribeEdits();
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
      try {
          // Hardcoded tenantId for now
          const tenantId = 'tenant-001';
          await acceptSuggestedEdit(tenantId, suggestion);
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


  if (isLoading || loadingAuth) {
      return <MainLayout><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div></MainLayout>
  }

  if (!proposal) {
    return <MainLayout><div></div></MainLayout>;
  }

  const isSalesAgent = user?.uid === proposal.salesAgentId;
  const pendingSuggestions = suggestedEdits.filter(s => s.status === 'pending');

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-border">
                <div className="flex justify-between items-start">
                    <div>
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
                      <p className="text-xs text-muted-foreground mb-2">Suggested by {edit.authorName} - {formatDistanceToNow(edit.createdAt, { addSuffix: true })}</p>
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
              <CardTitle className="text-2xl flex items-center gap-2"><FileText className="text-primary"/> Proposal Sections</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none space-y-6">
                {proposal.sections.map((section, index) => (
                    <div key={index} className="relative group">
                      <h3 className="text-xl font-semibold border-b border-border pb-2 mb-2">{section.title}</h3>
                      <p>{section.content}</p>
                      {!isSalesAgent && (
                         <Button size="sm" variant="outline" className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleSuggestEditClick(section, index)}>
                            <PenSquare className="h-4 w-4 mr-2" /> Suggest Edit
                         </Button>
                      )}
                    </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Included Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {proposal.selectedProducts.map((product: Product) => (
                <div key={product.id} className="p-4 border border-border rounded-lg bg-black/10">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <p className="text-right font-bold mt-2">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.basePrice)}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="bg-card-foreground/5 p-4 rounded-b-lg flex justify-end">
                <div className="text-right">
                    <p className="text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', 'currency': 'USD' }).format(proposal.totalPrice)}</p>
                </div>
            </CardFooter>
          </Card>
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
              <Button className="w-full" variant="secondary" disabled={isSalesAgent}>
                <PenSquare className="mr-2 h-4 w-4" /> Accept & E-Sign
              </Button>
               <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download as PDF
              </Button>
              <Separator className="my-2 bg-border" />
               <Button variant="accent" className="w-full" disabled={isSalesAgent}>
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
              {mockVersions.map((version) => (
                <div key={version.number} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-8 h-8 mb-1">
                      <AvatarImage src={version.author.avatarUrl} />
                      <AvatarFallback>{version.author.initials}</AvatarFallback>
                    </Avatar>
                    <div className="w-px flex-1 bg-border"></div>
                  </div>
                  <div>
                    <p className="font-semibold">Version {version.number}</p>
                    <p className="text-sm text-muted-foreground">{version.summary}</p>
                    <p className="text-xs text-muted-foreground mt-1"><ClientDate dateString={version.date} /></p>
                  </div>
                </div>
              ))}
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
    </MainLayout>
  );
}
