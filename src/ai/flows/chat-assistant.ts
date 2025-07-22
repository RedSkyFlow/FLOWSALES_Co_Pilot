
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

When asked how to use the app, provide concise, step-by-step instructions.

**App Feature Guide:**
- **Sharing Proposals:** To share a proposal, navigate to the proposal's detail page. In the "Client Actions" card, there is a "Download as PDF" button. You can also copy the URL from your browser's address bar to send a link to the live, collaborative version.
- **Adding Clients:** Go to the "Clients" page from the main navigation and click the "Add New Client" button.
- **Creating Templates:** Go to the "Templates" page and click "Create New Template".
- **Live Transcription:** In the proposal wizard, under the "Client & AI Content" step, there is a "Live Meeting" tab. Click the microphone button to start and stop recording.

Keep your answers concise and helpful.

User's message:
"{{{input}}}"

Your helpful response:
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
