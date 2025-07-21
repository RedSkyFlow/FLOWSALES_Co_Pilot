
'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import type { Client, Product, ProductRule, ProposalTemplate } from '@/lib/types';

interface AppDataContextType {
  templates: ProposalTemplate[];
  clients: Client[];
  products: Product[];
  rules: ProductRule[];
  loading: boolean;
}

const AppDataContext = createContext<AppDataContextType>({
  templates: [],
  clients: [],
  products: [],
  rules: [],
  loading: true,
});

export const useAppData = () => useContext(AppDataContext);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
    const [user] = useAuthState(auth);
    const [appData, setAppData] = useState<Omit<AppDataContextType, 'loading'>>({
        templates: [],
        clients: [],
        products: [],
        rules: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const tenantId = 'tenant-001'; // This should be dynamic based on the user's tenant

        const collectionsToFetch = {
            templates: collection(db, 'tenants', tenantId, 'proposal_templates'),
            clients: collection(db, 'tenants', tenantId, 'clients'),
            products: collection(db, 'tenants', tenantId, 'products'),
            rules: collection(db, 'tenants', tenantId, 'product_rules'),
        };

        const collectionKeys = Object.keys(collectionsToFetch) as Array<keyof typeof collectionsToFetch>;
        let initialLoadCounter = collectionKeys.length;

        const unsubscribers = collectionKeys.map((key) => {
            let isInitialLoad = true;
            return onSnapshot(query(collectionsToFetch[key]), snapshot => {
                setAppData(prev => ({
                    ...prev,
                    [key]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                }));

                if (isInitialLoad) {
                    isInitialLoad = false;
                    initialLoadCounter--;
                    if (initialLoadCounter === 0) {
                        setLoading(false);
                    }
                }
            }, (error) => {
                console.error(`Error fetching ${key}:`, error);
                if (isInitialLoad) {
                    isInitialLoad = false;
                    initialLoadCounter--;
                    if (initialLoadCounter === 0) {
                        setLoading(false);
                    }
                }
            });
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [user]);

    return (
        <AppDataContext.Provider value={{ ...appData, loading }}>
            {children}
        </AppDataContext.Provider>
    );
}
