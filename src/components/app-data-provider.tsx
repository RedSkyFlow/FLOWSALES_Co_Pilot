
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, limit } from 'firebase/firestore';
import type { User as AuthUser } from 'firebase/auth';
import type { User as FirestoreUser, BrandingSettings } from '@/lib/types';

interface AppDataContextType {
  user: AuthUser | null | undefined;
  userData: FirestoreUser | null | undefined;
  brandingSettings: BrandingSettings | null | undefined;
  loading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [user, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loadingAuth) {
      setLoadingData(true);
      return;
    }
    
    if (!user) {
      setUserData(null);
      setBrandingSettings(null);
      setLoadingData(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const firestoreUser = doc.data() as FirestoreUser;
        setUserData(firestoreUser);
        
        // Now fetch branding settings based on the user's tenantId
        if (firestoreUser.tenantId) {
          const settingsRef = collection(db, 'tenants', firestoreUser.tenantId, 'settings');
          const q = query(settingsRef, where('id', '==', 'branding'), limit(1));
          const unsubscribeSettings = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              setBrandingSettings(snapshot.docs[0].data() as BrandingSettings);
            } else {
              setBrandingSettings(null);
            }
             setLoadingData(false);
          }, (error) => {
              console.error("Error fetching branding settings:", error);
              setBrandingSettings(null);
              setLoadingData(false);
          });
          return () => unsubscribeSettings();
        }

      } else {
        setUserData(null);
        setBrandingSettings(null);
        setLoadingData(false);
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
      setUserData(null);
      setLoadingData(false);
    });

    return () => unsubscribeUser();
  }, [user, loadingAuth]);

  const value = {
    user,
    userData,
    brandingSettings,
    loading: loadingAuth || loadingData,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppDataProvider');
  }
  return context;
}
