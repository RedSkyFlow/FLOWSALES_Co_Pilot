'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { runScrapeWebsiteFlow, runAnalyzeConfiguratorFlow } from './actions';
import { createTemplateFromDoc } from '@/app/templates/actions';
import { approveConfiguration } from '@/app/(protected)/settings/products/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

type Product = { id: string; name: string; price: number; };
type Rule = { type: string; productIds: string[]; };

export default function OnboardingPage() {
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  
  const [extractedProducts, setExtractedProducts] = useState<Product[]>([]);
  const [extractedRules, setExtractedRules] = useState<Rule[]>([]);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setSubscriptionTier(userData.subscription?.tier || 'free');
          setTenantId(userData.tenantId || null);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] || null);
  const handleTemplateFileChange = (event: React.ChangeEvent<HTMLInputElement>) => setTemplateFile(event.target.files?.[0] || null);

  const handleAnalyzeCatalog = async () => {
    if (!file || !user) return toast({ title: "Error", description: "Please select a file."});
    setIsLoading(true);
    try {
      const dataUri = await fileToDataUri(file);
      const result = await runAnalyzeConfiguratorFlow({ documentContent: dataUri, userId: user.uid });
      setExtractedProducts(result.products);
      setExtractedRules(result.rules);
      toast({ title: "Analysis Complete", description: "Review the extracted products and rules below." });
    } catch (error) {
      toast({ title: "Analysis Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!tenantId) return toast({ title: "Error", description: "User or tenant information is missing."});
    const result = await approveConfiguration({ products: extractedProducts, rules: extractedRules, tenantId });
    if (result.success) {
        toast({ title: "Configuration Saved!", description: "Your product catalog has been updated." });
        setExtractedProducts([]);
        setExtractedRules([]);
    } else {
        toast({ title: "Save Failed", description: result.error, variant: "destructive" });
    }
  };

  const handleScrapeWebsite = async () => {
      if (!websiteUrl || !tenantId) return toast({ title: "Error", description: "Please enter a valid URL."});
      setIsScraping(true);
      try {
          const result = await runScrapeWebsiteFlow({ url: websiteUrl, tenantId });
          toast({ title: "Scraping Complete", description: `Found logo, ${result.brandColors?.length || 0} colors, and a "${result.toneOfVoice}" tone.` });
      } catch (error) {
          toast({ title: "Scraping Failed", description: (error as Error).message, variant: "destructive" });
      } finally {
          setIsScraping(false);
      }
  };
  
  const handleCreateTemplate = async () => {
    if (!templateFile || !tenantId) return toast({ title: "Error", description: "Please select a file." });
    setIsCreatingTemplate(true);
    try {
      const documentContent = await fileToText(templateFile);
      const result = await createTemplateFromDoc({ documentContent, tenantId });
      if (result.success) {
        toast({ title: "Template Created", description: "Your new proposal template has been added." });
      } else {
        toast({ title: "Creation Failed", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Creation Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
      });
  };
  
  const fileToText = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
      });
  };

  const canUseProFeatures = subscriptionTier === 'pro' || subscriptionTier === 'enterprise';

  if (loading) {
    return <div className="container mx-auto p-4"><p>Loading...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">Onboarding & Setup</h1>
        
        <Card>
            <CardHeader>
                <CardTitle>AI-Powered Brand Setup</CardTitle>
                <CardDescription>Automatically configure your branding by scraping your company website.</CardDescription>
            </CardHeader>
            <CardContent>
                {canUseProFeatures ? (
                    <div className="flex gap-2">
                        <Input type="url" placeholder="https://example.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} disabled={isScraping}/>
                        <Button onClick={handleScrapeWebsite} disabled={isScraping || !websiteUrl}>{isScraping ? "Scraping..." : "Scrape Website"}</Button>
                    </div>
                ) : <FeatureLock/> }
            </CardContent>
        </Card>
        
        <Separator/>

        <Card>
            <CardHeader>
                <CardTitle>Intelligent Product &amp; Rules Onboarding</CardTitle>
                <CardDescription>Upload a product catalog, price sheet, or existing proposal to have our AI extract your products and business rules.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {canUseProFeatures ? (
                    <>
                        <Input type="file" accept=".pdf,.docx,.xlsx" onChange={handleFileChange} disabled={isLoading} />
                        <Button onClick={handleAnalyzeCatalog} disabled={isLoading || !file}>
                            {isLoading ? 'Analyzing Document...' : 'Analyze Document'}
                        </Button>
                    </>
                ) : <FeatureLock/>}
            </CardContent>
        </Card>

        {(extractedProducts.length > 0 || extractedRules.length > 0) && (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Verify and Approve Configuration</CardTitle>
                    <Button onClick={handleApprove} variant="default">Approve & Save Configuration</Button>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">{/* ... table display code ... */}</CardContent>
            </Card>
        )}

        <Separator/>

        <Card>
            <CardHeader>
                <CardTitle>Create Template from Document</CardTitle>
                <CardDescription>Upload an existing proposal (PDF or DOCX) to automatically create a new template.</CardDescription>
            </CardHeader>
            <CardContent>
                {canUseProFeatures ? (
                     <div className="flex gap-2">
                        <Input type="file" accept=".pdf,.docx" onChange={handleTemplateFileChange} disabled={isCreatingTemplate}/>
                        <Button onClick={handleCreateTemplate} disabled={isCreatingTemplate || !templateFile}>{isCreatingTemplate ? "Creating..." : "Create Template"}</Button>
                    </div>
                ) : <FeatureLock/>}
            </CardContent>
        </Card>

    </div>
  );
}

const FeatureLock = () => (
    <div className="text-center p-4 border-2 border-dashed rounded-lg bg-slate-50">
        <h3 className="text-lg font-semibold">Upgrade to Unlock</h3>
        <p className="text-muted-foreground mb-4">This AI-powered feature is available on our Pro and Enterprise plans.</p>
        <Button>Upgrade Your Plan</Button>
    </div>
);
