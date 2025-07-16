"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { mockUser } from "@/lib/mock-data";

function FlowSalesLogo() {
  const { state } = useSidebar();
  return (
    <div className="flex items-center gap-2">
      <div className="p-1 rounded-md bg-primary text-primary-foreground">
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
        >
          <path d="M12 3L2 7l10 4 10-4-10-4z"></path>
          <path d="M2 17l10 4 10-4"></path>
          <path d="M2 12l10 4 10-4"></path>
        </svg>
      </div>
      {state === "expanded" && (
        <h1 className="text-lg font-headline font-semibold tracking-tighter">
          Flow Sales
        </h1>
      )}
    </div>
  );
}

function UserProfile() {
    const { state } = useSidebar();
    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
                <Avatar className="size-8">
                <AvatarImage src={mockUser.avatarUrl} alt={mockUser.displayName} />
                <AvatarFallback>{mockUser.initials}</AvatarFallback>
                </Avatar>
                {state === "expanded" && (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground leading-none">
                        {mockUser.displayName}
                    </span>
                     <span className="text-xs text-muted-foreground">
                        Sales Agent
                    </span>
                </div>
                )}
            </div>
             {state === 'expanded' && (
                <Button variant="ghost" size="icon" className="size-7" asChild>
                    <Link href="/login">
                        <LogOut className="size-4" />
                    </Link>
                </Button>
            )}
        </div>
    )
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <FlowSalesLogo />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/")}
                  tooltip={{ children: "Dashboard" }}
                >
                  <Link href="/">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/proposals")}
                  tooltip={{ children: "Proposals" }}
                >
                  <Link href="/">
                    <FileText />
                    <span>Proposals</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/clients")}
                  tooltip={{ children: "Clients" }}
                >
                  <Link href="#">
                    <Users />
                    <span>Clients</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/templates")}
                  tooltip={{ children: "Templates" }}
                >
                  <Link href="#">
                    <Briefcase />
                    <span>Templates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/settings")}
                    tooltip={{ children: "Settings" }}
                  >
                    <Link href="#">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <div className="border-t border-border mt-2 pt-2">
                <UserProfile />
              </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
