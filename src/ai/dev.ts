
import { genkit, z } from 'genkit';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { UserRecord } from 'firebase-functions/v1/auth';
import { db } from '../lib/firebase';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from '../lib/types';
import * as cheerio from 'cheerio';
import { defineSecret } from 'genkit/secrets';

const ai = genkit({
  plugins: [firebase(), googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const onUserCreateFlow = ai.defineFlow(
  {
    name: 'onUserCreateFlow',
    trigger: {
      provider: 'firebase.auth',
      onUserCreate: true,
    },
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

export const scrapeWebsiteFlow = ai.defineFlow(
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

    const llmResponse = await ai.generate({
      prompt: `Describe the brand's tone of voice in 2-3 words based on this text: "${textContent}"`,
      model: googleAI.model('gemini-1.5-flash'),
    });
    const toneOfVoice = llmResponse.text();

    return { logoUrl, brandColors: uniqueColors, toneOfVoice };
  }
);

export const ingestAndAnalyzeConfiguratorFlow = ai.defineFlow(
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

export const generateTemplateFromDocumentFlow = ai.defineFlow(
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
    console.log(`Generating template from document: ${documentDataUri.substring(0, 50)}...`);

    return {
      sections: [
        { type: 'Introduction', content: 'This is a sample introduction.' },
        { type: 'Pricing', content: 'Pricing details go here.' },
      ],
    };
  }
);

const salesforceApiSecret = defineSecret('salesforce-api-key');
const hubspotApiSecret = defineSecret('hubspot-api-key');

export const connectCrmFlow = ai.defineFlow(
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
