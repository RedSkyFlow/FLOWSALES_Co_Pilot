'use server';

/**
 * @fileOverview This file defines a Genkit flow that converts meeting transcripts into draft proposals.
 *
 * - meetingToDraftProposal - A function that takes a meeting transcript and returns a draft proposal.
 * - MeetingToDraftProposalInput - The input type for the meetingToDraftProposal function.
 * - MeetingToDraftProposalOutput - The return type for the meetingToDraftProposal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MeetingToDraftProposalInputSchema = z.object({
  meetingTranscript: z
    .string()
    .describe('The transcript of the sales meeting.'),
  template: z
    .string()
    .describe('The sales proposal template being used.'),
});
export type MeetingToDraftProposalInput = z.infer<typeof MeetingToDraftProposalInputSchema>;

const MeetingToDraftProposalOutputSchema = z.object({
  draftProposal: z
    .string()
    .describe('The generated draft proposal in markdown format.'),
});
export type MeetingToDraftProposalOutput = z.infer<typeof MeetingToDraftProposalOutputSchema>;

export async function meetingToDraftProposal(input: MeetingToDraftProposalInput): Promise<MeetingToDraftProposalOutput> {
  return meetingToDraftProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'meetingToDraftProposalPrompt',
  input: {schema: MeetingToDraftProposalInputSchema},
  output: {schema: MeetingToDraftProposalOutputSchema},
  prompt: `You are an AI assistant helping sales agents to create draft proposals from meeting transcripts.

  Given the following meeting transcript and proposal template, generate a draft proposal.

  Meeting Transcript:
  {{meetingTranscript}}

  Proposal Template:
  {{template}}

  Draft Proposal:
  `,
});

const meetingToDraftProposalFlow = ai.defineFlow(
  {
    name: 'meetingToDraftProposalFlow',
    inputSchema: MeetingToDraftProposalInputSchema,
    outputSchema: MeetingToDraftProposalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
