
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, doc, updateDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { parseProductList } from '@/ai/flows/parse-product-list';
import { generateProductDescription as generateProductDescriptionFlow, type GenerateProductDescriptionInput } from '@/ai/flows/generate-product-description';


interface AddProductInput {
    tenantId: string;
    name: string;
    description: string;
    type: 'product' | 'service' | 'license';
    pricingModel: 'subscription' | 'one-time' | 'per_item';
    basePrice: number;
    tags: string[];
}

export async function addProduct(data: AddProductInput) {
    if (!data.tenantId || !data.name || data.basePrice === undefined) {
        throw new Error('Tenant ID, Name, and Price are required.');
    }

    try {
        const productsCollectionRef = collection(db, 'tenants', data.tenantId, 'products');
        await addDoc(productsCollectionRef, {
            name: data.name,
            description: data.description,
            type: data.type,
            pricingModel: data.pricingModel,
            basePrice: data.basePrice,
            tags: data.tags,
        });
        revalidatePath('/settings/products');
        revalidatePath('/proposals/new'); // To refresh products in wizard
    } catch (error) {
        console.error("Error adding product: ", error);
        throw new Error('Could not create the product. Please try again.');
    }
}


export async function updateProduct(tenantId: string, productId: string, data: Omit<AddProductInput, 'tenantId'>) {
    if (!tenantId || !productId) {
        throw new Error('Tenant ID and Product ID are required.');
    }

    try {
        const productDocRef = doc(db, 'tenants', tenantId, 'products', productId);
        await updateDoc(productDocRef, {
            name: data.name,
            description: data.description,
            type: data.type,
            pricingModel: data.pricingModel,
            basePrice: data.basePrice,
            tags: data.tags,
        });
        revalidatePath('/settings/products');
        revalidatePath('/proposals/new');
    } catch (error) {
        console.error("Error updating product: ", error);
        throw new Error('Could not update the product. Please try again.');
    }
}

export async function deleteProduct(tenantId: string, productId: string) {
    if (!tenantId || !productId) {
        throw new Error('Tenant ID and Product ID are required.');
    }

    try {
        const productDocRef = doc(db, 'tenants', tenantId, 'products', productId);
        await deleteDoc(productDocRef);
        revalidatePath('/settings/products');
        revalidatePath('/proposals/new');
    } catch (error) {
        console.error("Error deleting product: ", error);
        throw new Error('Could not delete the product. Please try again.');
    }
}

export async function duplicateProduct(tenantId: string, productId: string): Promise<string> {
    if (!tenantId || !productId) {
        throw new Error('Tenant ID and Product ID are required.');
    }
    try {
        const productDocRef = doc(db, 'tenants', tenantId, 'products', productId);
        const productSnap = await getDoc(productDocRef);

        if (!productSnap.exists()) {
            throw new Error('Product not found.');
        }

        const productData = productSnap.data();
        const newProductData = {
            ...productData,
            name: `${productData.name} (Copy)`,
        };

        const newDocRef = await addDoc(collection(db, 'tenants', tenantId, 'products'), newProductData);
        revalidatePath('/settings/products');
        revalidatePath('/proposals/new');
        return newDocRef.id;
    } catch (error) {
        console.error("Error duplicating product: ", error);
        throw new Error('Could not duplicate the product. Please try again.');
    }
}


export async function bulkAddProducts(tenantId: string, productList: string): Promise<number> {
    if (!tenantId || !productList) {
        throw new Error('Tenant ID and product list are required.');
    }

    try {
        const { products } = await parseProductList(productList);
        if (!products || products.length === 0) {
            return 0;
        }
        
        const productsCollectionRef = collection(db, 'tenants', tenantId, 'products');
        const batch = writeBatch(db);

        products.forEach(product => {
            const docRef = doc(productsCollectionRef); // Create a new doc with a new ID
            batch.set(docRef, {
                ...product,
                // Set default values for fields not provided by AI
                type: product.type || 'product',
                pricingModel: product.pricingModel || 'one-time',
                tags: product.tags || [],
            });
        });

        await batch.commit();

        revalidatePath('/settings/products');
        revalidatePath('/proposals/new');
        
        return products.length;
    } catch (error) {
        console.error("Error bulk adding products: ", error);
        throw new Error("Could not add products. Please check the format or try again.");
    }
}

export async function generateProductDescription(input: GenerateProductDescriptionInput) {
    try {
        const { description } = await generateProductDescriptionFlow(input);
        return description;
    } catch (error) {
        console.error("Error generating product description:", error);
        throw new Error("Failed to generate product description.");
    }
}
