
'use client';

import { useState, useRef } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Wand2, File, X, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const selectedFile = files[0];
            // Simple validation for file type
            if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
                 setFile(selectedFile);
            } else {
                // You would use a toast notification here in a real app
                alert("Please upload a valid CSV file.");
                if(fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };
    
    const handleProcessFile = () => {
        if(!file) return;

        console.log("Processing file:", file.name);
        setIsProcessing(true);

        // TODO: Implement the backend logic for Step 1 (Upload & Ingest)
        // This will involve reading the file and creating "Unverified" products in Firestore.
        // For now, we just simulate a delay.
        setTimeout(() => {
             console.log("Finished processing.");
             setIsProcessing(false);
        }, 3000)
    };
    
    return (
        <MainLayout>
            <div className="space-y-8 max-w-4xl mx-auto">
                 <div>
                    <h1 className="text-4xl font-bold">Intelligent Onboarding Engine</h1>
                    <p className="text-muted-foreground mt-1">
                        Use AI to automatically configure your product catalog and business rules.
                    </p>
                </div>

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
                                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                         <Button onClick={handleProcessFile} disabled={!file || isProcessing} className="w-full">
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isProcessing ? "Analyzing..." : "Analyze & Begin Onboarding"}
                        </Button>
                    </CardContent>
                </Card>

                <Alert>
                    <Wand2 className="h-4 w-4" />
                    <AlertTitle>What Happens Next?</AlertTitle>
                    <AlertDescription>
                        After you upload your file, our AI engine will analyze each product. In the next step, it will ask you a series of questions to confirm the rules and dependencies it discovers, ensuring your proposal configurator is perfectly tailored to your business logic.
                    </AlertDescription>
                </Alert>
            </div>
        </MainLayout>
    );
}
