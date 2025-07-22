
import { config } from 'dotenv';
config();

import '@/ai/flows/meeting-to-draft-proposal.ts';
import '@/ai/flows/generate-executive-summary.ts';
import '@/ai/flows/suggest-case-studies.ts';
import '@/ai/flows/analyze-meeting-transcript.ts';
import '@/ai/flows/generate-brand-analysis.ts';
import '@/ai/flows/generate-full-proposal.ts';
import '@/ai/flows/parse-product-list.ts';
import '@/ai/flows/generate-product-description.ts';
import '@/ai/flows/analyze-product-catalog.ts';
import '@/ai/flows/suggest-products-for-template.ts';
import '@/ai/flows/chat-assistant.ts';
import '@/ai/flows/ingest-document-for-template.ts';
import '@/ai/flows/generate-cost-analysis.ts';
