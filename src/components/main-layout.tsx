
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useAppData } from './app-data-provider';
import { useTour, TourStep } from '@/hooks/use-tour';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

function hexToHsl(hex: string): string | null {
    if (!hex || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
        return null;
    }
    let r, g, b;
    hex = hex.substring(1);
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}


function FlowSalesLogo({logoUrl, companyName}: {logoUrl?: string; companyName?: string}) {
  return (
    <div className="flex items-center gap-2 p-4 border-b border-border">
      {logoUrl ? (
          <Image src={logoUrl} alt={`${companyName || 'Company'} Logo`} width={28} height={28} className="object-contain" />
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
  const { loading: loadingData, brandingSettings } = useAppData();

  const dynamicStyles: React.CSSProperties = {};
  if (brandingSettings?.primaryColor) {
      const primaryHsl = hexToHsl(brandingSettings.primaryColor);
      if (primaryHsl) dynamicStyles['--primary'] = primaryHsl;
  }
  if (brandingSettings?.secondaryColor) {
      const secondaryHsl = hexToHsl(brandingSettings.secondaryColor);
      if (secondaryHsl) dynamicStyles['--secondary'] = secondaryHsl;
  }

  if (loadingData) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary"/>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground" style={dynamicStyles}>
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
                <div className="flex items-center gap-2">
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
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
                    <h1 className="text-lg font-bold">
                         {brandingSettings?.companyName || 'FlowSales'}
                    </h1>
                </div>
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

    