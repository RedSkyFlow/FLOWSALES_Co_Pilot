
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { MainLayout, useAppData } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Users, Package, FileText, Loader2, ArrowRight } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ProposalTemplate, User } from "@/lib/types";
import Link from 'next/link';

// A map to dynamically render icons based on the string from mock data
const iconMap: Record<string, React.FC<LucideProps>> = {
    Users: Users,
    Package: Package,
    FileText: FileText,
};

export default function TemplatesPage() {
    const router = useRouter();
    const [user, loadingAuth] = useAuthState(auth);
    const { templates, loading } = useAppData();
    const [userData, setUserData] = useState<User | null>(null);

     useEffect(() => {
        if (!loadingAuth && user) {
             // In a real app, user data (especially role) would come from a secure source
             // like a custom claim or a user document in Firestore.
             // For now, we mock it based on the logged-in user.
            setUserData({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'admin', // MOCK: Assume anyone logged in is an admin for this view
                tenantId: 'tenant-001' // MOCK: Using hardcoded tenant
            });
        }
    }, [user, loadingAuth]);

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
          {userData?.role === 'admin' && (
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
                    const Icon = iconMap[template.icon] || FileText;
                    return (
                        <Card key={template.id} className="flex flex-col group">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-primary">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        {template.name}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>{template.description}</CardDescription>
                            </CardContent>
                            <CardFooter>
                                 <Button variant="secondary" disabled={userData?.role !== 'admin'} className="w-full">
                                     Manage Template <ArrowRight className="ml-2 h-4 w-4"/>
                                 </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
                 {templates.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground col-span-full">
                        <p className="mb-2">No proposal templates found.</p>
                        {userData?.role === 'admin' && <p>Click "Create New Template" to get started.</p>}
                    </div>
                 )}
            </div>
        )}

      </div>
    </MainLayout>
  );
}

    
