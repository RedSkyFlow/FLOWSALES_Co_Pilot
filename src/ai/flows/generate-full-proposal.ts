
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
  clientName: z.string().describe("The name of the client or company."),
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
  
Your goal is to transform a generic proposal template into a complete, polished, and professional document that speaks directly to the client's needs.

**Client Context:**
- **Client Name:** {{{clientName}}}
- **Proposal Type:** {{{proposalType}}}
- **Client's Key Pain Points:** {{{clientPainPoints}}}
- **Proposed Products/Solutions:** 
  {{#each selectedProducts}}
  - {{{this}}}
  {{/each}}

**Your Task:**
1.  **Start with a Salutation:** Begin the entire proposal with a professional and personalized salutation. Create a new "Introduction" or "Cover Letter" section for this. For example: "Dear {{{clientName}}}," followed by a brief opening paragraph.
2.  **Rewrite and Tailor:** Review the original template sections. Rewrite the content of each section to directly address the client's pain points and weave in the benefits of the proposed products. Maintain the original section titles.
3.  **Ensure Logical Flow:** Arrange the final sections in a logical order that tells a compelling story (e.g., Introduction, Executive Summary, Our Understanding of Your Needs, Proposed Solution, Pricing, About Us, Next Steps).
4.  **Mark Your Work:** Mark the 'type' of each rewritten or newly generated section as 'ai_generated'.

**Original Template Sections to Work From:**
{{#each templateSections}}
---
**Title:** {{title}}
**Original Content:** {{content}}
**Type:** {{type}}
---
{{/each}}

Now, provide the final, rewritten and fully structured list of proposal sections in the required output format.
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
