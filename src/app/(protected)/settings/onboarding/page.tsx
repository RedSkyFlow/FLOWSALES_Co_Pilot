
'use client';

import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadCloud, Wand2, File, X, Loader2, CheckCircle } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import type { User, Tenant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ingestAndAnalyzeConfigurator, DocumentAnalysisOutput } from '@/ai/flows/ingest-and-analyze-configurator';
import { saveConfiguration } from './actions';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const [user] = useAuthState(auth);
    const [userData, setUserData] = useState<User | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisOutput | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            setIsLoadingUser(false);
            return;
        };
        const userDocRef = doc(db, 'users', user.uid);
        const unsub = onSnapshot(userDocRef, (userSnap) => {
            if (userSnap.exists()) {
                setUserData(userSnap.data() as User);
            }
            setIsLoadingUser(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setIsLoadingUser(false);
        });
        return () => unsub();
    }, [user]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
            setAnalysisResult(null); // Reset previous results
        }
    };
    
    const handleAnalyzeFile = async () => {
        if (!file || !userData?.tenantId) {
             toast({ variant: 'destructive', title: 'Error', description: 'File or user data is missing.' });
             return;
        }
        
        setIsAnalyzing(true);
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
            const dataUri = e.target?.result as string;
            try {
                const result = await ingestAndAnalyzeConfigurator({ documentDataUri: dataUri });
                setAnalysisResult(result);
                toast({
                    title: 'Analysis Complete',
                    description: `Found ${result.products.length} products and ${result.rules.length} rules.`
                });
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'AI Analysis Failed', description: 'An unexpected error occurred while analyzing the document.' });
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
        if (!analysisResult || !userData?.tenantId) {
             toast({ variant: 'destructive', title: 'Error', description: 'No analysis results to save.' });
             return;
        }
        setIsSaving(true);
        try {
            const result = await saveConfiguration(userData.tenantId, analysisResult);
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
        <MainLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                 <div>
                    <h1 className="text-4xl font-bold">Document Intelligence Engine</h1>
                    <p className="text-muted-foreground mt-1">
                        Upload your product catalog, price list, or proposal to have AI build your configuration.
                    </p>
                </div>
                
                {isLoadingUser ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><UploadCloud /> Upload & Analyze</CardTitle>
                                <CardDescription>
                                    Select a configuration document (e.g., XLSX, PDF, DOCX) and let the AI extract products and rules.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-grow">
                                        <Label htmlFor="file-upload" className="sr-only">Upload Document</Label>
                                        <Input 
                                            id="file-upload" 
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
                            </CardContent>
                        </Card>
                        
                        {isAnalyzing && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                                <h3 className="text-xl font-semibold">AI Analysis in Progress...</h3>
                                <p className="text-muted-foreground">This may take a moment. The AI is reading and structuring your document.</p>
                            </div>
                        )}
                        
                        {analysisResult && (
                             <Card>
                                <CardHeader>
                                    <CardTitle>Verification</CardTitle>
                                    <CardDescription>Review the products and rules extracted by the AI. You can make edits before saving.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
                                </CardContent>
                                <CardFooter>
                                     <Button onClick={handleSave} disabled={isSaving} className="w-full">
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        Approve & Save Configuration
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
