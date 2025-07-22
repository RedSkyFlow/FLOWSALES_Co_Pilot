## **The Original Master Prompt for the Firebase Studio Prototyping Agent**

**ROLE:** You are an expert full-stack application architect and developer specializing in the Firebase and Google Cloud ecosystem aditionally you have exceptional UI/UX mobile web app design skills with a kean eye for fine detail regarding layout and athstetics. Your task is to generate a fully functional, production-quality prototype of a sophisticated B2B Proposal Generator web application using Firebase Studio.

**PROJECT GOAL:** Create the "Venue OS \- B2B Proposal Generator," a mobile-first, AI-powered web application that serves as an intelligent sales co-pilot. It must automate and dramatically accelerate the entire sales cycle, from in-meeting discovery to a signed contract with payment. The final product should be a seamless and impressive "digital sales room," not just a document builder.

**CORE TECHNOLOGIES:**

* **Platform:** Responsive, mobile-first Web Application.  
* **Backend:** Firebase (Firestore, Cloud Functions for backend logic, Authentication, Cloud Storage).  
* **Hosting:** Firebase Hosting.  
* **AI Engine:** Deeply integrate the Gemini API for content generation, summarization, and natural language understanding. Use the Google Cloud Speech-to-Text API for audio transcription.

---

### **Phase 1: Foundation & Data Architecture**

First, define the core data models. Create the following Firestore collections with the specified fields. Implement robust Firestore Security Rules to ensure data integrity and user-level access control (e.g., sales agents can only access their own proposals).

* **`users` (collection):** For sales agent authentication.  
    
  * `uid`: (from Firebase Auth)  
  * `email`: string  
  * `displayName`: string  
  * `role`: string (e.g., 'sales\_agent', 'admin')


* **`clients` (collection):** A simple CRM for client data.  
    
  * `name`: string  
  * `industry`: string (e.g., 'Hospitality', 'Retail', 'Education')  
  * `contactPerson`: string  
  * `contactEmail`: string  
  * `notes`: string


* **`venueOS_modules` (collection):** The catalog of services we sell.  
    
  * `name`: string (e.g., "Intelligent WiFi," "AI Wayfinding," "Booking Engine")  
  * `description`: string  
  * `pricingModel`: string (e.g., 'subscription', 'one-time')  
  * `basePrice`: number  
  * `tags`: array (for AI mapping)


* **`content_library` (collection):** Reusable blocks for dynamic proposals.  
    
  * `type`: string (e.g., 'case\_study', 'team\_bio', 'legal\_clause')  
  * `title`: string  
  * `content`: string (markdown enabled)  
  * `tags`: array (e.g., 'hospitality', 'large\_venue')


* **`proposals` (collection):** The central collection for all proposal documents.  
    
  * `title`: string  
  * `status`: string ('draft', 'sent', 'viewed', 'accepted', 'signed', 'declined')  
  * `salesAgentId`: (reference to `users` collection)  
  * `clientId`: (reference to `clients` collection)  
  * `version`: number  
  * `totalPrice`: number  
  * `createdAt`: timestamp  
  * `lastModified`: timestamp  
  * `sections`: array of objects (e.g., `{ title: 'Executive Summary', content: '...', type: 'ai_generated' }`)  
  * `selectedModules`: array of objects (from `venueOS_modules`)  
  * `engagementData`: object (`views`, `timeOnPage`, `lastViewed`)  
  * `signatureData`: object (`status`, `signedAt`, `auditTrailUrl`)  
  * `paymentData`: object (`status`, `paymentLink`, `paidAt`)  
  * `meetingTranscript`: string (optional, from STT API)

---

### **Phase 2: Application UI & Core User Flows (Mobile-First)**

Generate the user interface and core logic for the following screens and workflows. The UI must be clean, modern, responsive, and optimized for touch input on mobile devices.

**1\. Authentication Flow:**

* A clean login page using Firebase Authentication (Email/Password & Google Sign-In).  
* A simple registration page for new sales agents (can be admin-only invite later).

**2\. Sales Agent Dashboard:**

* This is the home screen after login.  
* Display a list of all proposals created by the logged-in agent.  
* Each list item should show: `proposal.title`, `client.name`, `proposal.status`, and `proposal.totalPrice`.  
* Include filtering/sorting options by status.  
* A prominent "Create New Proposal" button.

**3\. Manual Proposal Creation Wizard:** A step-by-step flow to guide the agent.

* **Step 1: Client & Title:**  
  * Select an existing client from the `clients` collection (with a search bar).  
  * Or, create a new client, which adds a new document to the `clients` collection.  
  * Input a title for the proposal.  
* **Step 2: Select Venue OS Modules:**  
  * Display an interactive checklist of all modules from the `venueOS_modules` collection.  
  * As modules are selected, dynamically calculate and display a running total price.  
* **Step 3: AI-Powered Content Generation:**  
  * Provide a simple text area for the agent to input key client pain points or notes (e.g., "Client's current WiFi is slow. They need better indoor navigation for their large mall.").  
  * **AI Integration:** Use a Cloud Function to securely call the Gemini API. The prompt should include the client's industry, the selected modules, and the agent's notes.  
  * **AI Output:** Gemini should generate draft text for the `Executive Summary`, `Problem Statement`, and `Proposed Solution` sections of the proposal. It should also suggest relevant case studies from the `content_library` based on tags.  
