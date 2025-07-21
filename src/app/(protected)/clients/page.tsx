
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Client } from '@/lib/types';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Users } from "lucide-react";
import { AddClientDialog } from '@/components/add-client-dialog';
import { useTour, TourStep } from '@/hooks/use-tour';

const clientsTourSteps: TourStep[] = [
    {
        selector: '[data-tour-id="clients-header"]',
        title: "Client Management",
        content: "This is where you manage all your clients. A well-maintained client list is key to efficient proposal generation."
    },
    {
        selector: '[data-tour-id="add-client-btn"]',
        title: "Add a New Client",
        content: "Click here to add a new client to your portfolio. The details you enter here can be quickly pulled into new proposals."
    },
    {
        selector: '[data-tour-id="clients-table"]',
        title: "Your Client List",
        content: "All your existing clients are listed here. In the future, you'll be able to click on a client to see their history and past proposals."
    },
];

export default function ClientsPage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const { startTour } = useTour();

    useEffect(() => {
        startTour('clients', clientsTourSteps);
    }, [startTour]);

    useEffect(() => {
        if (loadingAuth || !user) {
            if (!loadingAuth) setLoadingClients(false);
            return;
        }

        setLoadingClients(true);
        // NOTE: This uses a hardcoded tenant ID for now.
        const tenantId = 'tenant-001';
        const clientsCollectionRef = collection(db, 'tenants', tenantId, 'clients');
        const q = query(clientsCollectionRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
            setClients(clientsData);
            setLoadingClients(false);
        }, (error) => {
            console.error("Error fetching clients: ", error);
            setLoadingClients(false);
        });

        return () => unsubscribe();
    }, [user, loadingAuth]);
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-tour-id="clients-header">
                <div>
                    <h1 className="text-4xl font-bold">Client Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Add, view, and manage your clients.
                    </p>
                </div>
                <Button
                    className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
                    onClick={() => setIsAddClientOpen(true)}
                    data-tour-id="add-client-btn"
                >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add New Client
                </Button>
            </div>
            
            <Card data-tour-id="clients-table">
                <CardHeader>
                    <CardTitle>Your Clients</CardTitle>
                    <CardDescription>A list of all clients in your portfolio.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingAuth || loadingClients ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Industry</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Contact Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.length > 0 ? (
                                    clients.map((client) => (
                                        <TableRow key={client.id}>
                                            <TableCell className="font-medium">{client.name}</TableCell>
                                            <TableCell>{client.industry}</TableCell>
                                            <TableCell>{client.contactPerson}</TableCell>
                                            <TableCell>{client.contactEmail}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No clients found. Add your first client to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <AddClientDialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen} />
        </div>
    );
}
