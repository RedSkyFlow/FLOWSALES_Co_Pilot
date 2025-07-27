
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot, doc, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
import { Loader2, PlusCircle, Copy, Edit, Wand2 } from "lucide-react";
import type { Product, User } from '@/lib/types';
import { ProductEditDialog } from '@/components/product-edit-dialog';
import { Badge } from '@/components/ui/badge';
import { duplicateProduct } from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from 'next/link';

export default function ProductsPage() {
    const [user, loadingAuth] = useAuthState(auth);
    const [userData, setUserData] = useState<User | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [unverifiedCount, setUnverifiedCount] = useState(0);
    const [loadingData, setLoadingData] = useState(true);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
                    const productsCollectionRef = collection(db, 'tenants', fetchedUserData.tenantId, 'products');
                    
                    // Query for all products
                    const allProductsQuery = query(productsCollectionRef);
                    const unsubscribeAll = onSnapshot(allProductsQuery, (querySnapshot) => {
                        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                        setProducts(productsData);
                        setLoadingData(false);
                    }, (error) => {
                        console.error("Error fetching products: ", error);
                        toast({ title: 'Error', description: 'Could not fetch products.', variant: 'destructive' });
                        setLoadingData(false);
                    });

                    // Query for unverified products count
                    const unverifiedQuery = query(productsCollectionRef, where("status", "==", "unverified"));
                    const unsubscribeUnverified = onSnapshot(unverifiedQuery, (querySnapshot) => {
                        setUnverifiedCount(querySnapshot.size);
                    });

                    return () => {
                        unsubscribeAll();
                        unsubscribeUnverified();
                    };
                } else {
                     setLoadingData(false);
                     toast({ title: 'Error', description: 'No tenant ID found for user.', variant: 'destructive' });
                }
            } else {
                 toast({ title: 'Error', description: 'User data not found.', variant: 'destructive' });
                setLoadingData(false);
            }
        }, (error) => {
            console.error("Error fetching user data: ", error);
            toast({ title: 'Error', description: 'Could not fetch user data.', variant: 'destructive' });
            setLoadingData(false);
        });

        return () => unsubscribeUser();
    }, [user, loadingAuth, toast]);

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsProductDialogOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsProductDialogOpen(true);
    };
    
    const handleDuplicateProduct = async (productId: string) => {
        if (!userData?.tenantId) return;
        try {
            await duplicateProduct(userData.tenantId, productId);
            toast({ title: 'Product Duplicated', description: 'A copy of the product has been created.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Could not duplicate product.', variant: 'destructive' });
        }
    };
    
    const isAdmin = userData?.role === 'admin';

    return (
        <MainLayout>
             <TooltipProvider>
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold">Product Catalog</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage the products and services your team can sell.
                            </p>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-2">
                                {unverifiedCount > 0 && (
                                    <Button asChild variant="outline">
                                        <Link href="/settings/products/verify" className="flex items-center">
                                            <Wand2 className="mr-2 h-5 w-5 text-impact" />
                                            Verify {unverifiedCount} Imported Products
                                        </Link>
                                    </Button>
                                )}
                                <Button
                                    className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
                                    onClick={handleAddProduct}
                                >
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    Add New Product
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Products & Services</CardTitle>
                            <CardDescription>The complete list of items available for proposals.</CardDescription>
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
                                            <TableHead>Status</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Pricing Model</TableHead>
                                            <TableHead className="text-right">Base Price</TableHead>
                                            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.length > 0 ? (
                                            products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        {product.status === 'unverified' ? (
                                                            <Badge variant="destructive">Unverified</Badge>
                                                        ) : (
                                                            <Badge variant="success">Verified</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell><Badge variant="outline" className="capitalize">{product.type}</Badge></TableCell>
                                                    <TableCell className="capitalize">{product.pricingModel.replace('_', '-')}</TableCell>
                                                    <TableCell className="text-right font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.basePrice)}</TableCell>
                                                    {isAdmin && (
                                                        <TableCell className="text-right space-x-2">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" onClick={() => handleDuplicateProduct(product.id)}>
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Duplicate Product</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit Product</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
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
                {userData?.tenantId && (
                    <ProductEditDialog 
                        open={isProductDialogOpen} 
                        onOpenChange={setIsProductDialogOpen}
                        tenantId={userData.tenantId}
                        product={selectedProduct}
                    />
                )}
            </TooltipProvider>
        </MainLayout>
    );
}
