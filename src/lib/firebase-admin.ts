
import * as admin from 'firebase-admin';

// This file is for server-side use ONLY.
// It uses a service account to gain admin privileges to Firebase services.

let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;

try {
    if (!admin.apps.length) {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        
        if (serviceAccountKey) {
            const serviceAccount = JSON.parse(serviceAccountKey);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK not initialized.");
        }
    }

    if (admin.apps.length > 0) {
        adminAuth = admin.auth();
        adminDb = admin.firestore();
    } else {
        // Provide dummy objects or handle the case where admin is not initialized
        // to prevent downstream errors if other modules expect these exports.
        // @ts-ignore
        adminAuth = {};
        // @ts-ignore
        adminDb = {};
    }

} catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // @ts-ignore
    adminAuth = {};
    // @ts-ignore
    adminDb = {};
}


export { adminAuth, adminDb };
