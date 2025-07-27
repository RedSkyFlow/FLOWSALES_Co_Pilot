
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, onSnapshot, doc, getDocs, limit, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Product, User } from '@/lib/types';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Check, X, ArrowRight } from 'lucide-react';
import { proposeProductRules } from '@/ai/flows/propose-product-rules';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function VerifyProductsPage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [userData, setUserData] = useState<User | null>(null);
    const [unverifiedProducts, setUnverifiedProducts] = useState<Product[]>([]);
    const [totalUnverified, setTotalUnverified] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadingData, setLoadingData] = useState(true);
    const [loadingRule, setLoadingRule] = useState(false);
    const [proposedRule, setProposedRule] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const currentProduct = unverifiedProducts[currentIndex];

    // Get User Data
    useEffect(() => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        const unsub = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data() as User);
            }
        });
        return () => unsub();
    }, [user]);

    // Get all unverified products once
    useEffect(() => {
        if (!userData?.tenantId) return;

        const getUnverifiedProducts = async () => {
            setLoadingData(true);
            const productsRef = collection(db, 'tenants', userData.tenantId, 'products');
            const q = query(productsRef, where('status', '==', 'unverified'));
            const querySnapshot = await getDocs(q);
            const products = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
            setUnverifiedProducts(products);
            setTotalUnverified(products.length);
            setLoadingData(false);
        };
        getUnverifiedProducts();

    }, [userData?.tenantId]);

    // Propose rule for the current product
    useEffect(() => {
        if (!currentProduct) return;

        const getRule = async () => {
            setLoadingRule(true);
            setProposedRule(null);
            try {
                const result = await proposeProductRules({
                    productName: currentProduct.name,
                    productDescription: currentProduct.description,
                });
                setProposedRule(result.proposedRule);
            } catch (error) {
                console.error("Error proposing rule:", error);
                setProposedRule("Could not generate a rule for this product.");
            } finally {
                setLoadingRule(false);
            }
        };

        getRule();

    }, [currentProduct]);

    const handleVerification = async (product: Product, ruleToSave?: string | null) => {
        if (!userData?.tenantId) return;
        
        try {
            const productRef = doc(db, 'tenants', userData.tenantId, 'products', product.id);
            const updateData: Partial<Product> & { rules?: any } = { status: 'verified' };

            // In a real app, we would save the rule to a `rules` collection.
            // For now, we are just noting it. A toast will simulate saving.
            if (ruleToSave) {
                 toast({ title: 'Rule "Saved"', description: `Rule for ${product.name} noted.`});
            }

            await writeBatch(db).update(productRef, updateData).commit();

            if (currentIndex < unverifiedProducts.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                toast({ title: "Verification Complete!", description: "All products have been verified." });
                router.push('/settings/products');
            }
        } catch (error) {
            console.error("Error verifying product:", error);
            toast({ title: "Error", description: "Could not verify product.", variant: "destructive" });
        }
    };


    if (loadingData || loadingAuth) {
        return <MainLayout><div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></MainLayout>
    }

    if (!loadingData && unverifiedProducts.length === 0) {
        return (
            <MainLayout>
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">No Products to Verify</h1>
                    <p className="text-muted-foreground">It looks like all your products have been verified.</p>
                    <Button onClick={() => router.push('/settings/products')}>Back to Product Catalog</Button>
                </div>
            </MainLayout>
        )
    }

    const progress = totalUnverified > 0 ? ((currentIndex + 1) / totalUnverified) * 100 : 0;

    return (
        <MainLayout>
             {currentProduct ? (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">AI-Powered Product Verification</h1>
                        <p className="text-muted-foreground">Review the AI's suggestions for each of your imported products.</p>
                    </div>
                    
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">Verifying product {currentIndex + 1} of {totalUnverified}</p>

                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                            <CardDescription>{currentProduct.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{currentProduct.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Wand2 className="text-primary" /> AI Rule Suggestion</CardTitle>
                            <CardDescription>Based on the product's name and description, the AI proposes the following rule. You can accept this rule or skip it.</CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[80px] flex items-center justify-center">
                            {loadingRule ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <p className="text-center font-medium">{proposedRule}</p>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => handleVerification(currentProduct)}>
                                <X className="mr-2 h-4 w-4" /> Skip Rule
                            </Button>
                            <Button onClick={() => handleVerification(currentProduct, proposedRule)} disabled={!proposedRule || loadingRule}>
                                <Check className="mr-2 h-4 w-4" /> Accept Rule & Continue
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={() => handleVerification(currentProduct)}>
                            Skip for now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
             ) : (
                 <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
             )}
        </MainLayout>
    )
}
