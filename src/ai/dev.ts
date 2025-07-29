import { configure, defineFlow, onFlow } from 'genkit';
import { firebase as firebasePlugin } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import { UserRecord } from 'firebase-functions/v1/auth';
import { db } from '../lib/firebase';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from '../lib/types';
import * as cheerio from 'cheerio';
import { geminiPro } from '@genkit-ai/googleai';
import { secret } from 'genkit/secrets'; // For connectCrmFlow

// This is the single entry point for all backend Genkit flows.
// It is only loaded on the server and is never part of the client bundle.

configure({
  plugins: [firebasePlugin(), googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// =================================================================================================
// AUTHENTICATION TRIGGERS
// =================================================================================================

export const onUserCreateFlow = onFlow(
  {
    name: 'onUserCreateFlow',
    trigger: { provider: 'firebase.auth.user', event: 'create' },
    outputSchema: z.string().promise(),
  },
  async (user: UserRecord): Promise<string> => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const existingData = userSnap.data() as User;
      return existingData.tenantId;
    }

    const newTenantRef = await addDoc(collection(db, 'tenants'), {
      companyName: `${user.displayName || 'New User'}'s Workspace`,
      createdAt: new Date().toISOString(),
      subscription: { tier: 'basic', status: 'trialing' },
    });
    const tenantId = newTenantRef.id;

    const newUser: User = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      role: 'admin',
      tenantId: tenantId,
    };
    await setDoc(userRef, newUser);

    return tenantId;
  }
);

// =================================================================================================
// ONBOARDING FLOWS (callable via HTTP)
// =================================================================================================

export const scrapeWebsiteFlow = defineFlow(
  {
    name: 'scrapeWebsiteFlow',
    inputSchema: z.object({ url: z.string().url(), tenantId: z.string() }),
    outputSchema: z.object({
      logoUrl: z.string().url().optional(),
      brandColors: z.array(z.string()).optional(),
      toneOfVoice: z.string().optional(),
    }),
  },
  async ({ url, tenantId }) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch website: ${response.statusText}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    let logoUrl = $('meta[property="og:image"]').attr('content') || $('link[rel="icon"]').attr('href');
    if (logoUrl && !logoUrl.startsWith('http')) {
      logoUrl = new URL(logoUrl, url).href;
    }

    const brandColors: string[] = [];
    $('[style*="background-color"]').each((i, element) => {
      const style = $(element).attr('style');
      const colorMatch = style?.match(/#[0-9a-fA-F]{3,6}/);
      if (colorMatch && colorMatch[0]) brandColors.push(colorMatch[0]);
    });
    const uniqueColors = [...new Set(brandColors)].slice(0, 5);

    const textContent = $('h1, h2, p').text().replace(/\s\s+/g, ' ').trim().slice(0, 2000);

    const llmResponse = await genkit.generate({
      prompt: `Describe the brand's tone of voice in 2-3 words based on this text: "${textContent}"`,
      model: geminiPro,
    });
    const toneOfVoice = llmResponse.text();

    // In a real app, you would have a dedicated server action to save brand assets
    // await saveBrandAssets({ ...brandAssets, tenantId });

    return { logoUrl, brandColors: uniqueColors, toneOfVoice };
  }
);

export const ingestAndAnalyzeConfiguratorFlow = defineFlow(
  {
    name: 'ingestAndAnalyzeConfiguratorFlow',
    inputSchema: z.object({ documentContent: z.string(), userId: z.string() }),
    outputSchema: z.object({
      products: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
      })),
      rules: z.array(z.object({
        type: z.string(),
        productIds: z.array(z.string()),
      })),
    }),
  },
  async ({ documentContent, userId }) => {
    // Placeholder for actual multi-modal analysis
    // For now, return mock data
    console.log(`Analyzing document for user ${userId}: ${documentContent.substring(0, 50)}...`);

    return {
      products: [
        { id: 'mock-prod-1', name: 'Mock Product A', price: 100 },
        { id: 'mock-prod-2', name: 'Mock Product B', price: 200 },
      ],
      rules: [
        { type: 'dependency', productIds: ['mock-prod-1', 'mock-prod-2'] },
      ],
    };
  }
);

export const generateTemplateFromDocumentFlow = defineFlow(
  {
    name: 'generateTemplateFromDocumentFlow',
    inputSchema: z.object({ documentDataUri: z.string() }),
    outputSchema: z.object({
      sections: z.array(z.object({
        type: z.string(),
        content: z.string(),
      })),
    }),
  },
  async ({ documentDataUri }) => {
    // Placeholder for actual multi-modal analysis
    console.log(`Generating template from document: ${documentDataUri.substring(0, 50)}...`);

    return {
      sections: [
        { type: 'Introduction', content: 'This is a sample introduction.' },
        { type: 'Pricing', content: 'Pricing details go here.' },
      ],
    };
  }
);

const salesforceApiSecret = secret('salesforce-api-key');
const hubspotApiSecret = secret('hubspot-api-key');

export const connectCrmFlow = defineFlow(
  {
    name: 'connectCrmFlow',
    inputSchema: z.object({
      crmType: z.enum(['salesforce', 'hubspot']),
      apiKey: z.string(), 
      tenantId: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ crmType, apiKey, tenantId }) => {
    // Simulate API key validation
    let isValid = false;
    if (crmType === 'salesforce') {
      isValid = apiKey === salesforceApiSecret.value;
    } else if (crmType === 'hubspot') {
      isValid = apiKey === hubspotApiSecret.value;
    }

    if (!isValid) {
      return { success: false, message: 'Connection failed: Invalid API Key.' };
    }

    console.log(`Successfully connected to ${crmType} for tenant ${tenantId}.`);
    return { success: true, message: `Successfully connected to ${crmType}.` };
  }
);
