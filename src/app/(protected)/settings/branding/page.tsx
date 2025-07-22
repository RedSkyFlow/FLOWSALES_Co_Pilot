
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, Sparkles, Upload, Wand2 } from 'lucide-react';
import { generateBrandAnalysis } from '@/app/settings/branding/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { useTour, TourStep } from '@/hooks/use-tour';

const brandingSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    logoUrl: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex code").optional(),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex code").optional(),
    brandVoice: z.string().optional(),
    brandImage: z.any().optional(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

const brandingTourSteps: TourStep[] = [
    {
        selector: '[data-tour-id="branding-header"]',
        title: "Brand Configuration",
        content: "Welcome to the Branding Hub! Here you can set up your company's visual identity to ensure all your proposals are perfectly on-brand."
    },
    {
        selector: '[data-tour-id="ai-discovery-card"]',
        title: "AI Brand Discovery",
        content: "This is the magic wand. Provide your website URL or upload a brand image, and our AI will automatically extract your colors and summarize your brand's voice."
    },
    {
        selector: '[data-tour-id="manual-config-card"]',
        title: "Manual Configuration",
        content: "If you prefer hands-on control or want to tweak the AI's suggestions, you can manually set your brand colors and define your brand voice here."
    },
    {
        selector: '[data-tour-id="save-branding-btn"]',
        title: "Save Your Settings",
        content: "Once you're happy with your branding setup, click here to save it. These settings will be used to style your future proposals."
    }
];

export default function BrandingPage() {
    const { toast } = useToast();
    const [user, loadingAuth] = useAuthState(auth);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { startTour } = useTour();

    useEffect(() => {
        startTour('branding', brandingTourSteps);
    }, [startTour]);

    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<BrandingFormData>({
        resolver: zodResolver(brandingSchema),
    });

    const websiteUrl = watch('websiteUrl');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setValue('brandImage', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const imageDataUri = watch('brandImage');
            const result = await generateBrandAnalysis({ websiteUrl, imageDataUri });
            
            if (result.primaryColor) setValue('primaryColor', result.primaryColor);
            if (result.secondaryColor) setValue('secondaryColor', result.secondaryColor);
            if (result.brandVoice) setValue('brandVoice', result.brandVoice);

            toast({ title: "Analysis Complete", description: "Branding details have been populated." });
        } catch (error) {
            console.error("Error analyzing branding:", error);
            toast({ variant: "destructive", title: "Analysis Failed", description: "Could not analyze the provided source." });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const onSubmit = (data: BrandingFormData) => {
        setIsSubmitting(true);
        console.log(data);
        // TODO: Implement saving to Firestore
        toast({ title: "Branding Saved", description: "Your branding settings have been updated." });
        setIsSubmitting(false);
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                <div data-tour-id="branding-header">
                    <h1 className="text-4xl font-bold font-headline">Branding</h1>
                    <p className="text-muted-foreground mt-1">
                        Customize the look and feel of your proposals.
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" {...register('companyName')} />
                                {errors.companyName && <p className="text-destructive text-sm mt-1">{errors.companyName.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="logoUrl">Logo Upload</Label>
                                <Input id="logoUrl" type="file" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card data-tour-id="ai-discovery-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Brand Discovery</CardTitle>
                            <CardDescription>
                                Let AI discover your brand colors and voice from your website or a brand image.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="website" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="website">From Website URL</TabsTrigger>
                                    <TabsTrigger value="image">From Image</TabsTrigger>
                                </TabsList>
                                <TabsContent value="website" className="pt-4">
                                    <Label htmlFor="websiteUrl">Company Website URL</Label>
                                    <Input id="websiteUrl" {...register('websiteUrl')} placeholder="https://example.com" />
                                    {errors.websiteUrl && <p className="text-destructive text-sm mt-1">{errors.websiteUrl.message}</p>}
                                </TabsContent>
                                <TabsContent value="image" className="pt-4">
                                    <Label htmlFor="brandImage">Upload Screenshot or Brand Kit</Label>
                                    <Input id="brandImage" type="file" accept="image/*" onChange={handleImageChange} />
                                    {imagePreview && <Image src={imagePreview} alt="Brand preview" width={200} height={100} className="mt-2 rounded-md border" />}
                                </TabsContent>
                            </Tabs>
                            <Button type="button" onClick={handleAnalyze} disabled={isAnalyzing || (!watch('websiteUrl') && !watch('brandImage'))} className="mt-4">
                                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Analyze & Populate
                            </Button>
                        </CardContent>
                    </Card>

                    <Card data-tour-id="manual-config-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Palette /> Manual Configuration</CardTitle>
                            <CardDescription>
                                Manually set your brand colors and voice.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="primaryColor">Primary Color (Hex)</Label>
                                    <Input id="primaryColor" {...register('primaryColor')} placeholder="#345995" />
                                    {errors.primaryColor && <p className="text-destructive text-sm mt-1">{errors.primaryColor.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="secondaryColor">Secondary Color (Hex)</Label>
                                    <Input id="secondaryColor" {...register('secondaryColor')} placeholder="#D45500" />
                                    {errors.secondaryColor && <p className="text-destructive text-sm mt-1">{errors.secondaryColor.message}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="brandVoice">Brand Voice & Tone</Label>
                                <Textarea id="brandVoice" {...register('brandVoice')} rows={5} placeholder="e.g., Professional yet approachable. We use clear, concise language and avoid jargon..." />
                                {errors.brandVoice && <p className="text-destructive text-sm mt-1">{errors.brandVoice.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2" data-tour-id="save-branding-btn">
                        <Button type="submit" disabled={isSubmitting || loadingAuth}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Branding
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}

    