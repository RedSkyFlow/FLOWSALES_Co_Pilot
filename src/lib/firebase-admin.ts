
import * as admin from 'firebase-admin';

// This file is for server-side use ONLY.
// It uses a service account to gain admin privileges to Firebase services.

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
