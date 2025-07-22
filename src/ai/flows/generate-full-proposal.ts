
'use server';

/**
 * @fileOverview A flow for generating a full proposal by rewriting template sections based on client context.
 *
 * - generateFullProposal - A function that generates the full proposal content.
 * - GenerateFullProposalInput - The input type for the function.
 * - GenerateFullProposalOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProposalSectionSchema = z.object({
    title: z.string().describe('The title of the proposal section.'),
    content: z.string().describe('The content of the proposal section.'),
    type: z.enum(['ai_generated', 'manual', 'template']).describe('The origin type of the section.'),
});

const GenerateFullProposalInputSchema = z.object({
  clientPainPoints: z.string().describe('Key pain points and challenges the client is facing.'),
  selectedProducts: z.array(z.string()).describe('A list of product/module names selected for the proposal.'),
  proposalType: z.string().describe('The type of proposal (e.g., Stadium OS Proposal, Shopping Mall Pilot Proposal).'),
  templateSections: z.array(ProposalSectionSchema).describe('The original boilerplate sections from the selected template.'),
});
export type GenerateFullProposalInput = z.infer<typeof GenerateFullProposalInputSchema>;

const GenerateFullProposalOutputSchema = z.object({
  sections: z.array(ProposalSectionSchema).describe('The final, rewritten and tailored list of proposal sections.'),
});
export type GenerateFullProposalOutput = z.infer<typeof GenerateFullProposalOutputSchema>;

export async function generateFullProposal(
  input: GenerateFullProposalInput
): Promise<GenerateFullProposalOutput> {
  return generateFullProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFullProposalPrompt',
  input: { schema: GenerateFullProposalInputSchema },
  output: { schema: GenerateFullProposalOutputSchema },
  prompt: `You are an expert sales copywriter tasked with creating a persuasive and highly-tailored sales proposal.
  
Your goal is to transform a generic proposal template into a compelling document that speaks directly to the client's needs.

**Client Context:**
- **Proposal Type:** {{{proposalType}}}
- **Client's Key Pain Points:** {{{clientPainPoints}}}
- **Proposed Products/Solutions:** 
  {{#each selectedProducts}}
  - {{{this}}}
  {{/each}}

**Your Task:**
Review the following template sections. For each section, rewrite the content to:
1.  Directly address the client's pain points.
2.  Subtly weave in the benefits of the proposed products.
3.  Maintain a professional, confident, and persuasive tone.
4.  Keep the original section titles.
5.  If a section is an "Executive Summary", generate a new one from scratch based on the client context. For all other sections, use the provided content as a base for your rewrite.

**Original Template Sections:**
{{#each templateSections}}
---
**Title:** {{title}}
**Original Content:** {{content}}
**Type:** {{type}}
---
{{/each}}

Now, provide the final, rewritten list of proposal sections in the required output format. Ensure every original section is included in your output, but with rewritten, tailored content. Mark the 'type' of each rewritten section as 'ai_generated'.
`,
});

const generateFullProposalFlow = ai.defineFlow(
  {
    name: 'generateFullProposalFlow',
    inputSchema: GenerateFullProposalInputSchema,
    outputSchema: GenerateFullProposalOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate full proposal from the AI model.');
    }
    return output;
  }
);
