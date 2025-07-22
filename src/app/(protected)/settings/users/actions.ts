
'use server';

import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

interface InviteUserInput {
    email: string;
    role: 'admin' | 'sales_agent';
    tenantId: string;
}

export async function inviteUser(data: InviteUserInput) {
    if (!data.email || !data.role || !data.tenantId) {
        throw new Error('Email, role, and tenant ID are required.');
    }

    try {
        // Step 1: Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email: data.email,
            emailVerified: false, // User will verify by setting password
            disabled: false,
        });

        // Step 2: Set custom claims for role-based access control
        await adminAuth.setCustomUserClaims(userRecord.uid, {
            role: data.role,
            tenantId: data.tenantId,
        });

        // Step 3: Create user document in Firestore
        const userDocRef = adminDb.collection('users').doc(userRecord.uid);
        await userDocRef.set({
            uid: userRecord.uid,
            email: data.email,
            role: data.role,
            tenantId: data.tenantId,
            displayName: data.email.split('@')[0], // Default display name
            photoURL: null,
        });
        
        // Step 4: Send a password reset email, which serves as a welcome/setup email
        const passwordResetLink = await adminAuth.generatePasswordResetLink(data.email);

        // TODO: Replace with a proper email sending service (e.g., SendGrid, Mailgun)
        // For now, we just log the link. In a real app, this would be an email.
        console.log(`
            New user invited!
            Email: ${data.email}
            Role: ${data.role}
            Tenant: ${data.tenantId}
            Setup Link: ${passwordResetLink}
        `);

        revalidatePath('/settings/users');

        return { success: true, message: `Invitation sent to ${data.email}.` };

    } catch (error: any) {
        console.error("Error inviting user:", error);
        
        let errorMessage = 'Could not invite the user. Please try again.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'A user with this email address already exists.';
        }
        
        throw new Error(errorMessage);
    }
}
