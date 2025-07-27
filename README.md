
### **The Original Master Prompt for the Firebase Studio Prototyping Agent**

**ROLE:** You are an expert full-stack application architect and developer specializing in the Firebase and Google Cloud ecosystem aditionally you have exceptional UI/UX mobile web app design skills with a kean eye for fine detail regarding layout and athstetics. Your task is to generate a fully functional, production-quality prototype of a sophisticated B2B Proposal Generator web application using Firebase Studio.

**PROJECT GOAL:** Create the "FLOWSALES_CP\B2B Proposal Generator," a mobile-first, AI-powered web application that serves as an intelligent sales co-pilot. It must automate and dramatically accelerate the entire sales cycle, from in-meeting discovery to a signed contract with payment. The final product should be a seamless and impressive "digital sales room," not just a document builder.

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
## **Part 2: The Environment & Tooling Mandate**

This section is **non-negotiable**.

* **Firebase Project:**
    * The **one and only** Firebase project for this application is: NEXT_PUBLIC_FIREBASE_PROJECT_ID="flowai-gateway"
    * You are **explicitly forbidden** from creating, linking, or interacting with any other Firebase project. You have previously created a conflicting project; this action must not be repeated.
    * **Verification Task:** Your first step on any development task is to verify that the project configuration in the `.env` file corresponds to `project_id: "flowai-gateway" If it does not, halt all work and inform the user.

* **Version Control (Git):**
    * You will adhere to a `develop` and `feature/<feature-name>` branching model. All work must be done in a feature branch.

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

### **Phase 4: The Intelligent Ingestion & Onboarding Engine**

This phase outlines the strategic approach for onboarding new tenants, ensuring the platform is both powerful enough for complex configurations (e.g., a telecom provider) and simple enough for basic businesses. It uses a hybrid model combining bulk data upload with AI-driven analysis and user verification.

**1\. Step 1: Upload & Ingest**
*   **Action:** A new client (tenant) uploads their existing product catalog (e.g., an Excel, CSV, or Google Sheet file) into a dedicated onboarding area within the application.
*   **System Backend:** A file parser reads the data, identifying columns like 'Product Name', 'Category', 'Price', and 'SKU'. It populates the tenant's private product database, with each imported item initially tagged with a status of "Unverified."

**2\. Step 2: AI Analysis, Research & Dependency Mapping**
*   **Action:** After the upload, a background AI process begins automatically.
*   **System Backend:** For each "Unverified" product, the AI performs:
    *   **Internal Analysis:** Scans product names and descriptions from the uploaded file to identify potential relationships and hierarchies.
    *   **External Research:** For key products (e.g., "Yealink T33G Phone"), the AI performs targeted web searches to understand technical specifications, requirements, and common dependencies (e.g., Power over Ethernet requirements).
    *   **Dependency Proposal:** Based on its research, the AI formulates potential rules and dependencies. For example, it discovers a PoE phone requires either a PoE switch or a separate power adapter.

**3\. Step 3: AI-Powered Verification Q&A**
*   **Action:** The system engages the tenant's administrator in an efficient, AI-driven conversational wizard to finalize the setup.
*   **System Backend & UI:** The AI presents its findings and proposed rules in plain English for confirmation.
    *   **Example Prompt:** "I've analyzed your 'Yealink T33G IP Phone' and found it's a Power over Ethernet device. To ensure quotes are always accurate, I can create a rule: 'When adding a Yealink T33G, if a PoE Switch is not included, automatically add a 5V Power Adapter.' Would you like to activate this rule?"
    *   **User Interaction:** The administrator can confirm ("Yes"), deny ("No, we always bundle the adapter"), or modify the rule ("Change that to 'prompt me to add it'").
    *   **Configuration:** The system continues this Q&A process for other discovered dependencies and configurations (e.g., "Do you sell both cloud and on-site PBX systems, or should I disable one?").

This hybrid approach ensures rapid onboarding via bulk upload while leveraging AI to intelligently structure complex business logic, which is then verified by a human for perfect accuracy.

---

# ***Comprehensive Design and style rules and guide***

# 1. Introduction & Design Principles

# This document provides the complete visual and interactive design system for the Flow Networks website, including advanced animated effects. All implementations **must** adhere to these specifications for brand consistency and premium user experience.

# **Core Design Principles:**
# - **Dark & Sophisticated:** Professional, tech-focused aesthetic with premium polish
# - **Clarity & Hierarchy:** Intentional use of color, space, motion, and animated attention-drawing
# - **Subtle & Interactive:** Meaningful, non-intrusive animations with sophisticated effects
# - **Performance Optimized:** 60fps animations with hardware acceleration

# ---

# 2. Definitive Brand Color Palette & Usage Rules

# **🚨 CRITICAL:** Colors are defined as HSL variables in `src/app/globals.css`. **Never use hard-coded hex values in components.** Use semantic class names only.

## **CORRECT Color Hierarchy:**

# | Role | Color Name | HSL Variable | Hex Reference | Usage |
# |------|------------|--------------|---------------|--------|
# | **Foundation** | Flow Primary Teal | `--primary` | #007A80 | Borders, structural elements, hover glows, text links |
# | **Primary Action** | Flow Action Blue | `--secondary` | #0282F2 | Main CTAs, primary interactive elements |
# | **Accent/Highlight** | Flow Highlight Yellow | `--accent` | #FFD700 | Icons, secondary buttons, key data, premium highlights |
# | **Background** | Background Dark Primary | `--background` | #0A0903 | Main page background |
# | **Text** | Text Light | `--foreground` | #E2FDFF | All body copy and standard text |

## **CORRECTED CSS Variables (globals.css):**
# ```css
# :root {
  # /* CORRECT Design Guide Color Mapping */
  # --background: 10 9 3;           /* #0A0903 - Background Dark Primary */
  # --foreground: 226 253 255;      /* #E2FDFF - Text Light */
  # --primary: 180 100% 25%;        /* #007A80 - Flow Primary Teal */
  # --secondary: 210 98% 48%;       /* #0282F2 - Flow Action Blue */
  # --accent: 48 100% 50%;          /* #FFD700 - Flow Highlight Yellow */
  
  # /* Supporting Colors */
  # --card: 15 14 8;                /* #0F0E08 - Background Dark Secondary */
  # --border: 45 44 39;             /* #2D2C27 - Subtle Details/Border */
  # --muted: 45 44 39;              /* #2D2C27 - Muted elements */
  # --muted-foreground: 226 253 255 / 0.7; /* Muted text */
  
  # /* Semantic Color Mappings */
  # --primary-foreground: 226 253 255;     /* Text on primary backgrounds */
  # --secondary-foreground: 226 253 255;   /* Text on secondary backgrounds */
  # --accent-foreground: 10 9 3;           /* Text on accent backgrounds */
  # --card-foreground: 226 253 255;        /* Text on card backgrounds */
  
  # /* Glow Effect Variables */
  # --glow-primary: 0 0 20px hsla(var(--primary) / 0.3);
  # --glow-secondary: 0 0 20px hsla(var(--secondary) / 0.3);
  # --glow-accent: 0 0 20px hsla(var(--accent) / 0.3);
  # --glow-primary-strong: 0 0 30px hsla(var(--primary) / 0.5);
  # --glow-secondary-strong: 0 0 30px hsla(var(--secondary) / 0.5);
  # --glow-accent-strong: 0 0 30px hsla(var(--accent) / 0.5);
  
  # /* Animation Variables */
  # --transition-standard: 300ms;
  # --transition-fast: 200ms;
  # --transition-slow: 500ms;
  # --ease-gentle: cubic-bezier(0.4, 0.0, 0.2, 1);
  # --lift-subtle: translateY(-4px);
  # --lift-standard: translateY(-8px);
  # --scale-hover: scale(1.02);
