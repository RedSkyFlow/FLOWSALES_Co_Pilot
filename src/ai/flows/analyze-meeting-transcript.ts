
'use server';

/**
 * @fileOverview Defines a Genkit flow for real-time meeting intelligence.
 * This flow analyzes a meeting transcript with speaker diarization to extract
 * key information and generate a structured draft proposal.
 *
 * - analyzeMeetingTranscript - A function that takes a transcript and returns a draft proposal structure.
 * - AnalyzeMeetingTranscriptInput - The input type for the flow.
 * - AnalyzeMeetingTranscriptOutput - The output type for the flow (a structured draft proposal).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for a speaker-stamped line in the transcript
const TranscriptLineSchema = z.object({
  speaker: z.string().describe('Identifier for the speaker (e.g., "Agent", "Client").'),
  text: z.string().describe('The text spoken by the speaker.'),
});

// Define the input schema for our main flow
const AnalyzeMeetingTranscriptInputSchema = z.object({
  transcript: z
    .array(TranscriptLineSchema)
    .describe('The full meeting transcript with speaker diarization.'),
  availableModules: z
    .array(z.string())
    .describe('A list of available module names to select from.'),
});
export type AnalyzeMeetingTranscriptInput = z.infer<
  typeof AnalyzeMeetingTranscriptInputSchema
>;

// Define the structured output we want from the AI
const DraftProposalSchema = z.object({
  clientPainPoints: z
    .array(z.string())
    .describe('A list of specific pain points or challenges mentioned by the client.'),
  suggestedModules: z
    .array(z.string())
    .describe('A list of module names from the provided `availableModules` that are relevant to the client\'s needs.'),
  extractedBudget: z
    .string()
    .optional()
    .describe('Any mention of budget constraints or figures by the client.'),
  extractedTimeline: z
    .string()
    .optional()
    .describe('Any mention of project timelines or deadlines.'),
  keyDecisionMakers: z
    .array(z.string())
    .optional()
    .describe('Names or titles of key decision-makers mentioned in the meeting.'),
  problemStatementDraft: z
    .string()
    .describe('A draft "Problem Statement" section for the proposal, based on the client\'s pain points.'),
    solutionProposalDraft: z
    .string()
    .describe('A draft "Proposed Solution" section, highlighting how the suggested modules address the problems.'),
});
export type AnalyzeMeetingTranscriptOutput = z.infer<typeof DraftProposalSchema>;

// Exported wrapper function to be called from the frontend
export async function analyzeMeetingTranscript(
  input: AnalyzeMeetingTranscriptInput
): Promise<AnalyzeMeetingTranscriptOutput> {
  return analyzeMeetingTranscriptFlow(input);
}

// Define the Genkit Prompt
const meetingAnalysisPrompt = ai.definePrompt({
  name: 'meetingAnalysisPrompt',
  input: { schema: AnalyzeMeetingTranscriptInputSchema },
  output: { schema: DraftProposalSchema },
  prompt: `You are an expert sales co-pilot embedded in a real-time meeting.
Your task is to analyze the following meeting transcript and generate a structured draft for a sales proposal.

The sales agent is "Agent", and the potential customer is "Client". If you cannot determine who is who, assume any speaker who is not the agent is the client.

**Your Instructions:**
1.  **Identify Pain Points:** Carefully read the client's statements and list their primary business challenges and pain points.
2.  **Suggest Modules:** Based on the client's needs, select the most relevant modules from the list of available modules. Do not suggest modules that are not on the list.
3.  **Extract Key Information:** Listen for any mentions of budget, project timelines, and the names or titles of decision-makers.
4.  **Draft Content:** Write a concise "Problem Statement" summarizing the client's challenges and a "Proposed Solution" that explains how the suggested modules will solve these problems.

**Available Modules:**
{{#each availableModules}}
- {{{this}}}
{{/each}}

**Meeting Transcript:**
{{#each transcript}}
**{{speaker}}:** {{text}}
{{/each}}

Now, analyze the transcript and provide the structured output.
`,
});

// Define the Genkit Flow
const analyzeMeetingTranscriptFlow = ai.defineFlow(
  {
    name: 'analyzeMeetingTranscriptFlow',
    inputSchema: AnalyzeMeetingTranscriptInputSchema,
    outputSchema: DraftProposalSchema,
  },
  async (input) => {
    const { output } = await meetingAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to generate proposal analysis from transcript.');
    }
    return output;
  }
);
