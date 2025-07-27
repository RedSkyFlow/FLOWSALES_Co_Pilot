
'use client';

import { MainLayout } from "@/components/main-layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Building, Palette, ShieldCheck, Users, ArrowRight, Wand2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const settingsPanels = [
    {
        title: "Organization Profile",
        description: "Manage your company name and details.",
        icon: <Building className="h-6 w-6 text-primary" />,
        href: "/settings/organization",
        disabled: true,
    },
    {
        title: "User Management",
        description: "Add or remove team members.",
        icon: <Users className="h-6 w-6 text-primary" />,
        href: "/settings/users",
        disabled: true, // Re-enable when functionality is built
    },
    {
        title: "Branding",
        description: "Upload your logo and set brand colors.",
        icon: <Palette className="h-6 w-6 text-primary" />,
        href: "/settings/branding",
        disabled: true,
    },
    {
        title: "Product Catalog",
        description: "Manage your products and services.",
        icon: <Briefcase className="h-6 w-6 text-primary" />,
        href: "/settings/products",
        disabled: false,
    },
    {
        title: "Legal & Compliance",
        description: "Set your standard terms and conditions.",
        icon: <ShieldCheck className="h-6 w-6 text-primary" />,
        href: "/settings/legal",
        disabled: true,
    },
    {
        title: "Intelligent Onboarding",
        description: "Import products and configure rules with AI.",
        icon: <Wand2 className="h-6 w-6 text-primary" />,
        href: "/settings/onboarding",
        disabled: false,
    }
]

function SettingsCard({ panel }: { panel: typeof settingsPanels[0] }) {
    const cardClasses = cn(
        "group transition-all",
        panel.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary hover:-translate-y-1 hover:shadow-lg"
    );

    const content = (
         <Card className={cardClasses}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    {panel.icon}
                    <div>
                        <CardTitle>{panel.title}</CardTitle>
                        <CardDescription>{panel.description}</CardDescription>
                    </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardHeader>
        </Card>
    )

    if (panel.disabled) {
        return <div className="w-full h-full">{content}</div>
    }

    return (
        <Link href={panel.href} className="w-full h-full">
            {content}
        </Link>
    )
}


export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's configuration and defaults.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {settingsPanels.map((panel) => (
                <SettingsCard key={panel.title} panel={panel} />
            ))}
        </div>
      </div>
    </MainLayout>
  );
}