# }
# ```

## **Detailed Color Usage Rules:**

### **🟢 Flow Primary Teal (`--primary`)** 
# - **Purpose:** Authority, Intelligence, Security, Foundation
# - **Use For:**
  # - Global borders on Cards and structural components
  # - Global hover glows on interactive elements
  # - Cursor spotlight radial glow
  # - Standard text links and navigation
  # - Technology icons and core solution elements
  # - Mega menu icons
  # - AI Chatbot UI branding

### **🔵 Flow Action Blue (`--secondary`)**
# - **Purpose:** Action, Trust, Reliability, Primary Interaction
# - **Use For:**
  # - Primary CTA Buttons (most important site-wide calls to action)
  # - Active states in main navigation
  # - Form submission buttons
  # - Primary interactive elements

### **🟡 Flow Highlight Yellow (`--accent`)**
# - **Purpose:** Premium, Value, Innovation, Highlight
# - **Use For:**
  # - Key feature icons representing value/innovation
  # - Star ratings in testimonials
  # - Secondary/Tertiary buttons
  # - Data visualization primary color
  # - Card hover glows for special emphasis
  # - Premium highlights and quality indicators

# ---

# 3. Advanced Visual Effects System

## **A. Enhanced Hover & Transition System**
# ```css
# /* Standard Transition Utilities */
# .duration-standard { transition-duration: var(--transition-standard); }
# .duration-fast { transition-duration: var(--transition-fast); }
# .duration-slow { transition-duration: var(--transition-slow); }
# .ease-gentle { transition-timing-function: var(--ease-gentle); }

