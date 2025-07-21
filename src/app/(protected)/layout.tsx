

import { AppDataProvider } from "@/components/app-data-provider";
import { MainLayout } from "@/components/main-layout";
import { TourProvider } from "@/hooks/use-tour";

// This layout component wraps all pages that need the main application layout
// and access to global app data.
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppDataProvider>
      <TourProvider>
        <MainLayout>
          {children}
        </MainLayout>
      </TourProvider>
    </AppDataProvider>
  );
}
