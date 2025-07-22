
'use server';

/**
 * @fileOverview A flow for generating a cost-benefit analysis table.
 *
 * This flow takes a list of products in a proposal and a corresponding list of
 * current client costs to generate a structured table comparing the two,
 * highlighting the potential savings.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductCostSchema = z.object({
  name: z.string().describe('The name of the product or service.'),
  price: z.number().describe('The price of the product or service.'),
});

const CurrentClientCostSchema = z.object({
  name: z.string().describe('The name of the current item, service, or vendor.'),
  cost: z.number().describe('The current cost associated with this item.'),
});

const GenerateCostAnalysisInputSchema = z.object({
  proposedSolution: z.array(ProductCostSchema).describe('The list of products and their prices in our proposal.'),
  currentCosts: z.array(CurrentClientCostSchema).describe("The client's current costs for comparable services."),
});
export type GenerateCostAnalysisInput = z.infer<typeof GenerateCostAnalysisInputSchema>;


const TableRowSchema = z.array(z.string());

const CostAnalysisTableSchema = z.object({
    headers: z.array(z.string()).describe("The headers for the cost analysis table. Should include columns like 'Item', 'Current Cost', 'New Cost', and 'Savings'."),
    rows: z.array(TableRowSchema).describe("The rows of the table, where each row is an array of strings corresponding to the headers."),
    summary: z.string().describe("A brief, one or two-sentence summary of the total savings and value proposition."),
});

const GenerateCostAnalysisOutputSchema = z.object({
  analysis: CostAnalysisTableSchema,
});
export type GenerateCostAnalysisOutput = z.infer<typeof GenerateCostAnalysisOutputSchema>;


export async function generateCostAnalysis(
  input: GenerateCostAnalysisInput
): Promise<GenerateCostAnalysisOutput> {
  // If either list is empty, it's not possible to do a comparison.
  if (input.proposedSolution.length === 0 || input.currentCosts.length === 0) {
    throw new Error("Both proposed solution and current costs must be provided to generate an analysis.");
  }
  return generateCostAnalysisFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateCostAnalysisPrompt',
  input: { schema: GenerateCostAnalysisInputSchema },
  output: { schema: GenerateCostAnalysisOutputSchema },
  prompt: `You are a financial analyst expert specializing in creating compelling cost-benefit analysis tables for sales proposals.

**Your Task:**
Your goal is to compare the client's current costs with the proposed new solution and present it in a clear table format. You must also calculate the savings and provide a persuasive summary.

**Instructions:**
1.  **Map Items:** For each item in the 'Proposed Solution', find the most logically corresponding item in the 'Current Costs'.
2.  **Create Table Rows:** For each pair, create a row for the output table. The row should contain the item name, the current cost, the new cost, and the calculated savings (Current Cost - New Cost).
3.  **Handle Mismatches:** If an item in the proposed solution is new and has no direct equivalent, list its current cost as $0. If a current cost is being completely eliminated by the new solution, list its new cost as $0.
4.  **Calculate Totals:** Create a final row in the table that sums up the 'Current Cost', 'New Cost', and 'Total Savings' columns.
5.  **Generate Summary:** Write a concise, powerful summary (1-2 sentences) that highlights the total savings and the value of switching to the new solution.

**Input Data:**
---
**Proposed Solution:**
{{#each proposedSolution}}
- {{name}}: \${{price}}
{{/each}}
---
**Client's Current Costs:**
{{#each currentCosts}}
- {{name}}: \${{cost}}
{{/each}}
---

Now, generate the structured cost analysis output.
`,
});


const generateCostAnalysisFlow = ai.defineFlow(
  {
    name: 'generateCostAnalysisFlow',
    inputSchema: GenerateCostAnalysisInputSchema,
    outputSchema: GenerateCostAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate cost analysis from the AI model.');
    }
    return output;
  }
);
