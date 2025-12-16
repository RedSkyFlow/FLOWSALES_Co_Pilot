### **Roadmap to Deployment: From Intelligent Prototype to Market-Ready Platform**

#### **Current Status Analysis: A Powerful, Modern, & Well-Architected Foundation**

The project is in an excellent state. The architectural choices are top-tier and implemented correctly.

* **Technology Stack:** The use of **Next.js 15**, **Firebase 11**, **Genkit**, and **Tailwind CSS** constitutes a best-in-class, production-grade stack. The choice of **Radix UI** for headless components and **Zod** for schema validation demonstrates a commitment to quality and scalability.
* **Core Logic:** The backend AI flows are sophisticated, and the frontend is built with a real-time, component-based architecture.
* **The Disconnect:** As we've identified, the primary challenge is that the *implementation* of the onboarding engine does not yet match the project's ultimate *vision*. The current "bottom-up" AI rule suggestion needs to be replaced with the "top-down" **Document Intelligence Engine**.

This roadmap will guide the agent to bridge that gap and finalize the application for launch.

---
### **Phase 1: Implement the "Document Intelligence" Onboarding Engine (Immediate Priority)**

**Objective:** Replace the current, inefficient product verification flow with the powerful, holistic analysis engine. This is the most critical step to unlocking the platform's true potential.

* **Task 1.1: Build the Multi-Modal Ingestion Flow**
    * **Action:** Create a new, primary Genkit flow named `ingestAndAnalyzeConfiguratorFlow`.
    * **Specifications:**
        * This flow must be able to accept the content of various file types (PDF, DOCX, XLSX).
        * Leverage a powerful multi-modal model like Gemini 1.5 Pro to perform deep analysis. For spreadsheets, this includes analyzing layout and notes to infer rules. For documents, it involves using OCR and NLU to parse tables and text.
        * The flow's output must be a single, structured JSON object containing two arrays: a complete `products` list and a `rules` list (dependencies, bundles, etc.).

* **Task 1.2: Redesign the Verification User Interface**
    * **Action:** Decommission the current one-by-one product verification page. Create a new "Bulk Verification" UI.
    * **Specifications:**
        * This UI will display after the `ingestAndAnalyzeConfiguratorFlow` completes.
        * It must present the extracted data in two clear tables: one for all **Products** and one for all **Rules**.
        * Both tables must support inline editing for quick corrections.
        * A prominent **"Approve All"** button must be included to allow a tenant admin to verify the entire extracted configuration in a single action.

### **Phase 2: Complete and Secure the Core Application**

**Objective:** Finalize the primary user journey, implement the tiered feature set, and establish a robust testing and security framework.

* **Task 2.1: Integrate Subscription-Tier Logic**
    * **Action:** Implement the server-side feature flagging we designed.
    * **Specifications:**
        * The new `ingestAndAnalyzeConfiguratorFlow` must be a premium, gated feature. The function must check the user's `subscription.tier` from their tenant document before executing.
        * The frontend UI must be updated to conditionally display and disable features based on the user's subscription, with clear "Upgrade" prompts on locked features.

* **Task 2.2: Implement a Formal Testing Strategy**
    * **Action:** The `package.json` file includes the necessary `devDependencies` for TypeScript and testing (`@types/node`, `typescript`). Now is the time to use them.
    * **Specifications:**
        * **Unit Tests:** Create unit tests for the new `ingestAndAnalyzeConfiguratorFlow` to validate its data extraction accuracy with sample documents.
        * **End-to-End (E2E) Tests:** Write automated E2E tests for the most critical user path: Tenant Onboarding -> Proposal Creation -> Send to Client.

* **Task 2.3: Conduct a Full Security Audit**
    * **Action:** Before deployment, perform a full security review.
    * **Specifications:**
        * Review and tighten all Firestore security rules in `firestore.rules`.
        * Audit all Cloud Function permissions in the IAM console to ensure the principle of least privilege is strictly followed.
        * Restrict all client-side API keys to your specific application domains.

### **Phase 3: Finalize for Launch**

**Objective:** Polish the application and prepare for a successful production deployment.

* **Task 3.1: Complete the "AI-Guided" and "Autonomous" Onboarding Paths**
    * **Action:** Build out the remaining UI and backend logic for the two distinct onboarding experiences.
    * **Specifications:**
        * **AI-Guided (Pro Tier):** Implement the website scraping function to extract brand assets and the document analysis function to create templates from existing proposals.
        * **Autonomous (Enterprise Tier):** Build the secure interface for connecting to third-party CRMs and databases, using Secret Manager to store API credentials.

* **Task 3.2: Establish a CI/CD Pipeline**
    * **Action:** Use the scripts defined in your `package.json` (`build`, `lint`, `typecheck`) to create an automated deployment pipeline.
    * **Specifications:**
        * Set up a pipeline using GitHub Actions or Google Cloud Build.
        * Configure the pipeline to automatically run all tests, lint the code, and deploy to Firebase App Hosting upon a successful merge to the main branch.
---