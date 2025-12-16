
'use client';

import { useTour } from './use-tour';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export const TourGuide = () => {
    const { isActive, steps, currentStepIndex, nextStep, prevStep, endTour } = useTour();
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

    const currentStep = steps[currentStepIndex];

    useEffect(() => {
        if (isActive && currentStep) {
            const element = document.getElementById(currentStep.targetId);
            if (element) {
                setTargetElement(element);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // If target not found, maybe move to next step or end tour
                console.warn(`Tour target "${currentStep.targetId}" not found.`);
                // For simplicity, we end the tour. A more robust solution could try to find it
                // for a few seconds or skip the step.
                endTour();
            }
        }
    }, [currentStep, isActive, endTour]);
    
    if (!isActive || !currentStep || !targetElement) {
        return null;
    }

    return (
        <Popover open={true}>
             <PopoverAnchor asChild>
                <div 
                    style={{
                        position: 'fixed',
                        top: targetElement.getBoundingClientRect().top,
                        left: targetElement.getBoundingClientRect().left,
                        width: targetElement.getBoundingClientRect().width,
                        height: targetElement.getBoundingClientRect().height,
                        pointerEvents: 'none',
                    }}
                />
            </PopoverAnchor>
            <PopoverContent 
                side={currentStep.side || 'bottom'} 
                align={currentStep.align || 'center'}
                className="w-80 shadow-2xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">{currentStep.title}</h3>
                    <p className="text-sm text-muted-foreground">{currentStep.content}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                           Step {currentStepIndex + 1} of {steps.length}
                        </span>
                        <div className="flex gap-2">
                           {currentStepIndex > 0 && (
                                <Button variant="outline" size="sm" onClick={prevStep}>
                                    Previous
                                </Button>
                            )}
                            <Button size="sm" onClick={nextStep}>
                                {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
