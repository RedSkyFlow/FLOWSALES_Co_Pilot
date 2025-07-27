
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Users, Package, FileText, Loader2, ArrowRight, Copy } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ProposalTemplate, User } from "@/lib/types";
import Link from 'next/link';
import { duplicateTemplate } from './actions';
import { useToast } from '@/hooks/use-toast';

// A map to dynamically render icons based on the string from mock data
const iconMap: Record<ProposalTemplate['icon'], React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>> = {
    Users: Users,
    Package: Package,
    FileText: FileText,
};

export default function TemplatesPage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [userData, setUserData] = useState<User | null>(null);
    const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (loadingAuth || !user) {
            if (!loadingAuth) setLoading(false);
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const fetchedUserData = docSnap.data() as User;
                setUserData(fetchedUserData);
                
                // Once we have tenantId, fetch templates
                const templatesCollectionRef = collection(db, 'tenants', fetchedUserData.tenantId, 'proposal_templates');
                const q = query(templatesCollectionRef);
                const unsubscribeTemplates = onSnapshot(q, (querySnapshot) => {
                    const templatesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProposalTemplate));
                    setTemplates(templatesData);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching templates: ", error);
                    setLoading(false);
                });
                return () => unsubscribeTemplates();
            } else {
                // Handle case where user doc might not exist yet
                setLoading(false);
            }
        });

        return () => unsubscribeUser();
    }, [user, loadingAuth]);

    const handleDuplicateTemplate = async (templateId: string) => {
        if (!userData) return;
        try {
            await duplicateTemplate(userData.tenantId, templateId);
            toast({ title: 'Template Duplicated', description: 'A copy of the template has been created.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Could not duplicate template.', variant: 'destructive' });
        }
    };

    const isAdmin = userData?.role === 'admin';

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Proposal Templates</h1>
            <p className="text-muted-foreground mt-1">
              Create, view, and manage your reusable proposal templates.
            </p>
          </div>
          {isAdmin && (
            <Button
                asChild
                className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
            >
                <Link href="/templates/new">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create New Template
                </Link>
            </Button>
          )}
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates.map((template) => {
                    const Icon = iconMap[template.icon];
                    return (
                        <Card key={template.id} className="flex flex-col group">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-primary">
                                            {Icon ? <Icon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                                        </div>
                                        {template.name}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>{template.description}</CardDescription>
                            </CardContent>
                            <CardFooter className="flex items-center gap-2">
                                 <Button variant="outline" disabled={!isAdmin} className="w-full">
                                     Manage <ArrowRight className="ml-2 h-4 w-4"/>
                                 </Button>
                                 <Button 
                                    variant="outline" 
                                    size="icon" 
                                    disabled={!isAdmin} 
                                    onClick={() => handleDuplicateTemplate(template.id)}
                                    aria-label="Duplicate Template"
                                 >
                                    <Copy className="h-4 w-4" />
                                 </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
                 {templates.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground col-span-full">
                        <p>No proposal templates found.</p>
                        {isAdmin && <p>Click "Create New Template" to get started.</p>}
                    </div>
                 )}
            </div>
        )}

      </div>
    </MainLayout>
  );
}
