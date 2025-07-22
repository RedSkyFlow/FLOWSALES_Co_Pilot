
'use server';

/**
 * @fileOverview An AI flow to suggest relevant products for a given proposal template.
 *
 * - suggestProductsForTemplate - A function that suggests products based on a template's context.
 * - SuggestProductsForTemplateInput - The input type for the function.
 * - SuggestProductsForTemplateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Product } from '@/lib/types';

const ProductSchemaForAnalysis = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
});

const SuggestProductsForTemplateInputSchema = z.object({
  templateName: z.string().describe('The name of the proposal template being used.'),
  templateDescription: z.string().describe('The description of the proposal template.'),
  availableProducts: z.array(ProductSchemaForAnalysis).describe('The full list of available products in the catalog.'),
});
export type SuggestProductsForTemplateInput = z.infer<typeof SuggestProductsForTemplateInputSchema>;

const SuggestProductsForTemplateOutputSchema = z.object({
  suggestedProductIds: z.array(z.string()).describe('An array of product IDs that are most relevant for this template.'),
});
export type SuggestProductsForTemplateOutput = z.infer<typeof SuggestProductsForTemplateOutputSchema>;

export async function suggestProductsForTemplate(
  input: SuggestProductsForTemplateInput
): Promise<SuggestProductsForTemplateOutput> {
  if (input.availableProducts.length === 0) {
      return { suggestedProductIds: [] };
  }
  return suggestProductsForTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProductsForTemplatePrompt',
  input: { schema: SuggestProductsForTemplateInputSchema },
  output: { schema: SuggestProductsForTemplateOutputSchema },
  prompt: `You are an expert sales solutions architect. Your task is to analyze a proposal template and a product catalog to suggest the most relevant products for that proposal.

**Context:**
- Template Name: {{{templateName}}}
- Template Description: {{{templateDescription}}}

**Instructions:**
1.  Read the template name and description to understand the proposal's purpose (e.g., is it for a stadium, a retail store, a small business?).
2.  Review the entire list of available products.
3.  Based on the template's context, select the products that would logically be included in such a proposal.
4.  Return only the IDs of the products you suggest. Do not include products that are not relevant.

**Available Products:**
---
{{#each availableProducts}}
ID: {{id}}
Name: {{name}}
Description: {{description}}
---
{{/each}}

Based on your analysis, provide a list of suggested product IDs. If no products seem relevant, return an empty array.
`,
});

const suggestProductsForTemplateFlow = ai.defineFlow(
  {
    name: 'suggestProductsForTemplateFlow',
    inputSchema: SuggestProductsForTemplateInputSchema,
    outputSchema: SuggestProductsForTemplateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to get product suggestions from the AI model.');
    }
    return output;
  }
);
