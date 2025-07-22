
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  Settings,
  BookUser,
  LogOut,
  Loader2,
  Menu,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useAppData } from './app-data-provider';
import { useTour, TourStep } from '@/hooks/use-tour';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

function FlowSalesLogo({logoUrl, companyName, isMobile = false}: {logoUrl?: string; companyName?: string; isMobile?: boolean}) {
  return (
    <div className={cn("flex items-center gap-2", !isMobile && "p-4 border-b border-border")}>
      {logoUrl ? (
          <div className="relative w-7 h-7">
            <Image src={logoUrl} alt={`${companyName || 'Company'} Logo`} fill className="object-contain" />
          </div>
      ) : (
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
      )}
      <h1 className="text-xl font-bold">
        {companyName ? (
            <span>{companyName}</span>
        ) : (
            <>
                <span className="text-primary">Flow</span>
                <span>Sales</span>
            </>
        )}
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

function SidebarContent() {
    const [signOut] = useSignOut(auth);
    const { startCurrentTour } = useTour();
    const { brandingSettings } = useAppData();

    return (
        <>
            <FlowSalesLogo logoUrl={brandingSettings?.logoUrl} companyName={brandingSettings?.companyName} />
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
        </>
    );
}

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { brandingSettings } = useAppData();
  const { startCurrentTour } = useTour();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
        <aside className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border flex-col hidden md:flex" data-tour-id="sidebar-nav">
            <SidebarContent />
        </aside>
        
        <div className="flex flex-col w-full md:ml-64">
            <header className="md:hidden sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0 w-64">
                       <SheetHeader className="sr-only">
                            <SheetTitle>Navigation Menu</SheetTitle>
                       </SheetHeader>
                       <SidebarContent />
                    </SheetContent>
                </Sheet>
                <div className="flex-1">
                  <FlowSalesLogo logoUrl={brandingSettings?.logoUrl} companyName={brandingSettings?.companyName} isMobile={true} />
                </div>
                <Button variant="ghost" size="icon" onClick={startCurrentTour}>
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">Help & Guide</span>
                </Button>
            </header>
            <main className="flex-1">
                <div className="p-4 md:p-8">{children}</div>
                <TourStep />
            </main>
        </div>
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
