
'use server';

/**
 * @fileOverview A flow for creating a structured proposal template from an unstructured document.
 *
 * - ingestDocumentForTemplate - A function that takes raw text and returns a structured template.
 * - IngestDocumentForTemplateInput - The input type for the function.
 * - IngestDocumentForTemplateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProposalSectionSchema = z.object({
    title: z.string().describe('The title of the proposal section.'),
    content: z.string().describe('The full content of the proposal section.'),
    type: z.literal('template').describe("The type should always be 'template' for this use case."),
});

const IngestDocumentForTemplateInputSchema = z.string().describe('The raw text content of a document to be parsed.');
export type IngestDocumentForTemplateInput = z.infer<typeof IngestDocumentForTemplateInputSchema>;

const IngestDocumentForTemplateOutputSchema = z.object({
  sections: z.array(ProposalSectionSchema).describe('The array of structured proposal sections extracted from the document.'),
});
export type IngestDocumentForTemplateOutput = z.infer<typeof IngestDocumentForTemplateOutputSchema>;

export async function ingestDocumentForTemplate(
  input: IngestDocumentForTemplateInput
): Promise<IngestDocumentForTemplateOutput> {
  if (!input.trim()) {
      return { sections: [] };
  }
  return ingestDocumentForTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ingestDocumentForTemplatePrompt',
  input: { schema: IngestDocumentForTemplateInputSchema },
  output: { schema: IngestDocumentForTemplateOutputSchema },
  prompt: `You are an expert document analyst. Your task is to parse the following unstructured text from a proposal or template document into a structured array of sections.

**Instructions:**
1.  Read the entire document content.
2.  Identify the main sections. A new section is often denoted by a clear heading (e.g., "Executive Summary", "Our Solution", "Pricing", "Terms and Conditions").
3.  For each section you identify, extract the heading as the 'title'.
4.  Consolidate all the text under that heading until the next heading as the 'content'.
5.  Format the output as a clean array of section objects. Each object must have a 'title' and 'content'.
6.  The 'type' for each section must be set to 'template'.

Here is the raw document text to parse:
---
{{{input}}}
---

Provide the structured JSON output.
`,
});

const ingestDocumentForTemplateFlow = ai.defineFlow(
  {
    name: 'ingestDocumentForTemplateFlow',
    inputSchema: IngestDocumentForTemplateInputSchema,
    outputSchema: IngestDocumentForTemplateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to parse the document into a template.');
    }
    return output;
  }
);
