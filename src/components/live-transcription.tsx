
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, Loader2, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ConsentDialog } from './consent-dialog';
import { LiveCopilotView } from './live-copilot-view';
import type { Product, ProposalSection } from '@/lib/types';
import { analyzeMeetingTranscript } from '@/ai/flows/analyze-meeting-transcript';
import { useAppContext } from './app-data-provider';


// This component manages the entire "Live Co-pilot" workflow,
// from getting consent to displaying real-time AI analysis.

interface LiveTranscriptionProps {
  onAnalysisComplete: (analysis: {
    detectedPainPoints: string[];
    suggestedProducts: Product[];
    draftedSections: ProposalSection[];
    fullTranscript: string;
  }) => void;
  isAnalysisLoading: boolean;
}

export function LiveTranscription({ onAnalysisComplete, isAnalysisLoading }: LiveTranscriptionProps) {
  const { toast } = useToast();
  const { products, templates } = useAppContext();
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  // Real-time data states
  const [liveTranscript, setLiveTranscript] = useState('');
  const [detectedPainPoints, setDetectedPainPoints] = useState<string[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [draftedSections, setDraftedSections] = useState<ProposalSection[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fullTranscriptRef = useRef<string>('');
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + '. ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setLiveTranscript(prev => prev + final);
        fullTranscriptRef.current += final;
        
        // Debounce the analysis to avoid calling the AI on every word
        if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = setTimeout(() => {
            if (isListening) {
                 // Only analyze if the transcript has meaningful content
                if(fullTranscriptRef.current.split(' ').length > 10) {
                    runLiveAnalysis(fullTranscriptRef.current);
                }
            }
        }, 3000); // Analyze every 3 seconds of speech
      };

      recognition.onerror = (event) => console.error('Speech recognition error', event.error);
      recognition.onend = () => {
        if (isListening) recognition.start(); // Keep listening if active
      };

    } else {
      setIsSupported(false);
    }
     return () => {
      if(analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
    };
  }, [isListening]);

  const runLiveAnalysis = async (currentTranscript: string) => {
     try {
        const formatted = currentTranscript.split('
').map(line => ({ speaker: 'Unknown', text: line }));
        const result = await analyzeMeetingTranscript({
            transcript: formatted,
            availableModules: products.map(p => p.name),
            availableTemplates: templates.map(t => t.name),
        });
        setDetectedPainPoints(result.clientPainPoints);
        setSuggestedProducts(products.filter(p => result.suggestedModules.includes(p.name)));
        setDraftedSections([
            { title: "Problem Statement", content: result.problemStatementDraft, type: 'ai_generated' },
            { title: "Proposed Solution", content: result.solutionProposalDraft, type: 'ai_generated' }
        ]);

     } catch (e) {
         console.error("Live analysis failed:", e);
     }
  }

  const startListening = () => {
    if (!recognitionRef.current) return;
    setLiveTranscript('');
    fullTranscriptRef.current = '';
    setDetectedPainPoints([]);
    setSuggestedProducts([]);
    setDraftedSections([]);
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    recognitionRef.current.stop();
    toast({ title: "Co-pilot Stopped", description: "The live meeting analysis has ended." });
    
    // Pass all the collected data to the parent wizard
    onAnalysisComplete({
        detectedPainPoints,
        suggestedProducts,
        draftedSections,
        fullTranscript: fullTranscriptRef.current
    });
  };

  return (
    <>
      {isListening ? (
        <div className="space-y-4">
            <LiveCopilotView
                transcript={liveTranscript}
                detectedPainPoints={detectedPainPoints}
                suggestedProducts={suggestedProducts}
                draftedSections={draftedSections}
            />
             <Button onClick={stopListening} variant="destructive" className="w-full">
                <StopCircle className="mr-2 h-5 w-5" />
                Stop Co-pilot & Finalize
            </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 border-dashed border-2 rounded-lg">
            <h3 className="text-lg font-semibold">Start Live Meeting Co-pilot</h3>
            <p className="text-sm text-muted-foreground">The AI will listen to the conversation in real-time and help build the proposal automatically.</p>
            <Button
                onClick={() => setIsConsentDialogOpen(true)}
                disabled={!isSupported || isAnalysisLoading}
                size="lg"
                className="hover-glow-secondary"
            >
                {isAnalysisLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <Mic className="mr-2 h-5 w-5" />
                )}
                Start Co-pilot
            </Button>
        </div>
      )}

      <ConsentDialog
        open={isConsentDialogOpen}
        onOpenChange={setIsConsentDialogOpen}
        onConfirm={startListening}
      />
    </>
  );
}
