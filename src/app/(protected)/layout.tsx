
import { AppDataProvider } from "@/components/app-data-provider";
import { MainLayout } from "@/components/main-layout";

// This layout component wraps all pages that need the main application layout
// and access to global app data.
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppDataProvider>
      <MainLayout>
        {children}
      </MainLayout>
    </AppDataProvider>
  );
}
