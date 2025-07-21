
import { MainLayout } from "@/components/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockTemplates } from "@/lib/mock-data";
import { PlusCircle, Users, Package, FileText } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ProposalTemplate } from "@/lib/types";

// A map to dynamically render icons based on the string from mock data
const iconMap: Record<ProposalTemplate['icon'], React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>> = {
    Users: Users,
    Package: Package,
    FileText: FileText,
};

export default function TemplatesPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Proposal Templates</h1>
            <p className="text-muted-foreground mt-1">
              Create, view, and manage your reusable proposal templates.
            </p>
          </div>
          <Button
            className="bg-secondary text-secondary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:bg-secondary/90 hover:shadow-glow-secondary hover:-translate-y-0.5"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Template
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockTemplates.map((template) => {
                const Icon = iconMap[template.icon];
                return (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-primary">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    {template.name}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{template.description}</CardDescription>
                        </CardContent>
                        <CardHeader>
                             <Button variant="secondary">Manage Template</Button>
                        </CardHeader>
                    </Card>
                )
            })}
        </div>

      </div>
    </MainLayout>
  );
}
