import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';
import { AppDataProvider } from '@/components/app-data-provider';
import { TourProvider } from '@/hooks/use-tour';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flow Sales Co-Pilot',
  description: 'Your intelligent partner in sales.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${inter.className} antialiased`}>
        <AppDataProvider>
          <TourProvider>
            {children}
            <Toaster />
          </TourProvider>
        </AppDataProvider>
      </body>
    </html>
  );
}
