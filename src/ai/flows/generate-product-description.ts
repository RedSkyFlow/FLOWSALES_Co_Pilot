
'use server';

/**
 * @fileOverview A flow for generating a product description.
 *
 * - generateProductDescription - A function that generates a compelling product description.
 * - GenerateProductDescriptionInput - The input type for the function.
 * - GenerateProductDescriptionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productType: z.enum(['product', 'service', 'license']).describe('The type of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const generationPrompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  prompt: `You are an expert marketing copywriter. Your task is to write a compelling, concise product description.

The description should be one to two sentences long and highlight the key benefit of the product.

Product Name: {{{productName}}}
Product Type: {{{productType}}}

Generate the description now.
`,
});

const proofreadingPrompt = ai.definePrompt({
    name: 'proofreadProductDescriptionPrompt',
    input: { schema: GenerateProductDescriptionOutputSchema },
    output: { schema: GenerateProductDescriptionOutputSchema },
    prompt: `You are an expert proofreader. Your task is to correct any spelling or grammar mistakes in the following product description.
    
Do not change the meaning or style. Only correct errors. If there are no errors, return the original text.

Original Text:
"{{{description}}}"

Return only the corrected description in the required format.
`,
});


const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the initial creative description
    const generationResult = await generationPrompt(input);
    if (!generationResult.output) {
      throw new Error('Failed to generate initial product description.');
    }

    // Step 2: Proofread the generated description for quality control
    const proofreadingResult = await proofreadingPrompt(generationResult.output);
    if (!proofreadingResult.output) {
      // If proofreading fails, fall back to the original to avoid complete failure
      return generationResult.output;
    }
    
    return proofreadingResult.output;
  }
);
