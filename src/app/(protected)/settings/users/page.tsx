
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, MoreHorizontal } from "lucide-react";
import { Badge } from '@/components/ui/badge';

function getInitials(name: string | null) {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}


export default function UserManagementPage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [team, setTeam] = useState<User[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(true);

    useEffect(() => {
        if (loadingAuth || !user) {
            if (!loadingAuth) setLoadingTeam(false);
            return;
        }

        // In a real app, the user's tenantId would be part of their auth token claims.
        // For now, we'll use a hardcoded tenant ID.
        const tenantId = 'tenant-001';

        setLoadingTeam(true);
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where("tenantId", "==", tenantId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const teamData = querySnapshot.docs.map(doc => doc.data() as User);
            setTeam(teamData);
            setLoadingTeam(false);
        }, (error) => {
            console.error("Error fetching team members: ", error);
            setLoadingTeam(false);
        });

        return () => unsubscribe();
    }, [user, loadingAuth]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold">User Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Invite and manage your team members.
                    </p>
                </div>
                <Button
                    className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
                    disabled // Will be enabled when invite functionality is added
                >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Invite User
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Team</CardTitle>
                    <CardDescription>A list of all users in your organization.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingAuth || loadingTeam ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team.length > 0 ? (
                                    team.map((member) => (
                                        <TableRow key={member.uid}>
                                            <TableCell className="font-medium flex items-center gap-3">
                                                 <Avatar>
                                                    <AvatarImage src={member.photoURL || undefined} />
                                                    <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                                                </Avatar>
                                                {member.displayName || 'Unnamed User'}
                                            </TableCell>
                                            <TableCell>{member.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{member.role.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" disabled>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No team members found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
