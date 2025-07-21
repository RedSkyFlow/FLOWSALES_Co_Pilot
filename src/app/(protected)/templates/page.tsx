
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAppData } from '@/components/app-data-provider';
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Users, Package, FileText, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ProposalTemplate, User } from "@/lib/types";
import Link from 'next/link';
import { useTour, TourStep } from '@/hooks/use-tour';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteTemplate } from '@/app/templates/actions';

const iconMap: Record<string, React.FC<LucideProps>> = {
    Users: Users,
    Package: Package,
    FileText: FileText,
};

const templatesTourSteps: TourStep[] = [
    {
        selector: '[data-tour-id="templates-header"]',
        title: "Proposal Templates",
        content: "Templates are the starting point for all your proposals. They define the structure and boilerplate content, saving you time."
    },
    {
        selector: '[data-tour-id="create-template-btn"]',
        title: "Create a New Template",
        content: "Click here to design a new template. You can define sections, default content, and an icon to represent it."
    },
    {
        selector: '[data-tour-id="template-card"]',
        title: "Template Card",
        content: "Each card represents a template you can use in the proposal wizard. Use the menu to manage them."
    },
];

export default function TemplatesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, loadingAuth] = useAuthState(auth);
    const { templates, loading } = useAppData();
    const [userData, setUserData] = useState<User | null>(null);
    const { startTour } = useTour();

     useEffect(() => {
        startTour('templates', templatesTourSteps);
     }, [startTour]);

     useEffect(() => {
        if (!loadingAuth && user) {
            setUserData({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'admin', 
                tenantId: 'tenant-001'
            });
        }
    }, [user, loadingAuth]);
    
    const handleDeleteTemplate = async (templateId: string) => {
        try {
            await deleteTemplate('tenant-001', templateId);
            toast({
                title: 'Template Deleted',
                description: 'The template has been successfully deleted.',
            });
        } catch (error) {
             toast({
                title: 'Error',
                description: 'Failed to delete template. Please try again.',
                variant: 'destructive',
            });
        }
    }


  return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-tour-id="templates-header">
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
                data-tour-id="create-template-btn"
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
                {templates.map((template, index) => {
                    const Icon = iconMap[template.icon] || FileText;
                    return (
                        <Card key={template.id} className="flex flex-col group" data-tour-id={index === 0 ? "template-card" : undefined}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-primary">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        {template.name}
                                    </CardTitle>
                                    {userData?.role === 'admin' && (
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem disabled>Edit</DropdownMenuItem>
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
                                                    This action cannot be undone. This will permanently delete the template "{template.name}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)} className={buttonVariants({ variant: 'destructive'})}>
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>{template.description}</CardDescription>
                            </CardContent>
                            <CardFooter>
                                 <p className="text-xs text-muted-foreground w-full">{template.sections.length} sections</p>
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
  );
}
