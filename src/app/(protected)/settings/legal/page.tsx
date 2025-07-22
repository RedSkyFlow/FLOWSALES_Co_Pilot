
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { LegalDocument, User } from '@/lib/types';
import { useAppData } from '@/components/app-data-provider';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AddLegalDocDialog } from '@/components/add-legal-doc-dialog';
import { deleteLegalDocument } from '@/app/settings/legal/actions';

export default function LegalPage() {
    const { toast } = useToast();
    const [user, loadingAuth] = useAuthState(auth);
    const { legalDocuments, loading: loadingData } = useAppData();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        if (!loadingAuth && user) {
            // This is a placeholder for a real role management system
            const tenantId = 'tenant-001'; 
            setUserData({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'admin',
                tenantId: tenantId,
            });
        }
    }, [user, loadingAuth]);

    const handleEditDoc = (doc: LegalDocument) => {
        setEditingDoc(doc);
        setIsAddOpen(true);
    }
    
    const handleAddNewDoc = () => {
        setEditingDoc(null);
        setIsAddOpen(true);
    }

    const handleDeleteDoc = async (docId: string) => {
        if (!userData?.tenantId) return;
        try {
            await deleteLegalDocument(userData.tenantId, docId);
            toast({
                title: 'Document Deleted',
                description: 'The legal document has been successfully deleted.',
            });
        } catch (error) {
             toast({
                title: 'Error',
                description: 'Failed to delete document. Please try again.',
                variant: 'destructive',
            });
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold">Legal & Compliance</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your standard legal documents like Terms & Conditions.
                    </p>
                </div>
                {userData?.role === 'admin' && (
                    <Button
                        className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
                        onClick={handleAddNewDoc}
                    >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add New Document
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Legal Documents</CardTitle>
                    <CardDescription>These can be appended to proposals.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingData || loadingAuth ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : legalDocuments.length > 0 ? (
                       <div className="space-y-4">
                            {legalDocuments.map(doc => (
                                <div key={doc.id} className="p-4 border rounded-lg bg-muted/20 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <FileText className="h-6 w-6 text-primary" />
                                        <div>
                                            <p className="font-semibold">{doc.title}</p>
                                            <p className="text-muted-foreground text-sm line-clamp-1">{doc.content}</p>
                                        </div>
                                    </div>
                                    {userData?.role === 'admin' && (
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditDoc(doc)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                         <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the document "{doc.title}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteDoc(doc.id)} className={buttonVariants({ variant: 'destructive'})}>
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    )}
                                </div>
                            ))}
                       </div>
                    ) : (
                         <div className="text-center py-16 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <p>No legal documents found.</p>
                            {userData?.role === 'admin' && <p>Click "Add New Document" to create your first one.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
            <AddLegalDocDialog
                key={editingDoc ? editingDoc.id : 'new'}
                open={isAddOpen} 
                onOpenChange={setIsAddOpen}
                tenantId={userData?.tenantId}
                docToEdit={editingDoc}
            />
        </div>
    );
}
