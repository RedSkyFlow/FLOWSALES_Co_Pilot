
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building, Palette, ShieldCheck, Users } from "lucide-react";

const settingsPanels = [
    {
        title: "Organization Profile",
        description: "Manage your company name and details.",
        icon: <Building className="h-6 w-6 text-primary" />,
        href: "/settings/organization"
    },
    {
        title: "User Management",
        description: "Add or remove team members.",
        icon: <Users className="h-6 w-6 text-primary" />,
        href: "/settings/users"
    },
    {
        title: "Branding",
        description: "Upload your logo and set brand colors.",
        icon: <Palette className="h-6 w-6 text-primary" />,
        href: "/settings/branding"
    },
    {
        title: "Product Catalog",
        description: "Manage your products and services.",
        icon: <Briefcase className="h-6 w-6 text-primary" />,
        href: "/settings/products"
    },
    {
        title: "Legal & Compliance",
        description: "Set your standard terms and conditions.",
        icon: <ShieldCheck className="h-6 w-6 text-primary" />,
        href: "/settings/legal"
    }
]

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
                <Card key={panel.title} className="hover:border-primary transition-all cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-4">
                        {panel.icon}
                        <div>
                            <CardTitle>{panel.title}</CardTitle>
                            <CardDescription>{panel.description}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
      </div>
    </MainLayout>
  );
}
