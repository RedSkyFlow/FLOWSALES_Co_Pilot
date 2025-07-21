
'use client';

import React, { useEffect, useState } from 'react';
import { useTour } from '@/hooks/use-tour';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const TourStep = () => {
    const { isOpen, stopTour, currentStep, steps, nextStep, prevStep } = useTour();
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

    const step = steps[currentStep];

    useEffect(() => {
        if (isOpen && step) {
            const element = document.querySelector<HTMLElement>(step.selector);
            setTargetElement(element);
             if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }
    }, [isOpen, step, currentStep]);

    if (!isOpen || !step || !targetElement) {
        return null;
    }

    return (
        <Popover open={true} onOpenChange={stopTour}>
            <PopoverAnchor asChild>
                <div 
                    style={{
                        position: 'fixed',
                        top: targetElement.getBoundingClientRect().top,
                        left: targetElement.getBoundingClientRect().left,
                        width: targetElement.getBoundingClientRect().width,
                        height: targetElement.getBoundingClientRect().height,
                        pointerEvents: 'none',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                        borderRadius: '0.5rem',
                    }}
                />
            </PopoverAnchor>
            <PopoverContent
                side={step.side || 'bottom'}
                align="center"
                className="w-80 shadow-2xl"
                onEscapeKeyDown={stopTour}
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">{step.title}</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={stopTour}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">{step.content}</p>

                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            Step {currentStep + 1} of {steps.length}
                        </p>
                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <Button variant="outline" size="sm" onClick={prevStep}>
                                    Previous
                                </Button>
                            )}
                            <Button size="sm" onClick={nextStep}>
                                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
