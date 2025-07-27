
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating a proposal template from a document.
 * This flow analyzes a raw text document, identifies logical sections, and structures
 * them into a proposal template format.
 *
 * - generateTemplateFromDocument - A function that takes document content and returns a structured template.
 * - GenerateTemplateFromDocumentInput - The input type for the flow.
 * - GenerateTemplateFromDocumentOutput - The output type for the flow (a structured template).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTemplateInputSchema = z.object({
  documentContent: z.string().describe('The full text content of the proposal document to be analyzed.'),
});
export type GenerateTemplateFromDocumentInput = z.infer<typeof GenerateTemplateInputSchema>;

const ProposalSectionSchema = z.object({
  title: z.string().describe('The title of the identified proposal section (e.g., "Executive Summary", "Scope of Work").'),
  content: z.string().describe('The full content belonging to that section.'),
  type: z.literal('template').describe("The type of the section, which should always be 'template'."),
});

const GenerateTemplateOutputSchema = z.object({
  sections: z.array(ProposalSectionSchema).describe('An array of structured sections identified from the document.'),
});
export type GenerateTemplateFromDocumentOutput = z.infer<typeof GenerateTemplateOutputSchema>;

// Exported wrapper function to be called from server actions
export async function generateTemplateFromDocument(
  input: GenerateTemplateFromDocumentInput
): Promise<GenerateTemplateFromDocumentOutput> {
  return generateTemplateFromDocumentFlow(input);
}

// Define the Genkit Prompt
const templateGenerationPrompt = ai.definePrompt({
  name: 'templateGenerationPrompt',
  input: { schema: GenerateTemplateInputSchema },
  output: { schema: GenerateTemplateOutputSchema },
  prompt: `You are an expert document analyst. Your task is to read the following document and break it down into a structured proposal template.

**Your Instructions:**
1.  **Identify Logical Sections:** Read through the entire document and identify distinct sections. Common section titles include "Introduction", "Executive Summary", "Problem Statement", "Proposed Solution", "Scope of Work", "Pricing", "Timeline", "About Us", "Terms and Conditions", etc.
2.  **Extract Content:** For each section you identify, extract its title and the complete content that falls under it.
3.  **Handle Unstructured Text:** If there is introductory text before the first clear section heading, group it into a section titled "Introduction".
4.  **Format Output:** Return the data as an array of section objects, where each object has a 'title', 'content', and a 'type' which must always be 'template'.

**Document to Analyze:**
---
{{{documentContent}}}
---

Now, analyze the document and provide the structured output.
`,
});

// Define the Genkit Flow
const generateTemplateFromDocumentFlow = ai.defineFlow(
  {
    name: 'generateTemplateFromDocumentFlow',
    inputSchema: GenerateTemplateInputSchema,
    outputSchema: GenerateTemplateOutputSchema,
  },
  async (input) => {
    const { output } = await templateGenerationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate template from document.');
    }
    return output;
  }
);
