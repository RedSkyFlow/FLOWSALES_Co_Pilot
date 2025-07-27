
'use client';

import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadCloud, Wand2, File, X, Loader2, CheckCircle, Zap } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User, Tenant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ingestAndAnalyzeConfigurator, type DocumentAnalysisOutput } from '@/ai/flows/ingest-and-analyze-configurator';
import { saveConfiguration, createTemplateFromDocument } from './actions';
import { useRouter } from 'next/navigation';

function FeatureLockCard({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <Card className="relative overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                 <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
                    <Zap className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold">Upgrade to Pro</h3>
                    <p className="text-muted-foreground mb-4">This AI-powered feature is available on Pro and Enterprise plans.</p>
                    <Button>Upgrade Your Plan</Button>
                </div>
                {children}
            </CardContent>
        </Card>
    )
}

function DocumentIntelligenceEngine({ tenantId }: { tenantId: string }) {
    const { toast } = useToast();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisOutput | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
            setAnalysisResult(null); // Reset previous results
        }
    };
    
    const handleAnalyzeFile = async () => {
        if (!file || !tenantId) {
             toast({ variant: 'destructive', title: 'Error', description: 'File or user data is missing.' });
             return;
        }
        
        setIsAnalyzing(true);
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
            const dataUri = e.target?.result as string;
            try {
                const result = await ingestAndAnalyzeConfigurator({ 
                    documentDataUri: dataUri,
                    tenantId: tenantId,
                });
                setAnalysisResult(result);
                toast({
                    title: 'Analysis Complete',
                    description: `Found ${result.products.length} products and ${result.rules.length} rules.`
                });
            } catch (error: any) {
                console.error(error);
                const errorMessage = error.message || 'An unexpected error occurred while analyzing the document.';
                toast({ variant: 'destructive', title: 'AI Analysis Failed', description: errorMessage });
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'File Error', description: 'Could not read the file.' });
            setIsAnalyzing(false);
        };
    };

    const handleSave = async () => {
        if (!analysisResult || !tenantId) {
             toast({ variant: 'destructive', title: 'Error', description: 'No analysis results to save.' });
             return;
        }
        setIsSaving(true);
        try {
            const result = await saveConfiguration(tenantId, analysisResult);
            if (result.success) {
                toast({
                    title: 'Configuration Saved!',
                    description: result.message,
                });
                router.push('/settings/products');
            } else {
                toast({ variant: 'destructive', title: 'Save Failed', description: result.message });
            }
        } catch(e) {
            toast({ variant: 'destructive', title: 'Save Failed', description: 'An unexpected error occurred.' });
        } finally {
            setIsSaving(false);
        }
    }

    const handleProductChange = (index: number, field: string, value: string | number) => {
        if (!analysisResult) return;
        const updatedProducts = [...analysisResult.products];
        (updatedProducts[index] as any)[field] = value;
        setAnalysisResult({ ...analysisResult, products: updatedProducts });
    }
    
    const handleRuleChange = (index: number, field: string, value: string) => {
        if (!analysisResult) return;
        const updatedRules = [...analysisResult.rules];
        (updatedRules[index] as any)[field] = value;
        setAnalysisResult({ ...analysisResult, rules: updatedRules });
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UploadCloud /> Document Intelligence Engine</CardTitle>
                <CardDescription>
                    Upload your entire product catalog, price list, or configurator spreadsheet (XLSX, PDF, DOCX) and let the AI extract all products and business rules automatically.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-grow">
                        <Label htmlFor="file-upload-di" className="sr-only">Upload Document</Label>
                        <Input 
                            id="file-upload-di"
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".xlsx,.xls,.csv,.pdf,.docx"
                            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                    </div>
                    {file && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-2">
                                <File className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; } }>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <Button onClick={handleAnalyzeFile} disabled={!file || isAnalyzing} className="w-full">
                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isAnalyzing ? "Analyzing Document..." : "Analyze with AI"}
                </Button>

                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <h3 className="text-xl font-semibold">AI Analysis in Progress...</h3>
                        <p className="text-muted-foreground">This may take a moment. The AI is reading and structuring your document.</p>
                    </div>
                )}
                
                {analysisResult && (
                     <div className="space-y-6 pt-4">
                         <CardTitle>Verification</CardTitle>
                         <CardDescription>Review the products and rules extracted by the AI. You can make edits before saving.</CardDescription>
                         <div>
                            <h3 className="text-lg font-semibold mb-2">Extracted Products</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analysisResult.products.map((p, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Input value={p.name} onChange={e => handleProductChange(i, 'name', e.target.value)} /></TableCell>
                                            <TableCell><Input value={p.description} onChange={e => handleProductChange(i, 'description', e.target.value)} /></TableCell>
                                            <TableCell><Input type="number" value={p.basePrice} onChange={e => handleProductChange(i, 'basePrice', e.target.valueAsNumber)} /></TableCell>
                                            <TableCell><Input value={p.type} onChange={e => handleProductChange(i, 'type', e.target.value)} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Extracted Rules</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analysisResult.rules.length > 0 ? analysisResult.rules.map((r, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Input value={r.name} onChange={e => handleRuleChange(i, 'name', e.target.value)}/></TableCell>
                                            <TableCell><Input value={r.description} onChange={e => handleRuleChange(i, 'description', e.target.value)}/></TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No business rules were identified.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving} className="w-full">
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Approve & Save Configuration
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CreateTemplateEngine({ tenantId }: { tenantId: string }) {
    const { toast } = useToast();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !tenantId) {
            toast({ variant: 'destructive', title: 'Error', description: 'File and tenant ID are required.' });
            return;
        }

        setIsAnalyzing(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
            const dataUri = e.target?.result as string;
            try {
                const result = await createTemplateFromDocument({
                    tenantId,
                    documentDataUri: dataUri,
                    originalFileName: file.name,
                });
                
                if (result.success) {
                    toast({
                        title: 'Template Created!',
                        description: result.message,
                    });
                    router.push('/templates');
                } else {
                    toast({ variant: 'destructive', title: 'Analysis Failed', description: result.message });
                }

            } catch (error: any) {
                console.error("Error creating template from document:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'File Error', description: 'Could not read the file.' });
            setIsAnalyzing(false);
        };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><File /> Create Template from Document</CardTitle>
                <CardDescription>
                    Upload an existing proposal or brochure (PDF, DOCX). The AI will analyze its structure and create a new, editable template for you automatically.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-grow">
                        <Label htmlFor="file-upload-template" className="sr-only">Upload Document</Label>
                        <Input 
                            id="file-upload-template" 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".pdf,.docx"
                            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                    </div>
                    {file && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-2">
                                <File className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; } }>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <Button onClick={handleAnalyze} disabled={!file || isAnalyzing} className="w-full">
                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isAnalyzing ? "Analyzing Document..." : "Analyze and Create Template"}
                </Button>
            </CardContent>
        </Card>
    );
}

export default function OnboardingPage() {
    const [user] = useAuthState(auth);
    const [userData, setUserData] = useState<User | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    
    useEffect(() => {
        if (!user) {
            setIsLoadingUser(false);
            return;
        };
        const userDocRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(userDocRef, (userSnap) => {
            if (userSnap.exists()) {
                const uData = userSnap.data() as User;
                setUserData(uData);

                if (uData.tenantId) {
                    const tenantDocRef = doc(db, 'tenants', uData.tenantId);
                     const unsubTenant = onSnapshot(tenantDocRef, (tenantSnap) => {
                        if (tenantSnap.exists()) {
                            setTenant({ id: tenantSnap.id, ...tenantSnap.data()} as Tenant);
                        }
                        setIsLoadingUser(false);
                     });
                     return () => unsubTenant();
                } else {
                    setIsLoadingUser(false);
                }
            } else {
                setIsLoadingUser(false);
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
            setIsLoadingUser(false);
        });
        return () => unsubUser();
    }, [user]);

    const hasProAccess = tenant?.subscription?.tier === 'pro' || tenant?.subscription?.tier === 'enterprise';

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
             <div>
                <h1 className="text-4xl font-bold">Intelligent Onboarding</h1>
                <p className="text-muted-foreground mt-1">
                    Use our AI-powered tools to rapidly configure your sales environment.
                </p>
            </div>
            
            {isLoadingUser ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : !userData || !tenant ? (
                <Card><CardContent><p className="p-4">Could not load user or tenant data.</p></CardContent></Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {hasProAccess ? (
                        <DocumentIntelligenceEngine tenantId={tenant.id} />
                   ) : (
                       <FeatureLockCard title={<><UploadCloud /> Document Intelligence Engine</>} description="Upload your entire product catalog, price list, or configurator spreadsheet (XLSX, PDF, DOCX) and let the AI extract all products and business rules automatically.">
                            <div className="flex-grow">
                                <Label htmlFor="file-upload" className="sr-only">Upload Document</Label>
                                <Input 
                                    id="file-upload" 
                                    type="file" 
                                    disabled
                                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                            </div>
                            <Button disabled className="w-full">
                                <Wand2 className="mr-2 h-4 w-4" />
                                Analyze with AI
                            </Button>
                       </FeatureLockCard>
                   )}
                   {hasProAccess ? (
                        <CreateTemplateEngine tenantId={tenant.id} />
                   ): (
                       <FeatureLockCard title={<><File /> Create Template from Document</>} description="Upload an existing proposal or brochure (PDF, DOCX). The AI will analyze its structure and create a new, editable template for you automatically.">
                            <div className="flex-grow">
                                <Label htmlFor="file-upload-template-lock" className="sr-only">Upload Document</Label>
                                <Input 
                                    id="file-upload-template-lock" 
                                    type="file" 
                                    disabled
                                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                            </div>
                            <Button disabled className="w-full">
                                <Wand2 className="mr-2 h-4 w-4" />
                                Analyze and Create Template
                            </Button>
                       </FeatureLockCard>
                   )}
                </div>
            )}
        </div>
    );
}
