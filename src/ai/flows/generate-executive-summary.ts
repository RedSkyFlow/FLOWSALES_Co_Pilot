'use server';

/**
 * @fileOverview A flow for generating an executive summary for a proposal based on client pain points.
 *
 * - generateExecutiveSummary - A function that generates the executive summary.
 * - GenerateExecutiveSummaryInput - The input type for the generateExecutiveSummary function.
 * - GenerateExecutiveSummaryOutput - The return type for the generateExecutiveSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExecutiveSummaryInputSchema = z.object({
  clientPainPoints: z
    .string()
    .describe('Key pain points and challenges the client is facing.'),
  proposalType: z
    .string()
    .describe(
      'The type of proposal (e.g., Stadium OS Proposal, Shopping Mall Pilot Proposal, Telco Proposal)'
    ),
});
export type GenerateExecutiveSummaryInput = z.infer<
  typeof GenerateExecutiveSummaryInputSchema
>;

const GenerateExecutiveSummaryOutputSchema = z.object({
  executiveSummary: z
    .string()
    .describe('The generated executive summary for the proposal.'),
});
export type GenerateExecutiveSummaryOutput = z.infer<
  typeof GenerateExecutiveSummaryOutputSchema
>;

export async function generateExecutiveSummary(
  input: GenerateExecutiveSummaryInput
): Promise<GenerateExecutiveSummaryOutput> {
  return generateExecutiveSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveSummaryPrompt',
  input: {schema: GenerateExecutiveSummaryInputSchema},
  output: {schema: GenerateExecutiveSummaryOutputSchema},
  prompt: `You are an expert sales copywriter specializing in writing executive summaries for proposals.

You will use the following information to generate a compelling and concise executive summary for the proposal.

Proposal Type: {{{proposalType}}}
Client Pain Points: {{{clientPainPoints}}}

Write a compelling executive summary that addresses the client's pain points and introduces the proposed solution.
The executive summary should be no more than 3 paragraphs long.
`,
});

const generateExecutiveSummaryFlow = ai.defineFlow(
  {
    name: 'generateExecutiveSummaryFlow',
    inputSchema: GenerateExecutiveSummaryInputSchema,
    outputSchema: GenerateExecutiveSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
