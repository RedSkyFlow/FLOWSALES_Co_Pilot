
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Package, FileText, Bot } from 'lucide-react';
import type { Product, ProposalSection } from '@/lib/types';

interface LiveCopilotViewProps {
  transcript: string;
  detectedPainPoints: string[];
  suggestedProducts: Product[];
  draftedSections: ProposalSection[];
}

export function LiveCopilotView({
  transcript,
  detectedPainPoints,
  suggestedProducts,
  draftedSections,
}: LiveCopilotViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]">
      
      {/* Live Transcript */}
      <Card className="lg:col-span-1 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Bot className="h-5 w-5 text-primary" /> Live Transcript</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {transcript || "Waiting for audio..."}
            </p>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md"><Lightbulb className="h-5 w-5 text-impact" /> Detected Pain Points</CardTitle>
          </CardHeader>
          <CardContent>
            {detectedPainPoints.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {detectedPainPoints.map((point, i) => <Badge key={i} variant="secondary">{point}</Badge>)}
                </div>
            ) : <p className="text-sm text-muted-foreground">AI is listening for client needs...</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md"><Package className="h-5 w-5 text-secondary" /> Suggested Products</CardTitle>
          </CardHeader>
          <CardContent>
             {suggestedProducts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {suggestedProducts.map((p) => <Badge key={p.id}>{p.name}</Badge>)}
                </div>
            ) : <p className="text-sm text-muted-foreground">AI will suggest products based on the conversation...</p>}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md"><FileText className="h-5 w-5" /> Drafted Sections</CardTitle>
            </CardHeader>
            <CardContent>
                {draftedSections.length > 0 ? (
                    <div className="space-y-2 text-sm">
                        {draftedSections.map((section, i) => (
                           <div key={i} className="border-b last:border-none pb-2">
                               <p className="font-semibold">{section.title}</p>
                               <p className="text-muted-foreground line-clamp-2">{section.content}</p>
                           </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-muted-foreground">AI will draft proposal sections here...</p>}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
