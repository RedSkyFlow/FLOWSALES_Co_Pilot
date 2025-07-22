
'use client';

import { MainLayout } from "@/components/main-layout";
import type React from "react";
import { AIChatAssistant } from "@/components/ai-chat-assistant";


// This layout component wraps all pages that need the main application layout
// and access to global app data.
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
      <AIChatAssistant />
    </MainLayout>
  );
}
