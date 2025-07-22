
'use server';

/**
 * @fileOverview A flow for analyzing a company's branding from a URL or image.
 *
 * - generateBrandAnalysis - A function that analyzes branding material.
 * - GenerateBrandAnalysisInput - The input type.
 * - GenerateBrandAnalysisOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBrandAnalysisInputSchema = z.object({
  websiteUrl: z.string().url().optional().describe('The URL of the company website to analyze.'),
  imageDataUri: z.string().optional().describe("An image of the brand (screenshot, logo, etc.) as a data URI."),
});
export type GenerateBrandAnalysisInput = z.infer<typeof GenerateBrandAnalysisInputSchema>;

const GenerateBrandAnalysisOutputSchema = z.object({
  primaryColor: z.string().describe('The extracted primary color in hex format (e.g., #RRGGBB).'),
  secondaryColor: z.string().describe('The extracted secondary color in hex format (e.g., #RRGGBB).'),
  brandVoice: z.string().describe('A summary of the brand voice and tone, described in 2-3 sentences.'),
  companyAddress: z.string().optional().describe("The company's primary physical address."),
  companyPhone: z.string().optional().describe("The company's primary contact phone number."),
  companyEmail: z.string().optional().describe("The company's primary contact email address."),
});
export type GenerateBrandAnalysisOutput = z.infer<typeof GenerateBrandAnalysisOutputSchema>;

export async function generateBrandAnalysis(
  input: GenerateBrandAnalysisInput
): Promise<GenerateBrandAnalysisOutput> {
  if (!input.websiteUrl && !input.imageDataUri) {
    throw new Error('Either a website URL or an image data URI must be provided.');
  }
  return generateBrandAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBrandAnalysisPrompt',
  input: { schema: GenerateBrandAnalysisInputSchema },
  output: { schema: GenerateBrandAnalysisOutputSchema },
  prompt: `You are a professional brand and data analyst. Analyze the provided source material (either a website URL or an image) to determine the company's branding and contact information.
  
**Your Tasks:**
1.  **Identify Branding:** Determine the primary and secondary colors and summarize the brand's voice and tone.
2.  **Extract Contact Information:** Scour the website, especially the footer and any 'Contact Us' page, for the main company address, phone number, and general contact email address.
3.  **Format Output:** Provide colors in hex format (#RRGGBB). The brand voice summary should be concise (2-3 sentences).

{{#if websiteUrl}}
Analyze the website at this URL: {{{websiteUrl}}}
{{/if}}

{{#if imageDataUri}}
Analyze this image: {{media url=imageDataUri}}
{{/if}}

Provide the structured output based on your analysis.
`,
});

const generateBrandAnalysisFlow = ai.defineFlow(
  {
    name: 'generateBrandAnalysisFlow',
    inputSchema: GenerateBrandAnalysisInputSchema,
    outputSchema: GenerateBrandAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate brand analysis.');
    }
    return output;
  }
);
