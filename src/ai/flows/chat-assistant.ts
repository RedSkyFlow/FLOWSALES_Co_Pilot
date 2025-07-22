
'use server';

/**
 * @fileOverview A conversational AI assistant for the Flow Sales Co-Pilot app.
 *
 * - chatAssistant - A function that takes a user's message and returns a helpful response.
 * - ChatAssistantInput - The input type for the function.
 * - ChatAssistantOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatAssistantInputSchema = z.string();
export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  response: z.string().describe('The helpful response from the AI assistant.'),
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;

export async function chatAssistant(
  input: ChatAssistantInput
): Promise<ChatAssistantOutput> {
  return chatAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: { schema: ChatAssistantInputSchema },
  output: { schema: ChatAssistantOutputSchema },
  prompt: `You are a friendly and helpful AI assistant for the "Flow Sales Co-Pilot" application.
  
Your goal is to assist users with questions about using the app, sales best practices, or drafting proposal content.

Keep your answers concise and helpful.

User's message:
"{{{input}}}"

Your response:
`,
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI assistant failed to generate a response.');
    }
    return output;
  }
);
