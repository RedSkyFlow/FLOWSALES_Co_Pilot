
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
}

/**
 * Called when a new user signs up.
 * Creates a document for them in the `users` collection.
 * If they are the first user, they are assigned the 'admin' role
 * and a new tenant is created for them.
 * Subsequent users are assigned the 'sales_agent' role within the first tenant.
 *
 * NOTE: This is a simplified multi-tenancy model for demonstration.
 * A production system would have a more robust tenant invitation system.
 *
 * @param user The user data from Firebase Auth.
 */
export async function onUserCreate(user: UserData) {
    if (!user.uid || !user.email) {
        throw new Error('User ID and email are required.');
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // Prevent overwriting existing user data
    if (userSnap.exists()) {
        console.warn(`User document for ${user.uid} already exists.`);
        return;
    }

    // Simplified tenant logic:
    // In a real app, you would have an invitation system.
    // Here, we'll assign users to a default tenant.
    const tenantId = 'tenant-001';
    const role = 'admin'; // For demo purposes, make first user admin

    try {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: null,
            role: role,
            tenantId: tenantId
        });

        // Ensure the tenant document exists (optional, but good practice)
        const tenantRef = doc(db, 'tenants', tenantId);
        const tenantSnap = await getDoc(tenantRef);
        if (!tenantSnap.exists()) {
             await setDoc(tenantRef, {
                companyName: `${user.displayName}'s Company`,
                subscriptionStatus: 'active',
                // Add other tenant fields as needed
            });
        }

    } catch (error) {
        console.error("Error creating user document: ", error);
        throw new Error('Could not initialize user data in database.');
    }
}