* **Step 4: Review, Edit & Send:**  
  * Display the full proposal in an editable format (like a rich text editor).  
  * The agent can review and edit all AI-generated text and manually add content blocks from the `content_library`.  
  * Provide a button to "Send to Client," which generates a unique, shareable link to the interactive client view.

---

### **Phase 3: The "Digital Sales Room" & Advanced Integrations**

This phase defines the advanced features that make the tool a game-changer.

**1\. The Interactive Client View:**

* This is the public-facing, interactive web proposal that the client sees via the shared link. It is NOT a static PDF.  
* **Collaboration:**  
  * Clients can add comments directly onto proposal sections.  
  * Implement a "Suggest Edit" feature where clients can propose changes that the sales agent must approve. All interactions update the `proposal` document in Firestore in real-time.  
* **Action Hub (The Deal-Closing Machine):**  
  * **E-Signature:** A prominent "Accept & Sign" button.  
    * **Integration:** Use a Cloud Function to integrate with an e-signature service API (e.g., DocuSign, PandaDoc).  
    * **Workflow:** Trigger the signing process, embed the signing UI, and update `proposal.signatureData` upon completion, including the legally binding audit trail.  
  * **Payment Link:**  
    * **Integration:** Use a Cloud Function to integrate with a payment gateway API (e.g., Stripe, PayFast).  
    * **Workflow:** Once the proposal is signed, the "Accept" button should transform into a "Proceed to Payment" button. This button links to a pre-filled payment page for the deposit or full amount. Update `proposal.paymentData` on successful payment.

**2\. Real-Time Meeting Intelligence (The "Eavesdropping" Co-pilot):** This is the most ambitious feature. Create the backend logic using Cloud Functions.

* **Consent First:** The UI must have a clear, un-skippable step for the sales agent to confirm they have received explicit consent from all meeting participants to record and process the conversation.  
* **Integration (Google Meet PoC):**  
  * Develop a Cloud Function that can access a meeting's audio stream or transcript via the Google Meet API.  
  * Feed the audio to the Google Cloud Speech-to-Text API to get a real-time transcript with speaker diarization (identifying who is speaking).  
* **Contextual AI Analysis (Gemini):**  
  * As the transcript is generated, stream it to a Cloud Function that uses the Gemini API.  
  * **Prompt Gemini to:**  
    * Identify client-stated pain points.  
    * Detect keywords related to `venueOS_modules`.  
    * Extract budget indicators, timelines, and key decision-makers.  
    * **Action:** Based on this analysis, automatically populate a new draft proposal in real-time. This means checking off the relevant modules, drafting the problem/solution sections, and filling in client requirements as they are spoken.  
* **UI:** The sales agent should have a view within the app during the meeting where they can see the proposal being built automatically, ready for a quick review and sending *at the end of the call*.

**3\. Analytics & Notifications:**

* Implement backend logic to track client engagement on the interactive proposal (views, time on sections).  
* Use Cloud Functions to send real-time notifications to the sales agent when a proposal is opened, viewed, commented on, or signed.

---
To: Firebase Studio Prototyping Agent (FBSPA) From: Chief Architect Subject: Directive to Implement Real-Time Collaboration Feature in the Digital Sales Room

Project Goal: Your next task is to activate the real-time collaboration feature on the interactive client proposal view. You will replace the existing mock data with a live, real-time comment thread powered by Firestore.

Execute the following three-part architectural blueprint precisely.

Architectural Requirement: We need a scalable way to store comments associated with each proposal.

Implementation Steps:

Establish a new subcollection named comments within each document in the proposals collection.
Each document within the comments subcollection will represent a single comment and must adhere to the following data model:
text: string (The content of the comment)
authorId: string (The uid of the user who wrote the comment)
authorName: string (The displayName of the author, for efficient display)
authorAvatarUrl: string (Optional: The URL to the author's profile picture)
createdAt: timestamp (Server timestamp, for chronological ordering)
Architectural Requirement: We must secure the new comments subcollection.

Implementation Steps:

Open the firestore.rules file.
Inside the match /proposals/{proposalId} block, add a new nested match block for the comments subcollection.
Implement the following rules. This ensures that only the sales agent who owns the proposal or an admin can read and write comments. (Client-side commenting will be handled by a secure Cloud Function in a later task).
// Add this block inside your existing 'match /proposals/{proposalId}' block

match /comments/{commentId} {
  // Allow read access to the proposal owner or an admin.
  allow read: if get(/databases/$(database)/documents/proposals/$(proposalId)).data.salesAgentId == request.auth.uid
              || request.auth.token.role == 'admin'; // Assumes Custom Claims

  // Allow comment creation by the proposal owner or an admin.
  allow create: if request.auth.uid == get(/databases/$(database)/documents/proposals/$(proposalId)).data.salesAgentId
                || request.auth.token.role == 'admin';

  // Comments are immutable; they cannot be updated or deleted for audit purposes.
  allow update, delete: if false;
}