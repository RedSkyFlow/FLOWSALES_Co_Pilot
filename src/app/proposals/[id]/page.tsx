
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
  mockClients,
  mockVersions,
} from "@/lib/mock-data";
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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ClientDate } from "@/components/client-date";
import type { Proposal, ProposalStatus, Comment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { formatDistanceToNow } from 'date-fns';
import { trackProposalView } from "@/app/proposals/actions";

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
  params,
}: {
  params: { id: string };
}) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const client = proposal ? mockClients.find(c => c.id === proposal.clientId) : null;
  const [user, loadingAuth] = useAuthState(auth);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      trackProposalView(params.id);
    }
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;

    const docRef = doc(db, 'proposals', params.id);
    
    const unsubscribeProposal = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            setProposal({ id: docSnap.id, ...docSnap.data() } as Proposal);
        } else {
            notFound();
        }
        setIsLoading(false);
    });

    const commentsQuery = query(
      collection(db, "proposals", params.id, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeComments = onSnapshot(commentsQuery, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to JS Date
      })) as Comment[];
      setComments(commentsData);
    });

    return () => {
        unsubscribeProposal();
        unsubscribeComments();
    };
  }, [params.id]);


  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !user) return;

      try {
        await addDoc(collection(db, "proposals", params.id, "comments"), {
          text: newComment,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          authorAvatarUrl: user.photoURL || "",
          createdAt: serverTimestamp(),
        });
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment: ", error);
      }
  };

  if (isLoading) {
      return <MainLayout><div>Loading proposal...</div></MainLayout>
  }

  if (!proposal || !client) {
    // notFound will be called inside useEffect if doc doesn't exist
    return <MainLayout><div></div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-border">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground">{proposal.title}</h1>
                        <p className="text-lg text-muted-foreground mt-1">For {client.name}</p>
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

          {/* Proposal Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><FileText className="text-primary"/> {proposal.sections[0].title}</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                {proposal.sections.map((section, index) => (
                    <div key={index}>
                      <p>{section.content}</p>
                    </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Included Modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {proposal.selectedModules.map((module) => (
                <div key={module.id} className="p-4 border border-border rounded-lg bg-black/10">
                  <h3 className="font-semibold">{module.name}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <p className="text-right font-bold mt-2">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(module.basePrice)}</p>
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
              <Button className="w-full" variant="secondary">
                <PenSquare className="mr-2 h-4 w-4" /> Accept & E-Sign
              </Button>
               <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download as PDF
              </Button>
              <Separator className="my-2 bg-border" />
               <Button variant="accent" className="w-full">
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
                        placeholder="Add a comment or suggest an edit..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!user || loadingAuth}
                    />
                    <Button 
                        size="sm" 
                        className="w-full" 
                        type="submit" 
                        disabled={!newComment.trim() || !user || loadingAuth}
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
    </MainLayout>
  );
}
