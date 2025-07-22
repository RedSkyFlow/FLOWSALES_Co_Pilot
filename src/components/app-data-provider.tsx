
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, limit, where } from 'firebase/firestore';
import type { User as AuthUser } from 'firebase/auth';
import type { User as FirestoreUser, BrandingSettings, Tenant } from '@/lib/types';

interface AppDataContextType {
  user: AuthUser | null | undefined;
  userData: FirestoreUser | null | undefined;
  tenantData: Tenant | null | undefined;
  brandingSettings: BrandingSettings | null | undefined;
  loading: boolean;
  userRole: FirestoreUser['role'] | null;
  tenantId: string | null;
}

const AppDataContext = createContext<AppDataDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [user, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [tenantData, setTenantData] = useState<Tenant | null>(null);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  const [userRole, setUserRole] = useState<FirestoreUser['role'] | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaimsAndData = async () => {
        if (loadingAuth) {
            setLoadingData(true);
            return;
        }
        
        if (!user) {
            setUserData(null);
            setBrandingSettings(null);
            setTenantData(null);
            setUserRole(null);
            setTenantId(null);
            setLoadingData(false);
            return;
        }

        // Force a refresh of the token to get the latest custom claims
        const idTokenResult = await user.getIdTokenResult(true);
        const claims = idTokenResult.claims;
        const currentRole = (claims.role as FirestoreUser['role']) || null;
        const currentTenantId = (claims.tenantId as string) || null;
        
        setUserRole(currentRole);
        setTenantId(currentTenantId);

        // Unsubscribe listeners array
        const unsubscribers: (() => void)[] = [];

        // Fetch user document
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            setUserData(doc.exists() ? (doc.data() as FirestoreUser) : null);
        }, (error) => console.error("Error fetching user data:", error));
        unsubscribers.push(unsubscribeUser);
        
        if (currentTenantId) {
            // Fetch tenant document
            const tenantDocRef = doc(db, 'tenants', currentTenantId);
            const unsubscribeTenant = onSnapshot(tenantDocRef, (doc) => {
                setTenantData(doc.exists() ? (doc.data() as Tenant) : null);
            }, (error) => console.error("Error fetching tenant data:", error));
            unsubscribers.push(unsubscribeTenant);

            // Fetch branding settings
            const settingsRef = collection(db, 'tenants', currentTenantId, 'settings');
            const q = query(settingsRef, where('id', '==', 'branding'), limit(1));
            const unsubscribeSettings = onSnapshot(q, (snapshot) => {
                 setBrandingSettings(snapshot.empty ? null : snapshot.docs[0].data() as BrandingSettings);
            }, (error) => console.error("Error fetching branding settings:", error));
            unsubscribers.push(unsubscribeSettings);
        } else {
            setTenantData(null);
            setBrandingSettings(null);
        }
        setLoadingData(false);

        // Cleanup function
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    };
    
    fetchClaimsAndData();

  }, [user, loadingAuth]);

  const value = {
    user,
    userData,
    tenantData,
    brandingSettings,
    loading: loadingAuth || loadingData,
    userRole,
    tenantId,
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
