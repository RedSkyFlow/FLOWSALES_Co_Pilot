
'use server';

import { generateBrandAnalysis as generateBrandAnalysisFlow, type GenerateBrandAnalysisInput } from '@/ai/flows/generate-brand-analysis';
import { db } from '@/lib/firebase';
import type { BrandingSettings } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function generateBrandAnalysis(input: GenerateBrandAnalysisInput) {
    try {
        const output = await generateBrandAnalysisFlow(input);
        return output;
    } catch (error) {
        console.error("Error in branding analysis server action:", error);
        throw new Error("Failed to analyze branding information.");
    }
}


export async function saveBrandingSettings(tenantId: string, data: Partial<BrandingSettings>) {
    if (!tenantId) {
        throw new Error("Tenant ID is required.");
    }
    const settingsRef = doc(db, 'tenants', tenantId, 'settings', 'branding');
    try {
        await setDoc(settingsRef, data, { merge: true });
        revalidatePath('/settings/branding');
        revalidatePath('/proposals/[id]', 'page');
    } catch (error) {
        console.error("Error saving branding settings:", error);
        throw new Error("Could not save branding settings.");
    }
}

export async function getBrandingSettings(tenantId: string): Promise<BrandingSettings | null> {
    if (!tenantId) {
        console.error("Tenant ID is required to get branding settings.");
        return null;
    }
    const settingsRef = doc(db, 'tenants', tenantId, 'settings', 'branding');
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as BrandingSettings;
    } else {
        return null;
    }
}
