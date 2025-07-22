
'use client';

import { AppDataProvider, useAppData } from "@/components/app-data-provider";
import { MainLayout } from "@/components/main-layout";
import { TourProvider } from "@/hooks/use-tour";
import { Loader2 } from "lucide-react";
import type React from "react";

function hexToHsl(hex: string): string | null {
    if (!hex || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
        return null;
    }
    let r, g, b;
    hex = hex.substring(1);
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}


function ApplyBrandingLayout({ children }: { children: React.ReactNode }) {
  const { brandingSettings, loading } = useAppData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    );
  }

  const dynamicStyles: React.CSSProperties = {};
  if (brandingSettings?.primaryColor) {
      const primaryHsl = hexToHsl(brandingSettings.primaryColor);
      if (primaryHsl) dynamicStyles['--primary'] = primaryHsl;
  }
  if (brandingSettings?.secondaryColor) {
      const secondaryHsl = hexToHsl(brandingSettings.secondaryColor);
      if (secondaryHsl) dynamicStyles['--secondary'] = secondaryHsl;
  }

  return (
    <div style={dynamicStyles}>
      {children}
    </div>
  );
}


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
        <ApplyBrandingLayout>
          <MainLayout>
            {children}
          </MainLayout>
        </ApplyBrandingLayout>
      </TourProvider>
    </AppDataProvider>
  );
}
