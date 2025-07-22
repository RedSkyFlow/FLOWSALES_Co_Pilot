
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2, GripVertical, Users, Package, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateTemplate } from '@/app/templates/actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { ProposalTemplate } from '@/lib/types';

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

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const { toast } = useToast();
  const [user, loadingAuth] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: 'FileText',
      sections: [],
    },
  });

  useEffect(() => {
    if (!templateId || !user) return;
    const tenantId = 'tenant-001'; // hardcoded for now
    
    const fetchTemplate = async () => {
        setIsLoading(true);
        const docRef = doc(db, 'tenants', tenantId, 'proposal_templates', templateId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as ProposalTemplate;
            reset({
                name: data.name,
                description: data.description,
                icon: data.icon as 'Users' | 'Package' | 'FileText',
                sections: data.sections,
            });
        } else {
            toast({ title: "Not Found", description: "The requested template could not be found.", variant: "destructive" });
            router.push('/templates');
        }
        setIsLoading(false);
    }

    fetchTemplate();
  }, [templateId, user, reset, router, toast]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  });

  const onSubmit = async (data: TemplateFormData) => {
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const tenantId = 'tenant-001'; // hardcoded
      await updateTemplate(tenantId, templateId, data);
      toast({
        title: 'Template Updated',
        description: `The "${data.name}" template has been successfully updated.`,
      });
      router.push('/templates');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if(loadingAuth || isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  
  return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">Edit Template</h1>
          <p className="text-muted-foreground">Modify your existing proposal template.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Update the template's name, description, and icon.</CardDescription>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                <CardDescription>Add, remove, or edit the content sections for this template.</CardDescription>
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
             {errors.sections && !errors.sections.root && <p className="text-destructive text-sm mt-1">{errors.sections.message}</p>}
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
                Save Changes
            </Button>
        </div>
      </form>
  );
}
