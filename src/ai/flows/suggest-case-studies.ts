// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview AI-powered case study suggestion agent.
 *
 * - suggestCaseStudies - A function that suggests relevant case studies.
 * - SuggestCaseStudiesInput - The input type for the suggestCaseStudies function.
 * - SuggestCaseStudiesOutput - The return type for the suggestCaseStudies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCaseStudiesInputSchema = z.object({
  clientDescription: z
    .string()
    .describe('Description of the client and their business needs.'),
  proposalContext: z
    .string()
    .describe('Context of the proposal, including modules selected.'),
  contentLibrary: z
    .string()
    .describe('The content library to search for relevant case studies.'),
});

export type SuggestCaseStudiesInput = z.infer<typeof SuggestCaseStudiesInputSchema>;

const SuggestCaseStudiesOutputSchema = z.object({
  caseStudies: z
    .array(z.string())
    .describe('An array of relevant case studies from the content library.'),
});

export type SuggestCaseStudiesOutput = z.infer<typeof SuggestCaseStudiesOutputSchema>;

export async function suggestCaseStudies(
  input: SuggestCaseStudiesInput
): Promise<SuggestCaseStudiesOutput> {
  return suggestCaseStudiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCaseStudiesPrompt',
  input: {schema: SuggestCaseStudiesInputSchema},
  output: {schema: SuggestCaseStudiesOutputSchema},
  prompt: `You are an AI assistant helping sales agents suggest relevant case studies for their proposals.

  Based on the client description, proposal context, and content library, suggest the most relevant case studies.

  Client Description: {{{clientDescription}}}
  Proposal Context: {{{proposalContext}}}
  Content Library: {{{contentLibrary}}}

  Return an array of case studies that would be most relevant to strengthen the proposal.
  `,
});

const suggestCaseStudiesFlow = ai.defineFlow(
  {
    name: 'suggestCaseStudiesFlow',
    inputSchema: SuggestCaseStudiesInputSchema,
    outputSchema: SuggestCaseStudiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
