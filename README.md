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
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, App Hosting)
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

3.  **Firebase & Google Cloud Configuration:**
    This project requires several cloud services to be enabled and configured. See the **"Cloud Services Configuration"** section below for a detailed checklist. After completing those steps, you will have the necessary credentials to populate your `.env` file.

4.  **Create `.env` File:**
    Create a file named `.env` in the root of the project and populate it with the credentials you obtained from the setup steps. It should look like this:
    ```
    # Firebase Client SDK Credentials
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=1:...

    # Google AI (Gemini) API Key
    GEMINI_API_KEY=AIza...

    # Firebase Admin SDK (Service Account)
    # Paste the entire contents of your service account JSON file here.
    FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...}
    ```

5.  **Deploy Firestore Rules:**
    Log in to Firebase and deploy the security rules from your local terminal.
    ```bash
    firebase login
    firebase deploy --only firestore
    ```
    *Note: The first time you deploy, the CLI may ask you to associate this local project with your Firebase project.*

6.  **Run the Development Server:**
    Start the Next.js application.
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

---

## 3. Cloud Services Configuration

For the application to function fully, you must enable the following APIs and services in your Firebase and Google Cloud consoles.

### In the Firebase Console:

1.  **Authentication:**
    *   Navigate to **Authentication** > **Sign-in method**.
    *   Enable the **Email/Password** provider.

2.  **Firestore:**
    *   Navigate to the **Firestore Database** section.
    *   Click **Create database** and start in **production mode**. Choose a location for your database.

3.  **App Hosting:**
    *   Navigate to the **App Hosting** section.
    *   Follow the prompts to enable App Hosting for your project. This is required for public deployment.

### In the Google Cloud Console:

*Note: Ensure you are working within the same project that is linked to your Firebase project.*

1.  **Vertex AI API (for Gemini):**
    *   Use the search bar to find and select the **Vertex AI API**.
    *   Click **Enable**. This is required for all Genkit and Generative AI features.
    *   Navigate to **APIs & Services > Credentials** to create an API key. This key will be your `GEMINI_API_KEY`.

2.  **Speech-to-Text API:**
    *   Use the search bar to find and select the **Cloud Speech-to-Text API**.
    *   Click **Enable**. This is required for the live meeting transcription feature.

### Firebase Admin (Service Account):

The application's backend uses the Firebase Admin SDK for tasks like inviting users. This requires a service account key.

1.  **Generate Private Key:**
    *   In the **Firebase Console**, go to **Project Settings** (click the gear icon) > **Service accounts**.
    *   Click the **"Generate new private key"** button. A JSON file will be downloaded.

2.  **Set Environment Variable:**
    *   Open the downloaded JSON file in a text editor.
    *   Copy the **entire contents** of the file, starting from `{` and ending with `}`.
    *   In your project, open the `.env` file.
    *   Find the line that starts with `FIREBASE_SERVICE_ACCOUNT_KEY=`.
    *   Paste the copied JSON content directly after the equals sign. The result should look like this: `FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...}`. The value should be all on one line.

---

## 4. Backend Guide

### Firestore Database

Firestore is our primary database. The data models are defined as TypeScript interfaces in `src/lib/types.ts`.

*   **`users`**: Stores authenticated user data.
*   **`clients`**: A simple CRM for managing client information.
*   **`products`**: A catalog of products and services that can be included in proposals.
*   **`content_library`**: Reusable content blocks (e.g., case studies, legal clauses) for dynamic proposal generation.
*   **`proposals`**: The core collection holding all proposal documents. It links to `users` and `clients`.

### Firestore Security Rules

Security is managed in `firestore.rules`. The rules enforce that:
*   Users can only read/write their own document in the `users` collection.
*   Authenticated users can read shared resources like `clients` and `products`.
*   Users can only create, read, update, or delete proposals where their `uid` matches the `salesAgentId` on the proposal document.

### Generative AI with Genkit

We use Genkit to interact with Google's Gemini models for AI-powered features.

*   **Flows:** AI logic is encapsulated in "flows," located in `src/ai/flows/`. Each flow is a server-side function that can be called from the frontend.
*   **Schemas:** Each flow uses `zod` to define strict input and output schemas, ensuring type safety between the client and the AI model.
*   **Prompts:** Prompts are defined using `ai.definePrompt` and often use Handlebars templating (`{{{variable}}}`) to insert data into the prompt text.
*   **Running Genkit Inspector:** To test and inspect your flows locally, you can run `npm run genkit:watch`. This starts the Genkit developer UI.

---

## 5. Frontend Guide

### Project Structure (Next.js App Router)

The frontend is built using the Next.js App Router.
*   **Pages/Routes:** Each folder inside `src/app/` represents a URL route (e.g., `src/app/proposals/new/page.tsx` is the page for `/proposals/new`).
*   **Layouts:** `src/app/layout.tsx` is the root layout for the entire application. `src/components/main-layout.tsx` provides the main sidebar and content structure for authenticated pages.
*   **Server Components:** By default, components are React Server Components, which improves performance. Use the `'use client';` directive at the top of a file to make it a Client Component (necessary for hooks like `useState` and `useEffect`).

### Components

*   **UI Components (`src/components/ui`):** These are core, reusable UI elements from the ShadCN UI library (e.g., `Button`, `Card`, `Input`).
*   **Custom Components (`src/components`):** These are larger, application-specific components composed of smaller UI elements (e.g., `ProposalWizard`, `MainLayout`).

### Styling

*   **Tailwind CSS:** Utility-first CSS framework used for all styling.
*   **Theme & Variables:** The color palette and design system variables are defined as CSS variables in `src/app/globals.css` and configured in `tailwind.config.ts`.