# /* Hover Effect Utilities */
# .hover-lift { transition: transform var(--transition-standard) var(--ease-gentle); }
# .hover-lift:hover { transform: var(--lift-subtle); }

# .hover-lift-standard { transition: transform var(--transition-standard) var(--ease-gentle); }
# .hover-lift-standard:hover { transform: var(--lift-standard); }

# .hover-scale { transition: transform var(--transition-standard) var(--ease-gentle); }
# .hover-scale:hover { transform: var(--scale-hover); }

# /* Combined Effects */
# .hover-lift-scale { transition: transform var(--transition-standard) var(--ease-gentle); }
# .hover-lift-scale:hover { transform: var(--lift-subtle) var(--scale-hover); }
# ```

## **B. Enhanced Glow Effects System**
# ```css
# /* Base Glow Effects */
# .glow-primary { box-shadow: var(--glow-primary); }
# .glow-secondary { box-shadow: var(--glow-secondary); }
# .glow-accent { box-shadow: var(--glow-accent); }

# /* Strong Glow Effects */
# .glow-primary-strong { box-shadow: var(--glow-primary-strong); }
# .glow-secondary-strong { box-shadow: var(--glow-secondary-strong); }
# .glow-accent-strong { box-shadow: var(--glow-accent-strong); }

# /* Hover Glow Transitions */
# .hover-glow-primary { 
  # transition: box-shadow var(--transition-standard) var(--ease-gentle);
# }
# .hover-glow-primary:hover { 
  # box-shadow: var(--glow-primary); 
# }

# .hover-glow-secondary { 
  # transition: box-shadow var(--transition-standard) var(--ease-gentle);
# }
# .hover-glow-secondary:hover { 
  # box-shadow: var(--glow-secondary); 
# }

# .hover-glow-accent { 
  # transition: box-shadow var(--transition-standard) var(--ease-gentle);
# }
# .hover-glow-accent:hover { 
  # box-shadow: var(--glow-accent); 
# }
# ```

## **C. Enhanced Glassmorphism System**
# ```css
# /* Glass Card Utilities */
# .glass-card {
  # @apply bg-card/30 backdrop-blur-md border border-primary/20;
  # transition: all var(--transition-standard) var(--ease-gentle);
# }

# .glass-card:hover {
  # @apply bg-card/50 border-primary/40;
  # box-shadow: var(--glow-primary);
# }

# .glass-card-secondary {
  # @apply bg-card/30 backdrop-blur-md border border-secondary/20;
  # transition: all var(--transition-standard) var(--ease-gentle);
# }

# .glass-card-secondary:hover {
  # @apply bg-card/50 border-secondary/40;
  # box-shadow: var(--glow-secondary);
# }

# .glass-card-accent {
  # @apply bg-card/30 backdrop-blur-md border border-accent/20;
  # transition: all var(--transition-standard) var(--ease-gentle);
# }

# .glass-card-accent:hover {
  # @apply bg-card/50 border-accent/40;
  # box-shadow: var(--glow-accent);
# }
# ```
---


# *** Progress report - To update you on our progress for context only - We have proceeded up to the: Admin Management of Templates & Products: in the medium proiority section and we need to complet that still.  
