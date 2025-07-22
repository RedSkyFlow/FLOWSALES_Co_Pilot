
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { TourStep as TourStepComponent } from '@/components/tour-step';

export interface TourStep {
    selector: string;
    title: string;
    content: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
    isOpen: boolean;
    currentStep: number;
    steps: TourStep[];
    startTour: (tourId: string, steps: TourStep[]) => void;
    stopTour: () => void;
    goToStep: (stepIndex: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    startCurrentTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};

export const TourProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState<TourStep[]>([]);
    const [tourId, setTourId] = useState<string | null>(null);

    const getTourKey = (id: string) => `tour_${id}_completed`;

    const startTour = useCallback((id: string, tourSteps: TourStep[]) => {
        // Ensure this only runs on the client where localStorage is available
        if (typeof window !== 'undefined') {
            const tourCompleted = localStorage.getItem(getTourKey(id));
            if (tourCompleted) {
                setSteps(tourSteps);
                setTourId(id);
                return;
            }
            
            setTourId(id);
            setSteps(tourSteps);
            setCurrentStep(0);
            setIsOpen(true);
        }
    }, []);
    
    const startCurrentTour = useCallback(() => {
        if (steps.length > 0) {
            setCurrentStep(0);
            setIsOpen(true);
        }
    }, [steps]);

    const stopTour = useCallback(() => {
        if (tourId && typeof window !== 'undefined') {
            localStorage.setItem(getTourKey(tourId), 'true');
        }
        setIsOpen(false);
        setCurrentStep(0);
    }, [tourId]);

    const goToStep = useCallback((stepIndex: number) => {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            setCurrentStep(stepIndex);
        }
    }, [steps.length]);

    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            stopTour();
        }
    }, [currentStep, steps.length, stopTour]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const value = {
        isOpen,
        currentStep,
        steps,
        startTour,
        stopTour,
        goToStep,
        nextStep,
        prevStep,
        startCurrentTour,
    };

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
};

// Re-exporting the TourStep component for easy use
export { TourStepComponent as TourStep };
