
'use client';

import { useState } from 'react';
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
import { Loader2, PlusCircle, Trash2, GripVertical, Users, Package, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTemplate } from '@/app/templates/actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: TemplateFormData) => {
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      // Hardcoded tenantId for now
      const tenantId = 'tenant-001';
      await createTemplate({ ...data, tenantId });
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

  if(loadingAuth) {
    return <MainLayout><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div></MainLayout>
  }
  
  return (
    <MainLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">Create New Template</h1>
          <p className="text-muted-foreground">Design a new proposal template for your team to use.</p>
        </div>

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
                Save Template
            </Button>
        </div>
      </form>
    </MainLayout>
  );
}
