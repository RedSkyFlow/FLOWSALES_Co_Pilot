# **App Name**: Flow Sales Co-Pilot

## Core Features:

- Authentication: User authentication and role management using Firebase Authentication.
- Sales Agent Dashboard: Sales agent dashboard displaying a list of proposals with filtering and sorting options.
- Smart Template Management: Before the wizard begins, allow sales agents to select from a library of pre-designed, branded templates (e.g., 'Stadium OS Proposal,' 'Shopping Mall Pilot Proposal' Telco Proposal, ). Each template will have a unique structure and pre-loaded content blocks relevant to that Business type.
- Proposal Creation Wizard: Step-by-step wizard for creating new proposals, including client selection, module selection, and AI-powered content generation. As the sales agent selects or deselects modules from the catalog, a dynamic pricing table within the proposal must update the total cost in real-time. This table should be interactive and visible to both the agent during creation and the client in the final view.
- AI Content Generation: AI-powered content generation for executive summaries, problem statements, and proposed solutions using the Gemini API, triggered by key client pain points or notes that are provided. This tool will also suggest relevant case studies from the content library.
- Interactive Client View: Interactive client view of the proposal with commenting, edit suggestions, and acceptance/signing functionality. All client-suggested amendments and agent approvals will be tracked. The system will create and manage distinct versions of the proposal, allowing for a clear negotiation log and the ability to revert to previous versions if needed
- Meeting Intelligence: Real-time meeting intelligence gathering to populate draft proposals using the Google Cloud Speech-to-Text API to create an intelligent, AI-powered tool.
- Analytics & Notifications: Backend analytics to track client engagement with proposals and trigger real-time notifications for sales agents.
- Integrated Payment Gateway: After a proposal is electronically signed, the application will automatically present the client with a secure payment link. This will integrate with a payment gateway (like Stripe or PayFast) to handle transactions directly within the client view, updating the proposal's status to 'Paid' upon completion. The app must allow clients to pay an initial deposit or the full amount immediately after signing.

## Style Guidelines:

- Primary color: A muted but rich dark blue (#345995) for a trustworthy and professional feel.
- Background color: A very light grey (#F0F2F5), nearly white, to ensure readability and a clean interface.
- Accent color: A vibrant orange (#D45500), standing out to highlight key actions and important information.
- Body font: 'PT Sans' (sans-serif) for body text due to its readability and modern, yet warm, appearance.
- Headline font: 'Playfair' (serif) due to its geometric style and high-end, elegant feel.
- Use clean, professional icons that are easily understandable to represent various modules, actions, and statuses within the application.
- Employ a card-based layout to present proposals, modules, and other content in an organized and visually appealing manner, optimized for both desktop and mobile views.