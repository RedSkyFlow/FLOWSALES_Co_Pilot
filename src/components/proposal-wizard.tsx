"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader,
  Users,
  FileText,
  Package,
  ClipboardCheck,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { mockClients, mockVenueOSModules } from "@/lib/mock-data";
import type { VenueOSModule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { generateExecutiveSummary } from "@/ai/flows/generate-executive-summary";
import { suggestCaseStudies } from "@/ai/flows/suggest-case-studies";
import { createProposal } from "@/app/proposals/actions";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb } from "lucide-react";

const templates = [
  {
    name: "Stadium OS Proposal",
    description: "For sports venues and large arenas.",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    name: "Shopping Mall Pilot Proposal",
    description: "For retail centers and commercial properties.",
    icon: <Package className="h-8 w-8 text-primary" />,
  },
  {
    name: "Telco Proposal",
    description: "For telecommunication infrastructure projects.",
    icon: <FileText className="h-8 w-8 text-primary" />,
  },
];

const steps = [
  { name: "Select Template", icon: <FileText /> },
  { name: "Client & AI Content", icon: <Lightbulb /> },
  { name: "Select Modules", icon: <Package /> },
  { name: "Review & Finalize", icon: <ClipboardCheck /> },
];

export function ProposalWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [painPoints, setPainPoints] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [caseStudySuggestions, setCaseStudySuggestions] = useState<string[]>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isCaseStudyLoading, setIsCaseStudyLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedModules, setSelectedModules] = useState<VenueOSModule[]>([]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateSummary = async () => {
    if (!painPoints || !selectedTemplate) return;
    setIsSummaryLoading(true);
    try {
        const result = await generateExecutiveSummary({ clientPainPoints: painPoints, proposalType: selectedTemplate });
        setExecutiveSummary(result.executiveSummary);
    } catch (error) {
        console.error("Failed to generate summary:", error);
        setExecutiveSummary("Error: Could not generate executive summary.");
    } finally {
        setIsSummaryLoading(false);
    }
  };

  const handleSuggestCaseStudies = async () => {
    if (!painPoints || !selectedTemplate) return;
    setIsCaseStudyLoading(true);
    try {
        const client = mockClients.find(c => c.id === selectedClient);
        const result = await suggestCaseStudies({ 
            clientDescription: `${client?.name} in the ${client?.industry} industry.`,
            proposalContext: `Proposal for ${selectedTemplate}. Key issues are ${painPoints}`,
            contentLibrary: "Case Study 1: ...; Case Study 2: ..." // a mock library
        });
        setCaseStudySuggestions(result.caseStudies);
    } catch (error) {
        console.error("Failed to suggest case studies:", error);
    } finally {
        setIsCaseStudyLoading(false);
    }
  };

  const handleModuleToggle = (module: VenueOSModule, checked: boolean) => {
    setSelectedModules((prev) =>
      checked ? [...prev, module] : prev.filter((m) => m.id !== module.id)
    );
  };
  
  const totalValue = selectedModules.reduce((sum, module) => sum + module.basePrice, 0);

  const handleSaveAndFinalize = async () => {
    setIsSaving(true);
    try {
        const newProposalId = await createProposal({
            selectedTemplate,
            selectedClientId: selectedClient,
            executiveSummary,
            selectedModules,
            totalValue,
            salesAgentId: 'abc-123', // NOTE: Replace with actual authenticated user ID
        });
        toast({
            title: "Proposal Created!",
            description: "Your new proposal has been saved successfully.",
        });
        router.push(`/proposals/${newProposalId}`);
    } catch (error) {
        console.error("Failed to save proposal:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save the proposal. Please try again.",
        });
        setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div
              key={step.name}
              className={cn(
                "flex items-center gap-2",
                index === currentStep ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                  "flex items-center justify-center rounded-full border-2 size-6",
                  index === currentStep ? "border-primary" : "border-border",
                  index < currentStep ? "bg-primary border-primary text-primary-foreground" : ""
              )}>
                {index < currentStep ? <CheckCircle size={14}/> : <span className="text-xs">{index + 1}</span>}
              </div>
              <span className="hidden md:inline">{step.name}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="min-h-[400px]">
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-semibold text-center">
              Choose a Proposal Template
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.name}
                  onClick={() => setSelectedTemplate(template.name)}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg hover:border-primary",
                    selectedTemplate === template.name && "border-2 border-primary shadow-lg"
                  )}
                >
                  <CardHeader className="flex flex-col items-center text-center gap-4">
                    {template.icon}
                    <CardTitle className="font-sans text-base">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">
                      {template.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-headline font-semibold">Client & Pain Points</h2>
                <div>
                    <Label htmlFor="client">Select Client</Label>
                    <Select onValueChange={setSelectedClient} defaultValue={selectedClient}>
                    <SelectTrigger id="client">
                        <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                        {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                            {client.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="pain-points">Client Pain Points / Meeting Notes</Label>
                    <Textarea
                    id="pain-points"
                    placeholder="e.g., struggling with fan engagement, long concession lines, outdated ticketing..."
                    rows={6}
                    value={painPoints}
                    onChange={(e) => setPainPoints(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleGenerateSummary} disabled={isSummaryLoading || !painPoints || !selectedTemplate}>
                        {isSummaryLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Executive Summary
                    </Button>
                    <Button onClick={handleSuggestCaseStudies} variant="outline" disabled={isCaseStudyLoading || !painPoints || !selectedTemplate}>
                        {isCaseStudyLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Suggest Case Studies
                    </Button>
                </div>
            </div>
             <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                <h3 className="font-semibold font-headline text-lg">AI Generated Content</h3>
                <div>
                    <Label>Executive Summary</Label>
                    <Textarea readOnly value={executiveSummary || "AI-generated summary will appear here."} rows={6} className="bg-background"/>
                </div>
                 <div>
                    <Label>Suggested Case Studies</Label>
                    {caseStudySuggestions.length > 0 ? (
                        <ul className="space-y-2">
                            {caseStudySuggestions.map((study, index) => <li key={index} className="text-sm p-2 bg-background rounded-md">{study}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground p-2 bg-background rounded-md">Suggestions will appear here.</p>
                    )}
                </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-semibold">Select Modules</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {mockVenueOSModules.map((module) => (
                        <div key={module.id} className="flex items-start space-x-3 rounded-lg border p-4">
                        <Checkbox
                            id={module.id}
                            checked={selectedModules.some((m) => m.id === module.id)}
                            onCheckedChange={(checked) => handleModuleToggle(module, !!checked)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor={module.id} className="font-medium cursor-pointer">
                            {module.name}
                            </label>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                         <p className="ml-auto font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(module.basePrice)}</p>
                        </div>
                    ))}
                </div>
                <div className="p-4 rounded-lg bg-muted/50 h-fit sticky top-4">
                    <h3 className="font-headline text-lg font-semibold">Dynamic Pricing</h3>
                    <ul className="my-4 space-y-2">
                        {selectedModules.map(module => (
                            <li key={module.id} className="flex justify-between items-center text-sm">
                                <span>{module.name}</span>
                                <span className="font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(module.basePrice)}</span>
                            </li>
                        ))}
                         {selectedModules.length === 0 && <p className="text-sm text-muted-foreground">Select modules to see pricing.</p>}
                    </ul>
                    <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                        <span>Total Cost</span>
                        <span className="text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}</span>
                    </div>
                </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
            <div className="text-center space-y-4 flex flex-col items-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-headline font-semibold">Proposal Ready!</h2>
                <p className="max-w-prose text-muted-foreground">
                    You have successfully configured the proposal. Review the details below before saving or sending it to the client.
                </p>
                <Card className="text-left w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="font-sans">Proposal Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Template:</strong> {selectedTemplate}</p>
                        <p><strong>Client:</strong> {mockClients.find(c => c.id === selectedClient)?.name}</p>
                        <p><strong>Modules:</strong> {selectedModules.map(m => m.name).join(', ')}</p>
                        <p className="font-bold"><strong>Total Value:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}</p>
                    </CardContent>
                </Card>
            </div>
        )}

      </CardContent>
      <CardHeader className="border-t">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSaving}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={(currentStep === 0 && !selectedTemplate) || (currentStep === 1 && !selectedClient)}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSaveAndFinalize} disabled={isSaving}>
              {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save and Finalize'}
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
