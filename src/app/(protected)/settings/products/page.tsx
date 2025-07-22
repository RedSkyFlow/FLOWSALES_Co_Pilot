
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Product, User } from '@/lib/types';
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, MoreHorizontal, Copy, Trash2, Pencil, Upload } from "lucide-react";
import { AddProductDialog } from '@/components/add-product-dialog';
import { BulkAddProductsDialog } from '@/components/bulk-add-products-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteProduct, duplicateProduct } from '@/app/settings/products/actions';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
    const { toast } = useToast();
    const [user, loadingAuth] = useAuthState(auth);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [userData, setUserData] = useState<User | null>(null);

    useEffect(() => {
        if (loadingAuth || !user) {
            if (!loadingAuth) setLoadingProducts(false);
            return;
        }

        // A real app would fetch user role from a secure source
        // For now, we assume the user object will have tenantId and role
        const tenantId = 'tenant-001'; // TODO: Replace with dynamic user.tenantId
        setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'admin', // MOCK: Assume admin for settings pages
            tenantId: tenantId,
        })

        if (!tenantId) {
            setLoadingProducts(false);
            return;
        }

        setLoadingProducts(true);
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


        return () => unsubscribe();
    }, [user, loadingAuth]);
    
    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsAddDialogOpen(true);
    };

    const handleAddNewProduct = () => {
        setEditingProduct(null);
        setIsAddDialogOpen(true);
    }
    
    const handleDeleteProduct = async (productId: string) => {
        if (!userData?.tenantId) return;
        try {
            await deleteProduct(userData.tenantId, productId);
            toast({
                title: 'Product Deleted',
                description: 'The product has been successfully deleted.',
            });
        } catch (error) {
             toast({
                title: 'Error',
                description: 'Failed to delete product. Please try again.',
                variant: 'destructive',
            });
        }
    }
    
    const handleDuplicateProduct = async (productId: string) => {
        if (!userData?.tenantId) return;
        try {
            const newProductId = await duplicateProduct(userData.tenantId, productId);
            const newProduct = products.find(p => p.id === productId);
             toast({
                title: 'Product Duplicated',
                description: `A copy of "${newProduct?.name}" has been created.`,
            });
             const duplicatedProductWithId = { ...newProduct, id: newProductId, name: `${newProduct?.name} (Copy)` } as Product;
             handleEditProduct(duplicatedProductWithId);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to duplicate product. Please try again.',
                variant: 'destructive',
            });
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold">Product Catalog</h1>
                    <p className="text-muted-foreground mt-1">
                        Add, view, and manage the products and services you offer.
                    </p>
                </div>
                {userData?.role === 'admin' && (
                    <div className="flex gap-2">
                         <Button
                            variant="outline"
                            className="font-semibold rounded-lg px-4 py-2 flex items-center gap-2"
                            onClick={() => setIsBulkAddDialogOpen(true)}
                        >
                            <Upload className="mr-2 h-5 w-5" />
                            Bulk Add Products
                        </Button>
                        <Button
                            className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
                            onClick={handleAddNewProduct}
                        >
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add New Product
                        </Button>
                    </div>
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
                                    <TableHead className="text-right">Actions</TableHead>
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
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDuplicateProduct(product.id)}>
                                                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
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
                                                                This action cannot be undone. This will permanently delete the product "{product.name}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className={buttonVariants({ variant: 'destructive'})}>
                                                                Continue
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No products found. Add your first product to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AddProductDialog 
                key={editingProduct ? editingProduct.id : 'new'}
                open={isAddDialogOpen} 
                onOpenChange={setIsAddDialogOpen}
                productToEdit={editingProduct}
                tenantId={userData?.tenantId} 
            />
            <BulkAddProductsDialog
                open={isBulkAddDialogOpen}
                onOpenChange={setIsBulkAddDialogOpen}
                tenantId={userData?.tenantId}
            />
        </div>
    );
}
