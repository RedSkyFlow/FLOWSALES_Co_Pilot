
'use server';

/**
 * @fileOverview A flow for parsing an unstructured list of products into a structured array.
 *
 * - parseProductList - A function that takes a raw string and returns an array of product objects.
 * - ParseProductListInput - The input type for the function.
 * - ParseProductListOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductSchema = z.object({
    name: z.string().describe('The name of the product or service.'),
    description: z.string().describe('A brief description of the product.'),
    basePrice: z.number().describe('The price of the product. Extract only the number.'),
    type: z.enum(['product', 'service', 'license']).optional().describe("Categorize as 'product', 'service', or 'license'. Default to 'product' if unsure."),
    pricingModel: z.enum(['subscription', 'one-time', 'per_item']).optional().describe("Categorize as 'subscription', 'one-time', or 'per_item'. Default to 'one-time' if unsure."),
    tags: z.array(z.string()).optional().describe('A list of relevant keywords or tags.'),
});

const ParseProductListInputSchema = z.string();
export type ParseProductListInput = z.infer<typeof ParseProductListInputSchema>;

const ParseProductListOutputSchema = z.object({
  products: z.array(ProductSchema).describe('The array of structured product objects.'),
});
export type ParseProductListOutput = z.infer<typeof ParseProductListOutputSchema>;

export async function parseProductList(
  input: ParseProductListInput
): Promise<ParseProductListOutput> {
  return parseProductListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseProductListPrompt',
  input: { schema: ParseProductListInputSchema },
  output: { schema: ParseProductListOutputSchema },
  prompt: `You are an expert data entry assistant. Your task is to parse the following unstructured text, which contains a list of products or services, into a structured JSON array of product objects.

Each product must have a 'name', 'description', and a 'basePrice'.
- The 'name' should be the product title.
- The 'description' should be a concise summary.
- The 'basePrice' must be a number. Do not include currency symbols.

Infer other fields like 'type' or 'pricingModel' if possible, otherwise use sensible defaults ('product', 'one-time').

Here is the raw text to parse:
---
{{{input}}}
---

Provide the structured JSON output.
`,
});

const parseProductListFlow = ai.defineFlow(
  {
    name: 'parseProductListFlow',
    inputSchema: ParseProductListInputSchema,
    outputSchema: ParseProductListOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to parse the product list.');
    }
    return output;
  }
);
