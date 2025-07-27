
'use server';

/**
 * @fileOverview A flow for proposing business rules based on a product's details.
 *
 * - proposeProductRules - A function that suggests a rule for a product.
 * - ProposeProductRulesInput - The input type for the function.
 * - ProposeProductRulesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProposeProductRulesInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('The description of the product.'),
});
export type ProposeProductRulesInput = z.infer<
  typeof ProposeProductRulesInputSchema
>;

const ProposeProductRulesOutputSchema = z.object({
  proposedRule: z
    .string()
    .describe('A single, human-readable business rule or dependency suggestion. If no rule is obvious, state that.'),
});
export type ProposeProductRulesOutput = z.infer<
  typeof ProposeProductRulesOutputSchema
>;

export async function proposeProductRules(
  input: ProposeProductRulesInput
): Promise<ProposeProductRulesOutput> {
  return proposeProductRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'proposeProductRulesPrompt',
  input: { schema: ProposeProductRulesInputSchema },
  output: { schema: ProposeProductRulesOutputSchema },
  prompt: `You are an expert system configurator. Your task is to analyze a product's name and description to identify potential business logic, dependencies, or sales rules.

**Your Instructions:**
1.  Read the Product Name and Description carefully.
2.  Look for keywords like "requires," "must be paired with," "for every," "in addition to," "also needs," or other phrases that suggest a dependency on another product or a specific configuration.
3.  Formulate a single, clear, and concise rule based on your analysis.
4.  The rule should be a statement, not a question. E.g., "Propose adding a Power Adapter if no PoE Switch is in the quote."
5.  **If no clear rule or dependency is mentioned in the text, your output for the proposedRule field MUST be: "No specific rule suggestion."** Do not invent rules.

**Product Information:**
*   **Name:** {{{productName}}}
*   **Description:** {{{productDescription}}}

Analyze the information and provide a single proposed rule.
`,
});

const proposeProductRulesFlow = ai.defineFlow(
  {
    name: 'proposeProductRulesFlow',
    inputSchema: ProposeProductRulesInputSchema,
    outputSchema: ProposeProductRulesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
