
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Palette, Sparkles, Wand2, Building } from 'lucide-react';
import { generateBrandAnalysis, saveBrandingSettings } from '@/app/settings/branding/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { useTour } from '@/hooks/use-tour';
import { useAppContext } from '@/components/app-data-provider';

const brandingSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    logoUrl: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex code").optional().or(z.literal('')),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex code").optional().or(z.literal('')),
    brandVoice: z.string().optional(),
    brandImage: z.any().optional(),
    companyAddress: z.string().optional(),
    companyPhone: z.string().optional(),
    companyEmail: z.string().email().optional().or(z.literal('')),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

const brandingTourSteps = [
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
    const { tenantId, brandingSettings, loading: loadingAppData, userRole } = useAppContext();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { startTour } = useTour();

    useEffect(() => {
        startTour('branding', brandingTourSteps);
    }, [startTour]);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BrandingFormData>({
        resolver: zodResolver(brandingSchema),
    });

    useEffect(() => {
        if (brandingSettings) {
            reset(brandingSettings);
            if (brandingSettings.logoUrl) {
                setImagePreview(brandingSettings.logoUrl)
            }
        }
    }, [brandingSettings, reset]);


    const websiteUrl = watch('websiteUrl');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setValue('logoUrl', reader.result as string); // Save as data URI
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
            if (result.companyAddress) setValue('companyAddress', result.companyAddress);
            if (result.companyPhone) setValue('companyPhone', result.companyPhone);
            if (result.companyEmail) setValue('companyEmail', result.companyEmail);

            toast({ title: "Analysis Complete", description: "Branding details have been populated." });
        } catch (error) {
            console.error("Error analyzing branding:", error);
            toast({ variant: "destructive", title: "Analysis Failed", description: "Could not analyze the provided source." });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const onSubmit = async (data: BrandingFormData) => {
        if (!tenantId) {
            toast({ title: "Error", description: "Tenant ID is missing.", variant: "destructive" });
            return;
        };
        setIsSubmitting(true);
        try {
            await saveBrandingSettings(tenantId, data);
            toast({ title: "Branding Saved", description: "Your branding settings have been updated and will now be applied." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Could not save branding settings.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const canManage = userRole === 'admin' || userRole === 'super_admin';

    if (loadingAppData) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    
    if (!canManage) {
        return (
            <div className="text-center">
                <p>You do not have permission to edit branding settings.</p>
            </div>
        )
    }

    return (
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
                        <CardTitle className="flex items-center gap-2"><Building />Company Details</CardTitle>
                        <CardDescription>Manage your company's core information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input id="companyName" {...register('companyName')} />
                            {errors.companyName && <p className="text-destructive text-sm mt-1">{errors.companyName.message}</p>}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="companyPhone">Company Phone</Label>
                                <Input id="companyPhone" {...register('companyPhone')} />
                                {errors.companyPhone && <p className="text-destructive text-sm mt-1">{errors.companyPhone.message}</p>}
                            </div>
                             <div>
                                <Label htmlFor="companyEmail">Company Email</Label>
                                <Input id="companyEmail" {...register('companyEmail')} />
                                {errors.companyEmail && <p className="text-destructive text-sm mt-1">{errors.companyEmail.message}</p>}
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="companyAddress">Company Address</Label>
                            <Textarea id="companyAddress" {...register('companyAddress')} />
                            {errors.companyAddress && <p className="text-destructive text-sm mt-1">{errors.companyAddress.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card data-tour-id="ai-discovery-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Brand Discovery</CardTitle>
                        <CardDescription>
                            Let AI discover your brand details from your website or a brand image. This will populate the fields on this page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="website" className="w-full">
                            <TabsList>
                                <TabsTrigger value="website">From Website URL</TabsTrigger>
                                <TabsTrigger value="image">From Logo/Image</TabsTrigger>
                            </TabsList>
                            <TabsContent value="website" className="pt-4">
                                <Label htmlFor="websiteUrl">Company Website URL</Label>
                                <Input id="websiteUrl" {...register('websiteUrl')} placeholder="https://example.com" />
                                {errors.websiteUrl && <p className="text-destructive text-sm mt-1">{errors.websiteUrl.message}</p>}
                            </TabsContent>
                            <TabsContent value="image" className="pt-4">
                                <Label htmlFor="brandImageUpload">Upload Logo, Screenshot or Brand Kit</Label>
                                <Input id="brandImageUpload" type="file" accept="image/*" onChange={handleImageChange} />
                                {imagePreview && (
                                    <div className="mt-4">
                                        <Label>Image Preview</Label>
                                        <div className="w-48 h-24 relative mt-2 rounded-md border bg-muted p-2">
                                            <Image src={imagePreview} alt="Brand preview" fill className="object-contain" />
                                        </div>
                                    </div>
                                )}
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
                        <CardTitle className="flex items-center gap-2"><Palette /> Visual Branding</CardTitle>
                        <CardDescription>
                            Manually set your brand colors and upload your logo. These will override the defaults in globals.css.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="logoUrl">Logo Upload</Label>
                            <Input id="logoUpload" type="file" accept="image/*" onChange={handleImageChange} />
                            {imagePreview && (
                                <div className="mt-4">
                                    <Label>Logo Preview</Label>
                                    <div className="w-48 h-24 relative mt-2 rounded-md border bg-muted p-2">
                                        <Image src={imagePreview} alt="Logo preview" fill className="object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="primaryColor">Primary Color (Hex)</Label>
                                <Input id="primaryColor" {...register('primaryColor')} placeholder="#007A80" />
                                {errors.primaryColor && <p className="text-destructive text-sm mt-1">{errors.primaryColor.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="secondaryColor">Secondary Color (Hex)</Label>
                                <Input id="secondaryColor" {...register('secondaryColor')} placeholder="#0282F2" />
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
                    <Button type="submit" disabled={isSubmitting || loadingAppData}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Branding
                    </Button>
                </div>
            </form>
        </div>
    );
}
