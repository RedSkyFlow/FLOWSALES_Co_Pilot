
'use server';

/**
 * @fileOverview Defines the core "Document Intelligence" Genkit flow.
 * This flow analyzes an uploaded configuration document (like a spreadsheet or PDF)
 * and extracts a structured list of products and business rules.
 *
 * - ingestAndAnalyzeConfigurator - The main function to trigger the analysis.
 * - DocumentAnalysisInput - The input type for the flow.
 * - DocumentAnalysisOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z, GenkitError } from 'genkit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tenant } from '@/lib/types';


// Schema for a single product extracted from the document
const ExtractedProductSchema = z.object({
  name: z.string().describe('The name of the product or service.'),
  description: z.string().describe('A detailed description of the product.'),
  basePrice: z.number().describe('The selling price for the product.'),
  pricingModel: z.enum(['subscription', 'one-time', 'per_item']).describe('The pricing model for the product.'),
  type: z.enum(['product', 'service', 'license']).describe('The type of item.'),
});

// Schema for a single business rule extracted from the.
const ExtractedRuleSchema = z.object({
  name: z.string().describe('A short, descriptive name for the rule.'),
  description: z.string().describe('A detailed explanation of what the rule does and why it is needed.'),
  condition: z.string().describe('The condition that triggers the rule (e.g., "if product A is selected").'),
  action: z.string().describe('The action to take when the condition is met (e.g., "add product B").'),
});

// Input schema for the flow
const DocumentAnalysisInputSchema = z.object({
  tenantId: z.string().describe('The ID of the tenant requesting the analysis.'),
  documentDataUri: z.string().describe(
    "The configuration document (e.g., spreadsheet, PDF) as a data URI that must include a MIME type and use Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type DocumentAnalysisInput = z.infer<typeof DocumentAnalysisInputSchema>;

// Output schema for the flow
const DocumentAnalysisOutputSchema = z.object({
  products: z.array(ExtractedProductSchema).describe('A complete list of all products and services identified in the document.'),
  rules: z.array(ExtractedRuleSchema).describe('A list of all business rules, dependencies, and bundles identified.'),
});
export type DocumentAnalysisOutput = z.infer<typeof DocumentAnalysisOutputSchema>;


export async function ingestAndAnalyzeConfigurator(input: DocumentAnalysisInput): Promise<DocumentAnalysisOutput> {
  return ingestAndAnalyzeConfiguratorFlow(input);
}


const analysisPrompt = ai.definePrompt({
    name: 'documentAnalysisPrompt',
    model: googleAI.model('gemini-1.5-pro'),
    input: { schema: DocumentAnalysisInputSchema },
    output: { schema: DocumentAnalysisOutputSchema },
    prompt: `You are an expert business analyst and system configurator specializing in parsing complex sales documents.
    
Your task is to analyze the provided document (which could be a spreadsheet, a proposal, or a price list) and extract a complete and structured list of all products and business rules.

**Instructions:**
1.  **Analyze the Document Holistically:** Use the document's structure, layout, text, and any embedded notes or formulas to understand the products and their relationships.
2.  **Extract Products:** Identify every distinct product, service, or line item. For each, extract its name, a clear description, its price, its pricing model (e.g., 'one-time', 'subscription'), and its type (e.g., 'product', 'service').
3.  **Extract Business Rules:** Carefully identify all business logic. This includes:
    - **Dependencies:** e.g., "Product A requires Product B."
    - **Bundles:** e.g., "Product C is always sold with Product D."
    - **Exclusions:** e.g., "Cannot sell Product X with Product Y."
    - **Quantitative Rules:** e.g., "For every 10 units of Product A, add 1 unit of Product B."
    - **Conditional Logic:** e.g., "If no PoE switch is in the quote, add a power adapter for this phone."
    
For each rule, provide a name, a detailed description, the condition that triggers it, and the action to be taken.

**Document for Analysis:**
{{media url=documentDataUri}}

Analyze the document and provide the structured JSON output.
`,
});

const ingestAndAnalyzeConfiguratorFlow = ai.defineFlow(
    {
        name: 'ingestAndAnalyzeConfiguratorFlow',
        inputSchema: DocumentAnalysisInputSchema,
        outputSchema: DocumentAnalysisOutputSchema,
    },
    async (input) => {
        console.time('ingestAndAnalyzeConfiguratorFlow');

        // Step 1: Check user's subscription tier
        console.time('firestore-query');
        const tenantRef = doc(db, 'tenants', input.tenantId);
        const tenantSnap = await getDoc(tenantRef);
        console.timeEnd('firestore-query');
        
        if (!tenantSnap.exists()) {
            throw new GenkitError({
                status: 'NOT_FOUND',
                message: 'Tenant not found.'
            });
        }
        
        const tenantData = tenantSnap.data() as Tenant;
        const tier = tenantData.subscription.tier;

        if (tier !== 'pro' && tier !== 'enterprise') {
            throw new GenkitError({
                status: 'PERMISSION_DENIED',
                message: `Your current subscription tier ('${tier}') does not have access to the Document Intelligence Engine. Please upgrade to 'pro' or 'enterprise'.`
            });
        }
        
        // Step 2: Proceed with analysis if authorized
        console.time('ai-analysis');
        const { output } = await analysisPrompt(input);
        console.timeEnd('ai-analysis');

        if (!output) {
            throw new Error('Failed to analyze the configuration document.');
        }
        
        console.timeEnd('ingestAndAnalyzeConfiguratorFlow');
        return output;
    }
);
