
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { ProductRule, User } from '@/lib/types';
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, GitBranch } from "lucide-react";
// We will create this component in the next step
// import { AddRuleDialog } from '@/components/add-rule-dialog';

export default function RulesPage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [rules, setRules] = useState<ProductRule[]>([]);
    const [loadingRules, setLoadingRules] = useState(true);
    const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        if (loadingAuth || !user) {
            if (!loadingAuth) setLoadingRules(false);
            return;
        }

        setLoadingRules(true);
        // This should be dynamically set based on the logged-in user's tenant
        const tenantId = 'tenant-001';
        const rulesCollectionRef = collection(db, 'tenants', tenantId, 'product_rules');
        const q = query(rulesCollectionRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const rulesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductRule));
            setRules(rulesData);
            setLoadingRules(false);
        }, (error) => {
            console.error("Error fetching product rules: ", error);
            setLoadingRules(false);
        });

        // A real app would fetch user role from a secure source
        setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'admin', // MOCK: Assume admin for settings pages
            tenantId: 'tenant-001',
        })

        return () => unsubscribe();
    }, [user, loadingAuth]);
    
    return (
        <MainLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold">Product Rules</h1>
                        <p className="text-muted-foreground mt-1">
                            Define dependencies and conflicts between your products.
                        </p>
                    </div>
                    {userData?.role === 'admin' && (
                        <Button
                            className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
                            onClick={() => setIsAddRuleOpen(true)}
                        >
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add New Rule
                        </Button>
                    )}
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Your Product Rules</CardTitle>
                        <CardDescription>A list of all dependencies for this tenant's products.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingAuth || loadingRules ? (
                            <div className="flex justify-center items-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                             <div className="text-center py-16 text-muted-foreground">
                                <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p>No product rules found.</p>
                                {userData?.role === 'admin' && <p>Click "Add New Rule" to create your first dependency.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            {/* <AddRuleDialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen} /> */}
        </MainLayout>
    );
}
