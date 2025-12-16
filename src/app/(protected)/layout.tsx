
'use client';

import { MainLayout } from '@/components/main-layout';
import { TourProvider } from '@/components/tour/tour-provider';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TourProvider>
      <MainLayout>{children}</MainLayout>
    </TourProvider>
  );
}
