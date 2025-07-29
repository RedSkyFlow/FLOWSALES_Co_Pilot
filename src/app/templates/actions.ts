'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { callGenkitFlow } from '@/app/(protected)/settings/onboarding/actions';

const TemplateInputSchema = z.object({
  documentContent: z.string(),
  tenantId: z.string(),
});

const GenerateTemplateOutputSchema = z.object({
  sections: z.array(z.object({
    type: z.string(),
    content: z.string(),
  })),
});

/**
 * Server action to trigger the AI-powered document-to-template creation process.
 *
 * @param data The document content and tenant ID.
 * @returns An object indicating success or failure.
 */
export async function createTemplateFromDoc(data: z.infer<typeof TemplateInputSchema>) {
  const validation = TemplateInputSchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid data provided.' };
  }

  const { documentContent, tenantId } = validation.data;

  try {
    // Step 1: Call the Genkit flow to get the structured data
    const { sections } = await callGenkitFlow<{
      documentDataUri: string; // Genkit flow expects this specific field name
    }, z.infer<typeof GenerateTemplateOutputSchema>>(
      'generateTemplateFromDocumentFlow',
      { documentDataUri: documentContent } // Pass the content in the expected format
    );

    if (!sections || sections.length === 0) {
      return { error: 'The AI could not extract any sections from the document.' };
    }
    
    // Step 2: Save the new template to the tenant's subcollection
    const templatesCollectionRef = collection(db, 'tenants', tenantId, 'proposal_templates');
    const newTemplateDoc = {
      name: `New Template from Document - ${new Date().toLocaleDateString()}`,
      sections,
      createdAt: new Date(),
    };
    
    await addDoc(templatesCollectionRef, newTemplateDoc);

    // Step 3: Revalidate the templates page to show the new data
    revalidatePath('/templates');
    
    return { success: true };
  } catch (error) {
    console.error("Error creating template from document:", error);
    return { error: 'An unexpected error occurred while creating the template.' };
  }
}
