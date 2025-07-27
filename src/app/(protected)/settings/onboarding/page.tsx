
'use client';

import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Wand2, File, X, Loader2, Link as LinkIcon, FileText, Database, Briefcase } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import type { User, Tenant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { processProductCatalog } from './actions';
import { useRouter } from 'next/navigation';

function OnboardingCard({ title, description, icon, disabled = false, action }: { title: string, description: string, icon: React.ReactNode, disabled?: boolean, action?: () => void }) {
    return (
        <Card className={disabled ? 'opacity-50' : 'hover:border-primary transition-all'}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={action} disabled={disabled} className="w-full">
                    {disabled ? "Coming Soon" : "Begin"}
                </Button>
            </CardContent>
        </Card>
    )
}


const AIGuidedSetup = ({ userData }: { userData: User }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const selectedFile = files[0];
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                 setFile(selectedFile);
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description: "Please upload a valid CSV file.",
                })
                if(fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };

     const handleProcessFile = async () => {
        if(!file || !userData?.tenantId) {
             toast({ variant: 'destructive', title: 'Error', description: 'File or user data is missing.' });
             return;
        }
        
        setIsProcessing(true);
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const csvContent = e.target?.result as string;
            try {
                const result = await processProductCatalog(userData.tenantId, csvContent);
                if (result.success) {
                    toast({
                        title: 'Catalog Processing Initiated',
                        description: `${result.count} products have been added. You will now be taken to the verification step.`
                    });
                    router.push('/settings/products/verify');
                } else {
                    toast({ variant: 'destructive', title: 'Processing Failed', description: result.message });
                }
            } catch (error) {
                console.error(error);
                toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
            } finally {
                setIsProcessing(false);
            }
        };
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'File Error', description: 'Could not read the file.' });
            setIsProcessing(false);
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
             <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertTitle>Welcome to AI-Guided Setup</AlertTitle>
                <AlertDescription>
                   Use our AI tools to quickly set up your sales environment. Provide your product catalog, website, or existing documents, and we'll help configure the rest.
                </AlertDescription>
            </Alert>
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UploadCloud /> Step 1: Upload Product Catalog</CardTitle>
                    <CardDescription>
                        Upload your existing product catalog as a CSV file. The AI will analyze it to propose dependencies and rules.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="file-upload" className="sr-only">Upload CSV</Label>
                        <Input 
                            id="file-upload" 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".csv"
                            className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/10 file:text-primary
                            hover:file:bg-primary/20"
                        />
                    </div>

                    {file && (
                         <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-2">
                                <File className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; } }>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                     <Button onClick={handleProcessFile} disabled={!file || isProcessing} className="w-full">
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        {isProcessing ? "Analyzing..." : "Analyze Product Catalog"}
                    </Button>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                <OnboardingCard
                    title="Analyze Website"
                    description="Enter your website URL to automatically extract branding, colors, and tone."
                    icon={<LinkIcon />}
                    disabled
                />
                 <OnboardingCard
                    title="Upload Documents"
                    description="Upload existing proposals or marketing documents to create templates."
                    icon={<FileText />}
                    disabled
                />
            </div>
        </div>
    )
}

const AutonomousOnboarding = () => {
    return (
        <div className="space-y-6">
             <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertTitle>Welcome to the Autonomous Onboarding Engine</AlertTitle>
                <AlertDescription>
                  As an enterprise user, you can connect directly to your business systems. Our AI will analyze your data to build and optimize your sales-to-payment workflow.
                </AlertDescription>
            </Alert>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <OnboardingCard
                    title="Connect CRM"
                    description="Integrate with Salesforce, HubSpot, or other CRMs to analyze sales data."
                    icon={<Users />}
                    disabled
                />
                <OnboardingCard
                    title="Connect Product Database"
                    description="Link directly to your product database for real-time catalog syncing."
                    icon={<Briefcase />}
                    disabled
                />
                <OnboardingCard
                    title="Connect Financial System"
                    description="Analyze historical sales data to optimize pricing and proposal strategies."
                    icon={<Database />}
                    disabled
                />
            </div>
        </div>
    )
}


export default function OnboardingPage() {
    const [user] = useAuthState(auth);
    const [userData, setUserData] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        };

        const userDocRef = doc(db, 'users', user.uid);
        
        const unsub = onSnapshot(userDocRef, async (userSnap) => {
            if (userSnap.exists()) {
                const uData = userSnap.data() as User;

                if (uData.tenantId) {
                    const tenantDocRef = doc(db, 'tenants', uData.tenantId);
                    const tenantSnap = await getDoc(tenantDocRef);
                    if (tenantSnap.exists()) {
                        const tData = tenantSnap.data() as Tenant;
                        setUserData({ ...uData, subscription: tData.subscription });
                    } else {
                        setUserData(uData); // User data without subscription
                    }
                } else {
                     setUserData(uData); // User data without tenant
                }
                 setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
            setIsLoading(false);
        });

        return () => unsub();
    }, [user]);

    return (
        <MainLayout>
            <div className="space-y-8 max-w-4xl mx-auto">
                 <div>
                    <h1 className="text-4xl font-bold">Intelligent Onboarding Engine</h1>
                    <p className="text-muted-foreground mt-1">
                        Let's set up your sales environment.
                    </p>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : userData?.subscription?.tier === 'enterprise' ? (
                    <AutonomousOnboarding />
                ) : userData ? (
                    <AIGuidedSetup userData={userData} />
                ) : (
                    <p className="text-center text-muted-foreground">Could not load user data.</p>
                )}
            </div>
        </MainLayout>
    );
}
