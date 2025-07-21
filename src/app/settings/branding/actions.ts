
'use server';

import { generateBrandAnalysis as generateBrandAnalysisFlow, type GenerateBrandAnalysisInput } from '@/ai/flows/generate-brand-analysis';

export async function generateBrandAnalysis(input: GenerateBrandAnalysisInput) {
    try {
        const output = await generateBrandAnalysisFlow(input);
        return output;
    } catch (error) {
        console.error("Error in branding analysis server action:", error);
        throw new Error("Failed to analyze branding information.");
    }
}
