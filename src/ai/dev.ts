
import { config } from 'dotenv';
config();

import '@/ai/flows/meeting-to-draft-proposal.ts';
import '@/ai/flows/generate-executive-summary.ts';
import '@/ai/flows/suggest-case-studies.ts';
import '@/ai/flows/analyze-meeting-transcript.ts';
import '@/ai/flows/generate-template-from-document.ts';
import '@/ai/flows/propose-product-rules.ts';
import '@/ai/flows/ingest-and-analyze-configurator.ts';
