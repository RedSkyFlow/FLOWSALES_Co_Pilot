
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Product, User } from '@/lib/types';
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
import { AddProductDialog } from '@/components/add-product-dialog';

export default function ProductsPage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        if (loadingAuth || !user) {
            if (!loadingAuth) setLoadingProducts(false);
            return;
        }

        setLoadingProducts(true);
        // NOTE: This uses a hardcoded tenant ID for now.
        const tenantId = 'tenant-001';
        const productsCollectionRef = collection(db, 'tenants', tenantId, 'products');
        const q = query(productsCollectionRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(productsData);
            setLoadingProducts(false);
        }, (error) => {
            console.error("Error fetching products: ", error);
            setLoadingProducts(false);
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
                        <h1 className="text-4xl font-bold">Product Catalog</h1>
                        <p className="text-muted-foreground mt-1">
                            Add, view, and manage the products and services you offer.
                        </p>
                    </div>
                    {userData?.role === 'admin' && (
                        <Button
                            className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
                            onClick={() => setIsAddProductOpen(true)}
                        >
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add New Product
                        </Button>
                    )}
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Your Products</CardTitle>
                        <CardDescription>A list of all products and services for this tenant.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingAuth || loadingProducts ? (
                            <div className="flex justify-center items-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Base Price</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell className="capitalize">{product.type}</TableCell>
                                                <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.basePrice)}</TableCell>
                                                <TableCell>{product.description}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No products found. Add your first product to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            <AddProductDialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen} />
        </MainLayout>
    );
}
