'use server';

import { db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

const ruleSchema = z.object({
  type: z.string(),
  productIds: z.array(z.string()),
});

const approvalSchema = z.object({
  products: z.array(productSchema),
  rules: z.array(ruleSchema),
  tenantId: z.string(),
});

export async function approveConfiguration(data: z.infer<typeof approvalSchema>) {
  const validation = approvalSchema.safeParse(data);

  if (!validation.success) {
    return { error: 'Invalid data format.' };
  }

  const { products, rules, tenantId } = validation.data;
  const batch = writeBatch(db);

  try {
    // Add products to a 'products' subcollection in the tenant document
    const productsCollectionRef = collection(db, 'tenants', tenantId, 'products');
    products.forEach((product) => {
      const productRef = doc(productsCollectionRef, product.id);
      batch.set(productRef, product);
    });

    // For simplicity, we'll store all rules in a single document.
    // A more complex app might store them in their own subcollection.
    const rulesDocRef = doc(db, 'tenants', tenantId, 'configs', 'rules');
    batch.set(rulesDocRef, { rules });

    await batch.commit();

    // Revalidate the path to ensure the UI updates with the new data
    revalidatePath(`/settings/products`);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving configuration:', error);
    return { error: 'Failed to save configuration.' };
  }
}
