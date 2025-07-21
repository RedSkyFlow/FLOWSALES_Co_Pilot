# Flow Sales Co-Pilot

This is a Next.js application built with Firebase Studio, designed to be an intelligent partner for sales agents. It leverages generative AI to assist in creating, managing, and optimizing sales proposals.

## How-To Guide

This guide provides an overview of the project's architecture, setup instructions, and key development concepts. It will be updated as the project progresses.

---

## 1. Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Generative AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit)
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore)
*   **Version Control:** [Git](https://git-scm.com/)

---

## 2. Project Setup

Follow these steps to set up and run the project on your local machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [Git](https://git-scm.com/)
*   [Firebase CLI](https://firebase.google.com/docs/cli#install_the_firebase_cli)

### Installation

1.  **Clone the Repository:**
    Get a copy of the project on your local machine by cloning the GitHub repository.
    ```bash
    git clone <your-github-repository-url>
    cd <your-project-directory>
    ```

2.  **Install Dependencies:**
    Install the necessary `npm` packages.
    ```bash
    npm install
    ```

3.  **Firebase Setup:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    *   In your new project, add a **Web App** (</> icon) to get your Firebase configuration credentials.
    *   Enable **Firestore** and **Authentication** (with Email/Password) in your Firebase project.
    *   Copy the Firebase config object and paste the values into the `.env` file in the root of this project. The `.env` file should look like this, with your actual credentials:
        ```
        NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
        NEXT_PUBLIC_FIREBASE_APP_ID=1:...
        ```

4.  **Deploy Firestore Rules:**
    Log in to Firebase and deploy the security rules from your local terminal.
    ```bash
    firebase login
    firebase deploy --only firestore
    ```
    *Note: The first time you deploy, the CLI may ask you to associate this local project with your Firebase project. The `.firebaserc` file should handle this automatically.*

5.  **Run the Development Server:**
    Start the Next.js application.
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

---

## 3. Backend Guide

### Firestore Database

Firestore is our primary database. The data models are defined as TypeScript interfaces in `src/lib/types.ts`.

*   **`users`**: Stores authenticated user data.
*   **`clients`**: A simple CRM for managing client information.
*   **`venueOS_modules`**: A catalog of products and services that can be included in proposals.
*   **`content_library`**: Reusable content blocks (e.g., case studies, legal clauses) for dynamic proposal generation.
*   **`proposals`**: The core collection holding all proposal documents. It links to `users` and `clients`.

### Firestore Security Rules

Security is managed in `firestore.rules`. The rules enforce that:
*   Users can only read/write their own document in the `users` collection.
*   Authenticated users can read shared resources like `clients` and `venueOS_modules`.
*   Users can only create, read, update, or delete proposals where their `uid` matches the `salesAgentId` on the proposal document.

### Generative AI with Genkit

We use Genkit to interact with Google's Gemini models for AI-powered features.

*   **Flows:** AI logic is encapsulated in "flows," located in `src/ai/flows/`. Each flow is a server-side function that can be called from the frontend. Some key flows include:
    *   `analyzeMeetingTranscript`: Takes a meeting transcript and suggests a proposal template, extracts client pain points, suggests relevant products, and drafts initial "Problem" and "Solution" sections.
    *   `generateExecutiveSummary`: Creates a compelling summary based on client pain points.
    *   `generateBrandAnalysis`: Analyzes a company's website URL or a brand image to automatically extract primary/secondary colors and summarize the brand's voice and tone.
*   **Schemas:** Each flow uses `zod` to define strict input and output schemas, ensuring type safety between the client and the AI model.
*   **Prompts:** Prompts are defined using `ai.definePrompt` and often use Handlebars templating (`{{{variable}}}`) to insert data into the prompt text.
*   **Running Genkit Inspector:** To test and inspect your flows locally, you can run `npm run genkit:watch`. This starts the Genkit developer UI.

---

## 4. Frontend Guide

### Project Structure (Next.js App Router)

The frontend is built using the Next.js App Router.
*   **Pages/Routes:** Each folder inside `src/app/` represents a URL route (e.g., `src/app/proposals/new/page.tsx` is the page for `/proposals/new`, and `src/app/(protected)/settings/branding/page.tsx` is the page for `/settings/branding`).
*   **Layouts:** `src/app/layout.tsx` is the root layout for the entire application. `src/components/main-layout.tsx` provides the main sidebar and content structure for authenticated pages.
*   **Server Components:** By default, components are React Server Components, which improves performance. Use the `'use client';` directive at the top of a file to make it a Client Component (necessary for hooks like `useState` and `useEffect`).

### Components

*   **UI Components (`src/components/ui`):** These are core, reusable UI elements from the ShadCN UI library (e.g., `Button`, `Card`, `Input`).
*   **Custom Components (`src/components`):** These are larger, application-specific components composed of smaller UI elements (e.g., `ProposalWizard`, `MainLayout`).

### Styling

*   **Tailwind CSS:** Utility-first CSS framework used for all styling.
*   **Theme & Variables:** The color palette and design system variables (e.g., primary color, background, border radius) are defined as CSS variables in `src/app/globals.css` and configured in `tailwind.config.ts`. This makes it easy to maintain a consistent look and feel and to implement features like dark mode.
