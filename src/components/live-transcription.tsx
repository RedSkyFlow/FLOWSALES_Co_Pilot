
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Loader2, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface LiveTranscriptionProps {
  onTranscriptFinalized: (transcript: string) => void;
  isAnalysisLoading: boolean;
}

export function LiveTranscription({ onTranscriptFinalized, isAnalysisLoading }: LiveTranscriptionProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => prev + finalTranscript);
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart recognition if it stops unexpectedly
          recognition.start();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
          variant: 'destructive',
          title: 'Transcription Error',
          description: `An error occurred: ${event.error}. Please try again.`,
        });
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;

    } else {
      setIsSupported(false);
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Live transcription is not supported by your browser. Please try Chrome or Edge.',
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast, isListening]);

  const handleToggleListen = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      onTranscriptFinalized(transcript);
      setIsListening(false);
    } else {
      setTranscript(''); // Clear previous transcript
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <Card className="w-full">
        <CardContent className="p-4">
            <ScrollArea className="h-48 w-full rounded-md border p-4 bg-background">
              <p className="text-sm text-left whitespace-pre-wrap">
                {transcript || <span className="text-muted-foreground">Transcript will appear here...</span>}
              </p>
            </ScrollArea>
        </CardContent>
      </Card>
      <Button
        onClick={handleToggleListen}
        disabled={!isSupported || isAnalysisLoading}
        size="lg"
        className={cn("rounded-full w-24 h-24", isListening && "bg-destructive hover:bg-destructive/90")}
      >
        {isAnalysisLoading ? (
            <Loader2 className="h-10 w-10 animate-spin" />
        ) : isListening ? (
          <StopCircle className="h-10 w-10" />
        ) : (
          <Mic className="h-10 w-10" />
        )}
      </Button>
      <p className="text-sm text-muted-foreground">
        {isAnalysisLoading ? 'Analyzing...' : isListening ? 'Click to stop and analyze' : 'Click to start live transcription'}
      </p>
    </div>
  );
}
