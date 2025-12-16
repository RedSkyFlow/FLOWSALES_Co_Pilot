import { onFlow } from '@genkit-ai/firebase/functions';
import { defineFlow } from '@genkit-ai/core';
import { object, string } from 'zod';
import { User, UserRecord } from 'firebase-functions/v1/auth';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * A Genkit flow that runs automatically when a new user is created in Firebase Auth.
 * It creates a new tenant for the user and sets up their user document.
 */
export const onUserCreateFlow = onFlow(
  {
    name: 'onUserCreateFlow',
    // This specifies the Firebase Auth event that triggers this flow.
    trigger: {
        provider: 'firebase.auth.user',
        event: 'create',
    },
    // The input schema for this flow is automatically provided by the trigger.
    // The output schema is a promise of a string (the new tenant ID).
    outputSchema: string().promise(),
  },
  async (user: UserRecord): Promise<string> => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const existingData = userSnap.data() as User;
      console.log(`User ${user.uid} already exists with tenant ${existingData.tenantId}.`);
      return existingData.tenantId;
    }

    // Step 1: Create a new tenant document for the new user.
    const newTenantRef = await addDoc(collection(db, 'tenants'), {
      companyName: `${user.displayName || 'New User'}'s Workspace`,
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'basic',
        status: 'trialing',
      },
    });
    const tenantId = newTenantRef.id;
    console.log(`Created new tenant ${tenantId} for user ${user.uid}.`);

    // Step 2: Create the user's document in Firestore and link it to the tenant.
    const newUser: User = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      role: 'admin',
      tenantId: tenantId,
    };
    await setDoc(userRef, newUser);

    return tenantId;
  }
);
