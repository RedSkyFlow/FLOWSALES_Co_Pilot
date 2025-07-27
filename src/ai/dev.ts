import { config } from 'dotenv';
config();

import '@/ai/flows/meeting-to-draft-proposal.ts';
import '@/ai/flows/generate-executive-summary.ts';
import '@/ai/flows/suggest-case-studies.ts';
import '@/ai/flows/analyze-meeting-transcript.ts';
import '@/ai/flows/generate-template-from-document.ts';
