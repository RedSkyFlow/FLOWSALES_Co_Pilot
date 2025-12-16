'use server';

import { z } from 'zod';
import { approveConfiguration } from '@/app/(protected)/settings/products/actions';

// Define the schemas for inputs and outputs of the Genkit flows
const ScrapeWebsiteInputSchema = z.object({
  url: z.string().url(),
  tenantId: z.string(),
});

const ScrapeWebsiteOutputSchema = z.object({
  logoUrl: z.string().url().optional(),
  brandColors: z.array(z.string()).optional(),
  toneOfVoice: z.string().optional(),
});

const AnalyzeConfiguratorInputSchema = z.object({
  documentContent: z.string(),
  userId: z.string(),
});

const AnalyzeConfiguratorOutputSchema = z.object({
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
  })),
  rules: z.array(z.object({
    type: z.string(),
    productIds: z.array(z.string()),
  })),
});

// Helper to call Genkit flows via HTTP
export async function callGenkitFlow<Input, Output>(flowName: string, input: Input): Promise<Output> {
  const response = await fetch(`${process.env.GENKIT_API_BASE_URL || '/api/genkit'}/${flowName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to call Genkit flow: ${flowName}`);
  }
  return response.json();
}

export async function runScrapeWebsiteFlow(data: z.infer<typeof ScrapeWebsiteInputSchema>) {
  return await callGenkitFlow<z.infer<typeof ScrapeWebsiteInputSchema>, z.infer<typeof ScrapeWebsiteOutputSchema>>(
    'scrapeWebsiteFlow',
    data
  );
}

export async function runAnalyzeConfiguratorFlow(data: z.infer<typeof AnalyzeConfiguratorInputSchema>) {
  return await callGenkitFlow<z.infer<typeof AnalyzeConfiguratorInputSchema>, z.infer<typeof AnalyzeConfiguratorOutputSchema>>(
    'ingestAndAnalyzeConfiguratorFlow',
    data
  );
}
