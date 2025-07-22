
'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Loader2,
  Building,
  Palette,
  Upload,
  Sparkles,
  ListChecks,
  ThumbsUp,
  ThumbsDown,
  GitBranch,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateBrandAnalysis, saveBrandingSettings } from "@/app/settings/branding/actions";
import { bulkAddProducts } from "@/app/settings/products/actions";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import type { ProductRule, Product } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { approveSuggestedRule, rejectSuggestedRule } from "@/app/settings/rules/actions";

const steps = [
  { name: "Welcome", icon: Building },
  { name: "Brand Identity", icon: Palette },
  { name: "Upload Catalog", icon: Upload },
  { name: "AI Verification", icon: Sparkles },
  { name: "Complete", icon: ListChecks },
];

const brandingSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    logoUrl: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    brandVoice: z.string().optional(),
    brandImage: z.any().optional(),
});

const productSchema = z.object({
  productList: z.string().min(10, "Please provide a list of products to parse."),
});


export function OnboardingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [suggestedRules, setSuggestedRules] = useState<ProductRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);

  const brandingForm = useForm<z.infer<typeof brandingSchema>>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { companyName: '' },
  });
  
  const productsForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

    useEffect(() => {
        if (currentStep === 3 && user) {
            setLoadingRules(true);
            const tenantId = 'tenant-001'; // Hardcoded for now
            const productsRef = collection(db, 'tenants', tenantId, 'products');
            const rulesRef = collection(db, 'tenants', tenantId, 'product_rules');
            
            const q = query(rulesRef, where('status', '==', 'awaiting_review'));

            const unsubRules = onSnapshot(q, (snapshot) => {
                const rules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductRule));
                setSuggestedRules(rules);
                setLoadingRules(false);
            });

            const unsubProducts = onSnapshot(productsRef, (snapshot) => {
                const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(prods);
            })

            return () => {
                unsubRules();
                unsubProducts();
            };
        }
    }, [currentStep, user]);


  const progress = ((currentStep + 1) / steps.length) * 100;
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setImagePreview(result);
            brandingForm.setValue('logoUrl', result);
            brandingForm.setValue('brandImage', result);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleAnalyze = async () => {
    setIsProcessing(true);
    try {
        const { websiteUrl, brandImage } = brandingForm.getValues();
        if (!websiteUrl && !brandImage) {
            toast({ variant: "destructive", title: "Missing Source", description: "Please provide a website URL or an image." });
            return;
        }
        const result = await generateBrandAnalysis({ websiteUrl, imageDataUri: brandImage });
        
        if (result.primaryColor) brandingForm.setValue('primaryColor', result.primaryColor);
        if (result.secondaryColor) brandingForm.setValue('secondaryColor', result.secondaryColor);
        if (result.brandVoice) brandingForm.setValue('brandVoice', result.brandVoice);

        toast({ title: "Analysis Complete", description: "Branding details have been populated." });
    } catch (error) {
        toast({ variant: "destructive", title: "Analysis Failed", description: "Could not analyze the provided source." });
    } finally {
        setIsProcessing(false);
    }
  };


  const handleNext = async () => {
    let formIsValid = true;
    if (currentStep === 1) {
        formIsValid = await brandingForm.trigger();
        if (formIsValid && user) {
            setIsProcessing(true);
            try {
                const tenantId = 'tenant-001';
                await saveBrandingSettings(tenantId, brandingForm.getValues());
                toast({ title: "Branding Saved", description: "Your brand identity has been saved." });
            } catch (e) {
                toast({ variant: "destructive", title: "Error", description: "Could not save branding settings." });
                formIsValid = false;
            } finally {
                setIsProcessing(false);
            }
        }
    }
    
    if (currentStep === 3 && suggestedRules.length === 0 && !loadingRules) {
        setCurrentStep(currentStep + 1);
        return;
    }

    if (formIsValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBulkAdd = async (data: z.infer<typeof productSchema>) => {
      if (!user) {
          toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to proceed." });
          return;
      }
      setIsProcessing(true);
      const tenantId = 'tenant-001'; 
      try {
          const count = await bulkAddProducts(tenantId, data.productList);
          toast({
              title: "Catalog Processing",
              description: `${count} products have been added. The AI is now analyzing them for dependencies.`,
          });
          handleNext();
      } catch (error) {
          toast({
              title: "Error Parsing Products",
              description: "Could not parse the product list. Please check the format and try again.",
              variant: "destructive",
          });
      } finally {
        setIsProcessing(false);
      }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  }

  const handleRuleDecision = async (ruleId: string, decision: 'approve' | 'reject') => {
      if (!user) return;
      const tenantId = 'tenant-001';
      
      try {
        if (decision === 'approve') {
            await approveSuggestedRule(tenantId, ruleId);
            toast({ title: 'Rule Approved', variant: 'default' });
        } else {
            await rejectSuggestedRule(tenantId, ruleId);
            toast({ title: 'Rule Rejected', variant: 'default' });
        }
        // The onSnapshot listener will automatically remove the rule from the UI
      } catch (error) {
          console.error(`Error handling rule ${ruleId}:`, error);
          toast({ title: 'Error', description: 'Could not process rule decision.', variant: 'destructive' });
      }
  }

  return (
    <Card className="w-full shadow-2xl">
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div
              key={step.name}
              className={cn(
                "flex flex-col md:flex-row items-center gap-2",
                index === currentStep ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                  "flex items-center justify-center rounded-full border-2 size-8 transition-all",
                  index === currentStep ? "border-primary scale-110" : "border-border",
                  index < currentStep ? "bg-primary border-primary text-primary-foreground" : ""
              )}>
                {index < currentStep ? <CheckCircle size={16}/> : <step.icon size={16} />}
              </div>
              <span className="text-xs md:text-sm">{step.name}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="min-h-[450px] flex flex-col justify-center">
        {currentStep === 0 && (
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <Building className="h-16 w-16 text-primary" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold font-headline">Welcome to Flow Sales Co-Pilot!</h2>
                <p className="max-w-prose mx-auto text-muted-foreground">
                    Let's get your organization set up. This quick onboarding wizard will guide you through configuring your product catalog, branding, and business rules.
                </p>
                <p className="max-w-prose mx-auto text-muted-foreground">
                    Our AI co-pilot will help automate as much as possible to get you started in minutes.
                </p>
            </div>
        )}
        {currentStep === 1 && (
            <div>
                <h2 className="text-2xl font-bold font-headline text-center mb-4">Step 1: Your Brand Identity</h2>
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Your Company Details</h3>
                        <div>
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input id="companyName" {...brandingForm.register('companyName')} />
                            {brandingForm.formState.errors.companyName && <p className="text-destructive text-sm mt-1">{brandingForm.formState.errors.companyName.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="logoUrl">Company Logo</Label>
                            <Input id="logoUpload" type="file" accept="image/*" onChange={handleImageChange} />
                            {imagePreview && (
                                <div className="mt-2 p-2 border rounded-md bg-muted inline-block">
                                    <Image src={imagePreview} alt="Logo preview" width={128} height={64} className="object-contain" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 p-4 rounded-lg bg-muted/20 border">
                         <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="text-primary" /> AI Brand Discovery</h3>
                         <p className="text-sm text-muted-foreground">Provide your website URL and our AI will attempt to extract your brand colors and voice.</p>
                         <div>
                            <Label htmlFor="websiteUrl">Company Website URL</Label>
                            <Input id="websiteUrl" {...brandingForm.register('websiteUrl')} placeholder="https://example.com" />
                            {brandingForm.formState.errors.websiteUrl && <p className="text-destructive text-sm mt-1">{brandingForm.formState.errors.websiteUrl.message}</p>}
                        </div>
                        <Button type="button" onClick={handleAnalyze} disabled={isProcessing || (!brandingForm.watch('websiteUrl') && !brandingForm.watch('brandImage'))} className="w-full">
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Analyze & Populate Branding
                        </Button>
                    </div>
                 </div>
            </div>
        )}
        {currentStep === 2 && (
             <form onSubmit={productsForm.handleSubmit(handleBulkAdd)} className="space-y-4">
                <h2 className="text-2xl font-bold font-headline text-center">Step 2: Upload Your Product Catalog</h2>
                <p className="text-center text-muted-foreground max-w-prose mx-auto">
                    Paste your product or service list below. Don't worry about perfect formatting. Our AI will parse the name, description, and price for each item.
                </p>
                <div>
                  <Label htmlFor="productList" className="sr-only">Product List</Label>
                  <Textarea
                    id="productList"
                    {...productsForm.register('productList')}
                    className={productsForm.formState.errors.productList ? 'border-destructive' : ''}
                    rows={10}
                    placeholder="Example:
- Venue OS License - $15,000 - Annual license for our core operating system.
- Retail Analytics Suite - $5,000 - Advanced analytics for retail clients.
- On-site Installation Service - 2500 - One-time installation and setup."
                  />
                  {productsForm.formState.errors.productList && <p className="text-destructive text-sm mt-1">{productsForm.formState.errors.productList.message}</p>}
                </div>
                 <div className="flex justify-center">
                    <Button type="submit" size="lg" disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isProcessing ? 'Parsing...' : 'Parse & Upload Catalog'}
                    </Button>
                </div>
             </form>
        )}
        {currentStep === 3 && (
            <div className="text-center space-y-4">
                 <h2 className="text-2xl font-bold font-headline">Step 3: AI-Powered Verification</h2>
                <p className="max-w-prose mx-auto text-muted-foreground">
                   Our AI analyzed your product catalog and has some suggestions for business logic. Please review and approve them below.
                </p>
                {loadingRules ? (
                     <div className="flex items-center justify-center pt-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-4">Loading suggestions...</p>
                    </div>
                ) : suggestedRules.length > 0 ? (
                    <div className="max-w-2xl mx-auto space-y-4">
                       {suggestedRules.map(rule => (
                           <Card key={rule.id} className="text-left bg-muted/30">
                               <CardHeader>
                                   <CardTitle className="text-base flex items-center gap-2"><GitBranch className="text-primary"/> Suggested Rule</CardTitle>
                                   <CardDescription className="text-sm">Based on product descriptions, we suggest the following rule:</CardDescription>
                               </CardHeader>
                               <CardContent className="space-y-2">
                                    <p>IF <span className="font-semibold text-secondary">{getProductName(rule.primaryProductId)}</span> is selected...</p>
                                    <p>THEN it <span className="font-bold">{rule.condition.replace('_', ' ')}</span> <span className="font-semibold text-secondary">{getProductName(rule.relatedProductIds[0])}</span>.</p>
                                    {rule.explanation && <p className="text-xs text-muted-foreground pt-2 italic">Reasoning: {rule.explanation}</p>}
                               </g-content>
                               <CardFooter className="flex flex-row gap-2 justify-end">
                                    <Button size="sm" variant="outline" onClick={() => handleRuleDecision(rule.id, 'reject')}>
                                        <ThumbsDown className="mr-2 h-4 w-4"/> Reject
                                    </Button>
                                    <Button size="sm" variant="default" onClick={() => handleRuleDecision(rule.id, 'approve')}>
                                        <ThumbsUp className="mr-2 h-4 w-4"/> Approve
                                    </Button>
                               </CardFooter>
                           </Card>
                       ))}
                    </div>
                ) : (
                    <div className="py-8">
                        <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                        <p className="text-muted-foreground">No rule suggestions from the AI. You're all set!</p>
                        <p className="text-muted-foreground text-sm">You can add rules manually in the settings later.</p>
                    </div>
                )}
            </div>
        )}
        {currentStep === 4 && (
             <div className="text-center space-y-4">
                 <div className="flex justify-center">
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <CheckCircle className="h-16 w-16 text-success" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold font-headline">Onboarding Complete!</h2>
                <p className="max-w-prose mx-auto text-muted-foreground">
                    Your initial setup is done. You can now start creating proposals or visit the settings area to further customize your workspace.
                </p>
            </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="flex justify-between items-center w-full">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isProcessing}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < 3 && (
             <Button 
                onClick={handleNext} 
                disabled={isProcessing || (currentStep === 1 && !brandingForm.formState.isValid)}
             >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === 3 && (
              <Button onClick={handleNext} disabled={isProcessing || loadingRules || suggestedRules.length > 0}>
                {suggestedRules.length > 0 ? "Finish Review" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === 4 && (
            <Button onClick={() => router.push('/')}>
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
