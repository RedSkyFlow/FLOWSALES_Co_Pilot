
'use client';

import { createContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { TourGuide } from './tour-guide';

export interface TourStep {
    id: string;
    title: string;
    content: string;
    targetId: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
}

interface TourContextType {
    isActive: boolean;
    currentStepIndex: number;
    steps: TourStep[];
    startTour: () => void;
    endTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    setSteps: (steps: TourStep[]) => void;
}

export const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider = ({ children }: { children: ReactNode }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [steps, setSteps] = useState<TourStep[]>([]);

    const startTour = useCallback(() => {
        if(steps.length > 0) {
            setCurrentStepIndex(0);
            setIsActive(true);
        } else {
            console.warn("No tour steps defined for this page.")
        }
    }, [steps]);

    const endTour = useCallback(() => {
        setIsActive(false);
        setCurrentStepIndex(0);
    }, []);

    const nextStep = useCallback(() => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            endTour();
        }
    }, [currentStepIndex, steps.length, endTour]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    const value = useMemo(() => ({
        isActive,
        currentStepIndex,
        steps,
        startTour,
        endTour,
        nextStep,
        prevStep,
        setSteps,
    }), [isActive, currentStepIndex, steps, startTour, endTour, nextStep, prevStep]);

    return (
        <TourContext.Provider value={value}>
            {children}
            {isActive && steps.length > 0 && <TourGuide />}
        </TourContext.Provider>
    );
};
