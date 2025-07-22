
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { ProductRule, User, Product } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, GitBranch } from "lucide-react";
import { AddRuleDialog } from '@/components/add-rule-dialog';

export default function RulesPage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [rules, setRules] = useState<ProductRule[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        if (loadingAuth || !user) {
            if (!loadingAuth) setLoadingData(false);
            return;
        }

        // This should be dynamically set based on the logged-in user's tenant
        const tenantId = 'tenant-001';
        
        // A real app would fetch user role from a secure source
        setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'admin', // MOCK: Assume admin for settings pages
            tenantId: tenantId,
        });

        if (!tenantId) {
            setLoadingData(false);
            return;
        }

        setLoadingData(true);
        const rulesCollectionRef = collection(db, 'tenants', tenantId, 'product_rules');
        const rulesQuery = query(rulesCollectionRef);
        const unsubscribeRules = onSnapshot(rulesQuery, (querySnapshot) => {
            const rulesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductRule));
            setRules(rulesData);
        }, (error) => {
            console.error("Error fetching product rules: ", error);
        });

        const productsCollectionRef = collection(db, 'tenants', tenantId, 'products');
        const productsQuery = query(productsCollectionRef);
        const unsubscribeProducts = onSnapshot(productsQuery, (querySnapshot) => {
            const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(productsData);
            setLoadingData(false);
        }, (error) => {
            console.error("Error fetching products: ", error);
            setLoadingData(false);
        });

        return () => {
            unsubscribeRules();
            unsubscribeProducts();
        };
    }, [user, loadingAuth]);

    const getProductName = (productId: string) => {
        return products.find(p => p.id === productId)?.name || 'Unknown Product';
    }
    
    return (
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
                        {loadingData ? (
                            <div className="flex justify-center items-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : rules.length > 0 ? (
                           <div className="space-y-4">
                                {rules.map(rule => (
                                    <div key={rule.id} className="p-4 border rounded-lg bg-muted/20 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <GitBranch className="h-8 w-8 text-primary" />
                                            <div>
                                                <p className="font-semibold">
                                                    IF <span className="text-secondary">{getProductName(rule.primaryProductId)}</span> is selected
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                   THEN <span className="font-bold">{rule.condition.replace('_', ' ')}</span> <span className="text-secondary">{getProductName(rule.relatedProductIds[0])}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">Manage</Button>
                                    </div>
                                ))}
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
                <AddRuleDialog 
                    open={isAddRuleOpen} 
                    onOpenChange={setIsAddRuleOpen} 
                    products={products} 
                    tenantId={userData?.tenantId} 
                />
            </div>
    );
}
