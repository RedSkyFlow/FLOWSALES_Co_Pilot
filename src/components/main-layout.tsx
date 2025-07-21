
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  Settings,
  BookUser,
  LogOut,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';
import { collection, onSnapshot, query } from 'firebase/firestore';
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

function FlowSalesLogo() {
  return (
    <div className="flex items-center gap-2 p-4 border-b border-border">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <path d="M12 3L2 7l10 4 10-4-10-4z"></path>
        <path d="M2 17l10 4 10-4"></path>
        <path d="M2 12l10 4 10-4"></path>
      </svg>
      <h1 className="text-xl font-bold">
        <span className="text-primary">Flow</span>
        <span>Sales</span>
      </h1>
    </div>
  );
}

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/templates', icon: Briefcase, label: 'Templates' },
];

const secondaryNavItems = [
    { href: '/guide', icon: BookUser, label: 'Help & Guide' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

function NavItem({ href, icon: Icon, label }: typeof navItems[0]) {
    const pathname = usePathname();
    const isActive = href === '/' ? pathname === href : pathname.startsWith(href);

    return (
        <Link href={href}>
            <div
                className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-border hover:text-foreground transition-colors',
                    isActive && 'bg-secondary/20 text-secondary font-semibold'
                )}
            >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
            </div>
        </Link>
    );
}

function AppDataProvider({ children }: { children: React.ReactNode }) {
    const [user, loadingAuth] = useAuthState(auth);
    const [appData, setAppData] = useState<Omit<AppDataContextType, 'loading'>>({
        templates: [],
        clients: [],
        products: [],
        rules: [],
    });
    const [loadingData, setLoadingData] = useState(true);
    const initialLoadCounter = useRef(0);


    useEffect(() => {
        if (loadingAuth) return;
        if (!user) {
            setLoadingData(false);
            return;
        }

        setLoadingData(true);
        const tenantId = 'tenant-001'; // This should be dynamic based on the user's tenant

        const collectionsToFetch = {
            templates: collection(db, 'tenants', tenantId, 'proposal_templates'),
            clients: collection(db, 'tenants', tenantId, 'clients'),
            products: collection(db, 'tenants', tenantId, 'products'),
            rules: collection(db, 'tenants', tenantId, 'product_rules'),
        };

        const collectionKeys = Object.keys(collectionsToFetch) as Array<keyof typeof collectionsToFetch>;
        initialLoadCounter.current = collectionKeys.length;

        const unsubscribers = collectionKeys.map((key) => {
            let isInitialLoad = true;
            return onSnapshot(query(collectionsToFetch[key]), snapshot => {
                setAppData(prev => ({
                    ...prev,
                    [key]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                }));

                if (isInitialLoad) {
                    isInitialLoad = false;
                    initialLoadCounter.current -= 1;
                    if (initialLoadCounter.current === 0) {
                        setLoadingData(false);
                    }
                }
            }, (error) => {
                console.error(`Error fetching ${key}:`, error);
                if (isInitialLoad) {
                    isInitialLoad = false;
                    initialLoadCounter.current -= 1;
                    if (initialLoadCounter.current === 0) {
                        setLoadingData(false);
                    }
                }
            });
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [user, loadingAuth]);

    return (
        <AppDataContext.Provider value={{ ...appData, loading: loadingData }}>
            {children}
        </AppDataContext.Provider>
    );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const [signOut] = useSignOut(auth);
  const router = useRouter();

  useEffect(() => {
      if (!loading && !user) {
          router.push('/login');
      }
  }, [user, loading, router]);
  
  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary"/>
          </div>
      )
  }

  if (!user) {
      return null;
  }

  return (
    <AppDataProvider>
        <div className="flex min-h-screen bg-background text-foreground">
        <aside className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border flex flex-col">
            <FlowSalesLogo />
            <nav className="flex-grow p-4 space-y-2">
            {navItems.map((item) => (
                <NavItem key={item.href} {...item} />
            ))}
            </nav>
            <div className="p-4 border-t border-border space-y-2">
                {secondaryNavItems.map((item) => (
                    <NavItem key={item.href} {...item} />
                ))}
                <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={async () => await signOut()}>
                    <LogOut className="h-5 w-5 mr-3"/>
                    <span>Log Out</span>
                </Button>
            </div>
        </aside>
        <main className="ml-64 flex-1">
            <div className="p-8">{children}</div>
        </main>
        </div>
    </AppDataProvider>
  );
}
