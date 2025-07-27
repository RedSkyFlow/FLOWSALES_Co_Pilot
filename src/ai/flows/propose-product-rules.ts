
'use server';

/**
 * @fileOverview A flow for proposing business rules based on a product's details.
 *
 * - proposeProductRules - A function that suggests a rule for a product.
 * - ProposeProductRulesInput - The input type for the function.
 * - ProposeProductRulesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
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
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: ProposeProductRulesInputSchema },
  output: { schema: ProposeProductRulesOutputSchema },
  prompt: `You are an expert system configurator. Your task is to analyze a product's name and description to identify potential business logic, dependencies, or sales rules.

**Your Instructions:**
1.  **Analyze Holistically:** Read the Product Name and Description to understand its function and context.
2.  **Identify Dependencies:** Look for keywords like "requires," "with," "for," "add-on," "module," or other phrases that suggest a dependency. Think about what other products or services would logically be sold with this item. For example, a physical phone needs a power source or a phone line service.
3.  **Formulate a Clear Rule:** Create a single, clear, and concise rule. The rule should be a actionable statement for a salesperson.
    - Good Example: "Propose adding a Power Adapter if a PoE Switch is not already in the quote."
    - Good Example: "For every 10 IP Phones, suggest adding 1 conference phone license."
    - Bad Example: "This phone needs power."
4.  **Default Action:** If, after careful analysis, you can't determine a logical dependency or rule (e.g., for a simple consulting service), your output for the proposedRule field MUST be: "No specific rule suggestion." Do not invent rules where none are plausible.

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
