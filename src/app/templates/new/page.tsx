
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2, GripVertical, Users, Package, FileText, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTemplate, generateTemplate } from '../actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const sectionSchema = z.object({
    title: z.string().min(1, 'Section title is required'),
    content: z.string().min(1, 'Section content is required'),
    type: z.literal('template'),
});

const templateSchema = z.object({
  name: z.string().min(3, { message: 'Template name must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  icon: z.enum(['Users', 'Package', 'FileText']),
  sections: z.array(sectionSchema).min(1, 'At least one section is required.'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

const iconMap = {
    Users: <Users className="h-5 w-5" />,
    Package: <Package className="h-5 w-5" />,
    FileText: <FileText className="h-5 w-5" />,
}

export default function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [aiTemplateName, setAiTemplateName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: 'FileText',
      sections: [{ title: 'Introduction', content: 'This is a placeholder for the introduction.', type: 'template' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  });
  
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsub = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setUserData(docSnap.data() as User);
        }
    });
    return () => unsub();
  }, [user]);

  const onSubmit = async (data: TemplateFormData) => {
    if (!user || !userData?.tenantId) {
        toast({ title: "Not Authenticated", description: "You must be logged in with a valid tenant.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      await createTemplate({ ...data, tenantId: userData.tenantId });
      toast({
        title: 'Template Created',
        description: `The "${data.name}" template has been successfully created.`,
      });
      router.push('/templates');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to create template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleGenerateFromDocument = async () => {
    if (!file || !aiTemplateName || !user || !userData?.tenantId) {
        toast({ title: 'Missing Information', description: 'Please provide a template name and select a file.', variant: 'destructive' });
        return;
    }
    setIsGenerating(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
            await generateTemplate({
                tenantId: userData.tenantId,
                templateName: aiTemplateName,
                documentContent: content
            });
            toast({ title: 'Template Generated Successfully', description: `Template "${aiTemplateName}" has been created.` });
            router.push('/templates');
        } catch (error) {
            console.error(error);
            toast({ title: 'Generation Failed', description: 'The AI could not create a template from the document.', variant: 'destructive' });
        } finally {
            setIsGenerating(false);
        }
    };
    reader.onerror = () => {
        toast({ title: 'File Read Error', description: 'Could not read the selected file.', variant: 'destructive' });
        setIsGenerating(false);
    };
    reader.readAsText(file);
  };

  if(loadingAuth) {
    return <MainLayout><Loader2 className="h-8 w-8 animate-spin" /></MainLayout>
  }
  
  return (
    <MainLayout>
        <div>
          <h1 className="text-3xl font-headline font-bold">Create New Template</h1>
          <p className="text-muted-foreground">Design a new proposal template for your team to use.</p>
        </div>

        <Alert className="border-accent/50 bg-accent/10">
          <Wand2 className="h-4 w-4 text-accent" />
          <AlertTitle className="text-accent">New: Create with AI</AlertTitle>
          <AlertDescription>
            Automatically build a template by uploading an existing proposal document.
          </AlertDescription>
           <CardContent className="pt-4 px-0 pb-0">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="ai-template-name">New Template Name</Label>
                        <Input id="ai-template-name" placeholder="e.g., Enterprise Sales Template" value={aiTemplateName} onChange={(e) => setAiTemplateName(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="file-upload">Proposal Document</Label>
                        <Input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.md" />
                        <p className="text-sm text-muted-foreground mt-1">Upload a .txt or .md file.</p>
                    </div>
                    <Button onClick={handleGenerateFromDocument} disabled={isGenerating || !aiTemplateName || !file}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate with AI
                    </Button>
                </div>
            </CardContent>
        </Alert>
        
        <div className="relative py-4">
            <Separator />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-background text-muted-foreground text-sm">OR</div>
        </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <p className="text-lg font-semibold text-center">Create a Template Manually</p>
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Give your template a name, description, and an icon.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="icon">
                                <SelectValue placeholder="Select an icon" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(iconMap).map((iconKey) => (
                                <SelectItem key={iconKey} value={iconKey}>
                                    <div className="flex items-center gap-2">
                                    {iconMap[iconKey as keyof typeof iconMap]}
                                    {iconKey}
                                    </div>
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.icon && <p className="text-destructive text-sm mt-1">{errors.icon.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Template Sections</CardTitle>
                <CardDescription>Add and arrange the content sections for this template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 p-4 border rounded-lg bg-muted/20">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                <div className="flex-grow space-y-2">
                    <Label htmlFor={`sections.${index}.title`}>Section Title</Label>
                    <Input
                        id={`sections.${index}.title`}
                        {...register(`sections.${index}.title`)}
                        placeholder="e.g., Executive Summary"
                    />
                    {errors.sections?.[index]?.title && <p className="text-destructive text-sm">{errors.sections[index].title.message}</p>}

                    <Label htmlFor={`sections.${index}.content`}>Default Content</Label>
                    <Textarea
                        id={`sections.${index}.content`}
                        {...register(`sections.${index}.content`)}
                        placeholder="Enter the default text for this section..."
                        rows={4}
                    />
                    {errors.sections?.[index]?.content && <p className="text-destructive text-sm">{errors.sections[index].content.message}</p>}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
             {errors.sections?.root && <p className="text-destructive text-sm mt-1">{errors.sections.root.message}</p>}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ title: '', content: '', type: 'template' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || loadingAuth}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Template Manually
            </Button>
        </div>
      </form>
    </MainLayout>
  );
}
