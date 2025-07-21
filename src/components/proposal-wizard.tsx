
"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { mockTenantProducts } from "@/lib/mock-data";
import type { Product, ProposalSection, Client } from "@/lib/types";
import { cn } from "@/lib/utils";
import { generateExecutiveSummary } from "@/ai/flows/generate-executive-summary";
import { analyzeMeetingTranscript } from "@/ai/flows/analyze-meeting-transcript";
import { createProposal } from "@/app/proposals/actions";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { Skeleton } from "./ui/skeleton";
import { collection, query, onSnapshot } from "firebase/firestore";

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
  const [user, loadingAuth] = useAuthState(auth);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [painPoints, setPainPoints] = useState("");
  const [meetingTranscript, setMeetingTranscript] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [extraSections, setExtraSections] = useState<ProposalSection[]>([]);


  useEffect(() => {
    if (loadingAuth || !user) {
      if (!loadingAuth) setLoadingClients(false);
      return;
    }

    setLoadingClients(true);
    // NOTE: This uses a hardcoded tenant ID for now.
    const tenantId = 'tenant-001';
    const clientsCollectionRef = collection(db, 'tenants', tenantId, 'clients');
    const q = query(clientsCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
        setClients(clientsData);
        setLoadingClients(false);
    }, (error) => {
        console.error("Error fetching clients: ", error);
        setLoadingClients(false);
    });

    return () => unsubscribe();
  }, [user, loadingAuth]);


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
    setExecutiveSummary("");
    try {
        const result = await generateExecutiveSummary({ clientPainPoints: painPoints, proposalType: selectedTemplate });
        setExecutiveSummary(result.executiveSummary);
        toast({ title: "Summary Generated", description: "The executive summary has been populated." });
    } catch (error) {
        console.error("Failed to generate summary:", error);
        toast({ title: "Error", description: "Could not generate summary.", variant: "destructive" });
    } finally {
        setIsSummaryLoading(false);
    }
  };

  const handleAnalyzeTranscript = async () => {
      if (!meetingTranscript) return;
      setIsAnalysisLoading(true);
      setPainPoints("");
      setExecutiveSummary("");
      setExtraSections([]);
      setSelectedProducts([]);
      
      try {
          const result = await analyzeMeetingTranscript({
              transcript: [{ speaker: "Combined", text: meetingTranscript }],
              availableModules: mockTenantProducts.map(p => p.name)
          });
          
          setPainPoints(result.clientPainPoints.join('\n'));
          setExtraSections([
              { title: "Problem Statement", content: result.problemStatementDraft, type: "ai_generated" },
              { title: "Proposed Solution", content: result.solutionProposalDraft, type: "ai_generated" }
          ]);
          
          const suggestedProducts = mockTenantProducts.filter(p => result.suggestedModules.includes(p.name));
          setSelectedProducts(suggestedProducts);

          toast({ title: "Analysis Complete", description: "Pain points, products, and draft sections have been populated." });

          // Now, generate the executive summary based on the new pain points
          if (result.clientPainPoints.join('\n') && selectedTemplate) {
            setIsSummaryLoading(true);
            const summaryResult = await generateExecutiveSummary({ clientPainPoints: result.clientPainPoints.join('\n'), proposalType: selectedTemplate });
            setExecutiveSummary(summaryResult.executiveSummary);
            toast({ title: "Summary Generated", description: "An executive summary was also created based on the transcript." });
          }

      } catch (error) {
          console.error("Failed to analyze transcript:", error);
          toast({ title: "Error", description: "Could not analyze transcript.", variant: "destructive" });
      } finally {
          setIsAnalysisLoading(false);
          setIsSummaryLoading(false);
      }
  };


  const handleModuleToggle = (module: Product, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, module] : prev.filter((m) => m.id !== module.id)
    );
  };
  
  const totalValue = selectedProducts.reduce((sum, module) => sum + module.basePrice, 0);

  const handleSaveAndFinalize = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to create a proposal.",
        });
        return;
    }
    setIsSaving(true);
    try {
        const tenantId = 'tenant-001'; 
        const client = clients.find(c => c.id === selectedClient);
        
        const newProposalId = await createProposal({
            tenantId,
            salesAgentId: user.uid,
            selectedTemplate,
            selectedClientId: selectedClient,
            clientName: client?.name,
            executiveSummary,
            selectedProducts,
            totalValue,
            extraSections,
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
                <h2 className="text-2xl font-headline font-semibold">Client & AI Content</h2>
                <div>
                    <Label htmlFor="client">Select Client</Label>
                    {loadingClients ? <Skeleton className="h-10 w-full" /> : (
                        <Select onValueChange={setSelectedClient} defaultValue={selectedClient}>
                        <SelectTrigger id="client">
                            <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                                {client.name}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}
                </div>
                <div>
                    <Label htmlFor="meeting-transcript">Meeting Transcript (Optional)</Label>
                    <Textarea
                        id="meeting-transcript"
                        placeholder="Paste the full meeting transcript here..."
                        rows={8}
                        value={meetingTranscript}
                        onChange={(e) => setMeetingTranscript(e.target.value)}
                        className="text-xs"
                    />
                     <Button onClick={handleAnalyzeTranscript} disabled={isAnalysisLoading || !meetingTranscript || !selectedTemplate} className="mt-2 w-full" size="sm">
                        {isAnalysisLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4"/>}
                        Analyze Transcript & Generate All Content
                    </Button>
                </div>
                <div>
                    <Label htmlFor="pain-points">Client Pain Points / Meeting Notes</Label>
                    <Textarea
                    id="pain-points"
                    placeholder="e.g., struggling with fan engagement, long concession lines, outdated ticketing..."
                    rows={4}
                    value={painPoints}
                    onChange={(e) => setPainPoints(e.target.value)}
                    />
                     <Button onClick={handleGenerateSummary} disabled={isSummaryLoading || !painPoints || !selectedTemplate} className="mt-2" size="sm">
                        {isSummaryLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Executive Summary
                    </Button>
                </div>
            </div>
             <div className="space-y-4 rounded-lg bg-muted/20 p-4 border border-border">
                <h3 className="font-semibold font-headline text-lg flex items-center gap-2"><Sparkles className="text-primary"/> AI Generated Content</h3>
                <div>
                    <Label>Executive Summary</Label>
                    {isSummaryLoading ? (
                        <Skeleton className="h-24 w-full" />
                    ) : (
                        <Textarea readOnly value={executiveSummary || "AI-generated summary will appear here."} rows={6} className="bg-background"/>
                    )}
                </div>
                 <div>
                    <Label>Additional Sections</Label>
                    {isAnalysisLoading ? (
                         <div className="space-y-2 text-sm p-2 bg-background rounded-md">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        extraSections.length > 0 ? (
                            <div className="space-y-2 text-sm p-2 bg-background rounded-md">
                               {extraSections.map((section, index) => (
                                   <div key={index} className="border-b border-border last:border-none pb-2 mb-2">
                                       <p className="font-semibold">{section.title}</p>
                                       <p className="text-muted-foreground line-clamp-2">{section.content}</p>
                                   </div>
                               ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground p-2 bg-background rounded-md h-[96px]">Draft sections from transcript analysis will appear here.</p>
                        )
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
                    {mockTenantProducts.map((module) => (
                        <div key={module.id} className="flex items-start space-x-3 rounded-lg border p-4">
                        <Checkbox
                            id={module.id}
                            checked={selectedProducts.some((m) => m.id === module.id)}
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
                        {selectedProducts.map(module => (
                            <li key={module.id} className="flex justify-between items-center text-sm">
                                <span>{module.name}</span>
                                <span className="font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(module.basePrice)}</span>
                            </li>
                        ))}
                         {selectedProducts.length === 0 && <p className="text-sm text-muted-foreground">Select modules to see pricing.</p>}
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
                        <p><strong>Client:</strong> {clients.find(c => c.id === selectedClient)?.name}</p>
                        <p><strong>Modules:</strong> {selectedProducts.map(m => m.name).join(', ')}</p>
                        <p className="font-bold"><strong>Total Value:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}</p>
                    </CardContent>
                </Card>
            </div>
        )}

      </CardContent>
      <CardHeader className="border-t">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSaving || loadingAuth}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={(currentStep === 0 && !selectedTemplate) || (currentStep === 1 && !selectedClient)}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSaveAndFinalize} disabled={isSaving || loadingAuth}>
              {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save and Finalize'}
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
