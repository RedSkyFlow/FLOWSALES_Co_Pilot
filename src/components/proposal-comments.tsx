
'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Comment, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClientDate } from '@/components/client-date';
import { Loader2, Send } from 'lucide-react';
import { addComment } from '@/app/proposals/actions';

function getInitials(name: string | null) {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}


interface ProposalCommentsProps {
    tenantId: string;
    proposalId: string;
    // The user viewing the page. Could be the sales agent or the client contact.
    // NOTE: For this to be secure, we'd need a proper session/auth for the public view.
    // For now, we'll pass a mock user object for display purposes.
    currentUser: {
        id: string;
        name: string;
        avatarUrl?: string;
    }
}

export function ProposalComments({ tenantId, proposalId, currentUser }: ProposalCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const commentsRef = collection(db, `tenants/${tenantId}/proposals/${proposalId}/comments`);
        const q = query(commentsRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
            setComments(commentsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching comments: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tenantId, proposalId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await addComment({
                tenantId,
                proposalId,
                commentText: newComment,
                author: currentUser,
            });
            setNewComment('');
        } catch (error) {
            console.error("Failed to add comment:", error);
            // Here you might want to show a toast to the user
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold font-headline">Comments</h3>
            {loading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src={comment.authorAvatarUrl} />
                                <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{comment.authorName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <ClientDate dateString={comment.createdAt?.toDate().toISOString()} />
                                    </p>
                                </div>
                                <p className="text-sm text-foreground/80">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-start gap-4 pt-4 border-t">
                 <Avatar>
                    <AvatarImage src={currentUser.avatarUrl} />
                    <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <Textarea
                        placeholder="Leave a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isSubmitting}
                    />
                     <Button type="submit" size="sm" className="mt-2" disabled={isSubmitting || !newComment.trim()}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                        Post Comment
                    </Button>
                </div>
            </form>
        </div>
    );
}
