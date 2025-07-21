
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
import { auth } from '@/lib/firebase';
import { useEffect } from 'react';
import { Button } from './ui/button';
import { useAppData } from './app-data-provider';
import { useTour } from '@/hooks/use-tour';

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
    { id: 'guide', href: '#', icon: BookUser, label: 'Help & Guide' },
    { id: 'settings', href: '/settings', icon: Settings, label: 'Settings' },
];

function NavItem({ href, icon: Icon, label, onClick }: typeof navItems[0] & { onClick?: () => void }) {
    const pathname = usePathname();
    const isActive = href !== '#' && (href === '/' ? pathname === href : pathname.startsWith(href));

    const content = (
        <div
            className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-border hover:text-foreground transition-colors cursor-pointer',
                isActive && 'bg-secondary/20 text-secondary font-semibold'
            )}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </div>
    );

    if (href === '#') {
        return <div onClick={onClick}>{content}</div>;
    }

    return (
        <Link href={href}>
           {content}
        </Link>
    );
}


function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const [signOut] = useSignOut(auth);
  const { loading: loadingData } = useAppData();
  const { startCurrentTour } = useTour();

  if (loadingData) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary"/>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
        <aside className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border flex flex-col" data-tour-id="sidebar-nav">
            <FlowSalesLogo />
            <nav className="flex-grow p-4 space-y-2">
            {navItems.map((item) => (
                <NavItem key={item.href} {...item} />
            ))}
            </nav>
            <div className="p-4 border-t border-border space-y-2">
                {secondaryNavItems.map((item) => (
                    <NavItem 
                      key={item.id} 
                      {...item} 
                      onClick={item.id === 'guide' ? () => startCurrentTour() : undefined} 
                    />
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
  )
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
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
  
  return <MainLayoutContent>{children}</MainLayoutContent>
}
