'use client';
import { MainLayout } from "@/components/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  mockProposals,
  mockComments,
  mockVersions,
} from "@/lib/mock-data";
import { notFound } from "next/navigation";
import {
  FileText,
  MessageCircle,
  Clock,
  CheckCircle,
  DollarSign,
  PenSquare,
  Download,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ClientDate } from "@/components/client-date";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'Accepted':
    case 'Signed':
    case 'Paid':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
    case 'Sent':
    case 'Viewed':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800';
    case 'Changes Requested':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800';
    case 'Draft':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  }
}

export default function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const proposal = mockProposals.find((p) => p.id === params.id);

  if (!proposal) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="pb-6 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-headline font-bold text-primary">{proposal.title}</h1>
                        <p className="text-lg text-muted-foreground mt-1">For {proposal.client.name}</p>
                    </div>
                    <Badge variant="outline" className={`text-base px-4 py-2 ${getStatusBadgeVariant(proposal.status)}`}>
                        {proposal.status}
                    </Badge>
                </div>
                 <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span>Version {proposal.version}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>Last updated on <ClientDate dateString={proposal.lastUpdated} /></span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="font-bold text-lg text-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalValue)}</span>
                </div>
            </div>

          {/* Proposal Content */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2"><FileText className="text-primary"/> Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Global Stadium Corp faces significant challenges in enhancing fan engagement and streamlining operations. Our proposed Stadium OS solution directly addresses these pain points by integrating a state-of-the-art fan engagement platform, a secure smart ticketing system, and an efficient in-seat concessions ordering module. This comprehensive system will not only elevate the fan experience but also create new revenue streams and provide valuable data insights.
              </p>
              <p>
                By implementing our solution, Global Stadium Corp can expect to see a marked increase in per-capita spending, improved crowd management, and higher fan satisfaction rates, solidifying its position as a world-class venue.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Included Modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {proposal.modules.map((module) => (
                <div key={module.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{module.name}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <p className="text-right font-bold mt-2">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(module.price)}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 rounded-b-lg flex justify-end">
                <div className="text-right">
                    <p className="text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalValue)}</p>
                </div>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <CheckCircle /> Client Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">
                <PenSquare className="mr-2 h-4 w-4" /> Accept & E-Sign
              </Button>
               <Button variant="secondary" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download as PDF
              </Button>
              <Separator className="my-2" />
               <Button variant="accent" className="w-full">
                <DollarSign className="mr-2 h-4 w-4" /> Pay Deposit or Full Amount
              </Button>
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MessageCircle /> Comments & Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={comment.author.avatarUrl} />
                    <AvatarFallback>{comment.author.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">{comment.author.name}</p>
                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t pt-4">
                <div className="w-full space-y-2">
                    <Textarea placeholder="Add a comment or suggest an edit..." />
                    <Button size="sm" className="w-full">Post Comment</Button>
                </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Clock /> Version History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockVersions.map((version) => (
                <div key={version.number} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-8 h-8 mb-1">
                      <AvatarImage src={version.author.avatarUrl} />
                      <AvatarFallback>{version.author.initials}</AvatarFallback>
                    </Avatar>
                    <div className="w-px flex-1 bg-border"></div>
                  </div>
                  <div>
                    <p className="font-semibold">Version {version.number}</p>
                    <p className="text-sm text-muted-foreground">{version.summary}</p>
                    <p className="text-xs text-muted-foreground mt-1"><ClientDate dateString={version.date} /></p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
