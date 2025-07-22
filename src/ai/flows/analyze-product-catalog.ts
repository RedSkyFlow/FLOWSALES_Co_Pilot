
'use server';

/**
 * @fileOverview A flow for analyzing a product catalog to suggest dependency rules.
 *
 * - analyzeProductCatalog - A function that takes product data and suggests rules.
 * - AnalyzeProductCatalogInput - The input type for the function.
 * - AnalyzeProductCatalogOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
});

const SuggestedRuleSchema = z.object({
    primaryProductId: z.string().describe('The ID of the product that triggers the rule.'),
    relatedProductIds: z.array(z.string()).describe('The IDs of the products affected by the rule.'),
    type: z.enum(['dependency', 'conflict', 'recommendation']).describe("The type of rule. Use 'dependency' for requirements, 'conflict' for items that cannot be sold together."),
    condition: z.enum(['requires_one', 'requires_all', 'conflicts_with']).describe("The condition of the rule. Use 'requires_one' for dependencies, 'conflicts_with' for conflicts."),
    explanation: z.string().describe("A brief, human-readable explanation of why this rule is being suggested."),
});

const AnalyzeProductCatalogInputSchema = z.object({
    products: z.array(ProductInfoSchema),
});
export type AnalyzeProductCatalogInput = z.infer<typeof AnalyzeProductCatalogInputSchema>;

const AnalyzeProductCatalogOutputSchema = z.object({
  suggestedRules: z.array(SuggestedRuleSchema),
});
export type AnalyzeProductCatalogOutput = z.infer<typeof AnalyzeProductCatalogOutputSchema>;

export async function analyzeProductCatalog(
  input: AnalyzeProductCatalogInput
): Promise<AnalyzeProductCatalogOutput> {
  if (input.products.length === 0) {
      return { suggestedRules: [] };
  }
  return analyzeProductCatalogFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeProductCatalogPrompt',
  input: { schema: AnalyzeProductCatalogInputSchema },
  output: { schema: AnalyzeProductCatalogOutputSchema },
  prompt: `You are an expert business analyst and system configurator. Your task is to analyze the following list of products and their descriptions to identify potential dependencies and conflicts.

**Instructions:**
1.  Read through the entire list of products.
2.  Identify logical relationships. For example, a 'Software License' might require a 'Hardware Device'. A 'Basic Support Plan' might conflict with a 'Premium Support Plan'.
3.  For each relationship you identify, create a rule object.
4.  The 'primaryProductId' and 'relatedProductIds' MUST correspond to the IDs from the input product list.
5.  Provide a clear, concise 'explanation' for each rule you suggest.

**Example Scenario:**
- If you see a product "Yealink T33G Phone" that needs power, and another product "PoE Switch", you should create a dependency rule.
- If you see "Standard Website" and "Premium Website", you should create a conflict rule.

**Product List for Analysis:**
---
{{#each products}}
ID: {{id}}
Name: {{name}}
Description: {{description}}
---
{{/each}}

Based on your analysis, provide a list of suggested rules. If no logical rules can be determined, return an empty array.
`,
});

const analyzeProductCatalogFlow = ai.defineFlow(
  {
    name: 'analyzeProductCatalogFlow',
    inputSchema: AnalyzeProductCatalogInputSchema,
    outputSchema: AnalyzeProductCatalogOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to analyze product catalog.');
    }
    return output;
  }
);
