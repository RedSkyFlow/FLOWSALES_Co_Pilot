
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Client, User } from '@/lib/types';
import { MainLayout } from "@/components/main-layout";
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
import { Loader2, PlusCircle } from "lucide-react";
import { AddClientDialog } from '@/components/add-client-dialog';
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [userData, setUserData] = useState<User | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (loadingAuth || !user) {
            if (!loadingAuth) setLoadingData(false);
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const fetchedUserData = docSnap.data() as User;
                setUserData(fetchedUserData);
                
                if (fetchedUserData.tenantId) {
                    const clientsCollectionRef = collection(db, 'tenants', fetchedUserData.tenantId, 'clients');
                    const q = query(clientsCollectionRef);
                    const unsubscribeClients = onSnapshot(q, (querySnapshot) => {
                        const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
                        setClients(clientsData);
                        setLoadingData(false);
                    }, (error) => {
                        console.error("Error fetching clients: ", error);
                        setLoadingData(false);
                    });
                    return () => unsubscribeClients();
                } else {
                    setLoadingData(false);
                }
            } else {
                setLoadingData(false);
            }
        });

        return () => unsubscribeUser();
    }, [user, loadingAuth]);
    
    return (
        <MainLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold">Client Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Add, view, and manage your clients.
                        </p>
                    </div>
                    <Button
                        className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
                        onClick={() => setIsAddClientOpen(true)}
                    >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add New Client
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Your Clients</CardTitle>
                        <CardDescription>A list of all clients in your portfolio.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingData ? (
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
            </div>
            {userData && (
                 <AddClientDialog 
                    open={isAddClientOpen} 
                    onOpenChange={setIsAddClientOpen} 
                    tenantId={userData.tenantId} 
                />
            )}
        </MainLayout>
    );
}
