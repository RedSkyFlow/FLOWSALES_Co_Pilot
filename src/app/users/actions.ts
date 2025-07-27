
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, query, getDocs, limit } from 'firebase/firestore';

interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
}

/**
 * Called when a new user signs up.
 * Creates a document for them in the `users` collection.
 * It also creates a new tenant document with a default subscription tier.
 * In this simplified model, every new user signup creates a new tenant.
 * A production app would use a more robust invitation-based system.
 *
 * @param user The user data from Firebase Auth.
 * @returns The new tenantId created for the user.
 */
export async function onUserCreate(user: UserData): Promise<string> {
    if (!user.uid || !user.email) {
        throw new Error('User ID and email are required.');
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // Prevent overwriting existing user data
    if (userSnap.exists()) {
        console.warn(`User document for ${user.uid} already exists.`);
        // If the user doc exists but has no tenantId, this is a chance to fix it.
        // Otherwise, just return the existing tenantId
        return userSnap.data().tenantId || 'existing-tenant-without-id';
    }

    // Create a new tenant for this user.
    // In a real multi-user-per-tenant system, you'd check for an invitation code here.
    const newTenantRef = doc(collection(db, 'tenants'));
    const tenantId = newTenantRef.id;

    try {
        // Set the user document
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: null,
            role: 'admin', // The first user of a tenant is the admin
            tenantId: tenantId
        });

        // Create the corresponding tenant document with a default subscription
        await setDoc(newTenantRef, {
            companyName: `${user.displayName}'s Company`,
            createdAt: new Date().toISOString(),
            subscription: {
                tier: 'basic', // All new signups start on the basic tier
                status: 'active',
                proposalsGeneratedThisMonth: 0,
                endDate: null,
            }
        });

        return tenantId;

    } catch (error) {
        console.error("Error creating user and tenant documents: ", error);
        throw new Error('Could not initialize user data in database.');
    }
}
