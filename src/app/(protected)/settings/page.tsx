
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building, Palette, ShieldCheck, Users, GitBranch } from "lucide-react";
import Link from "next/link";

const settingsPanels = [
    {
        title: "Organization Profile",
        description: "Manage your company name and details.",
        icon: <Building className="h-6 w-6 text-primary" />,
        href: "#",
        disabled: true,
    },
    {
        title: "User Management",
        description: "Add or remove team members.",
        icon: <Users className="h-6 w-6 text-primary" />,
        href: "#",
        disabled: true,
    },
    {
        title: "Branding",
        description: "Upload your logo and set brand colors.",
        icon: <Palette className="h-6 w-6 text-primary" />,
        href: "/settings/branding",
        disabled: false,
    },
    {
        title: "Product Catalog",
        description: "Manage your products and services.",
        icon: <Briefcase className="h-6 w-6 text-primary" />,
        href: "/settings/products",
        disabled: false,
    },
     {
        title: "Product Rules",
        description: "Set dependencies between products.",
        icon: <GitBranch className="h-6 w-6 text-primary" />,
        href: "/settings/rules",
        disabled: false,
    },
    {
        title: "Legal & Compliance",
        description: "Set your standard terms and conditions.",
        icon: <ShieldCheck className="h-6 w-6 text-primary" />,
        href: "#",
        disabled: true,
    }
]

export default function SettingsPage() {
  return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's configuration and defaults.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {settingsPanels.map((panel) => (
                <Link key={panel.title} href={panel.disabled ? "#" : panel.href} passHref>
                    <Card className={`h-full transition-all ${panel.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary'}`}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            {panel.icon}
                            <div>
                                <CardTitle>{panel.title}</CardTitle>
                                <CardDescription>{panel.description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
      </div>
  );
}
