"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { href: '/proposals', icon: FileText, label: 'Proposals' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/templates', icon: Briefcase, label: 'Templates' },
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

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border flex flex-col">
        <FlowSalesLogo />
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
        <div className="p-4 border-t border-border">
            <NavItem href="/settings" icon={Settings} label="Settings" />
        </div>
      </aside>
      <main className="ml-64 flex-1">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
