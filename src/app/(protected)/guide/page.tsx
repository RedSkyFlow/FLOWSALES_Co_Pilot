import { MainLayout } from "@/components/main-layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  PlusCircle,
} from "lucide-react";

export default function GuidePage() {
  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold">User Guide</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to the Flow Sales Co-Pilot! Here’s how to get started.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="text-primary" />
              The Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Your dashboard is the central hub for all your sales activities.
              Here you can see all your existing proposals at a glance. You can
              quickly search for a specific proposal by title or client name,
              and filter them by their current status (e.g., Draft, Sent,
              Accepted).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="text-primary" />
              Creating a New Proposal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Step 1: Choose a Template</AccordionTrigger>
                <AccordionContent>
                  Start by clicking the "Create New Proposal" button on the
                  dashboard. You'll be taken to the Proposal Wizard. The first
                  step is to select a template that best fits your client's
                  industry, such as "Stadium OS" or "Shopping Mall Pilot".
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Step 2: Use AI to Generate Content
                </AccordionTrigger>
                <AccordionContent>
                  Select your client and paste your meeting notes or a summary
                  of the client's pain points. Click{" "}
                  <strong>"Generate Executive Summary"</strong> to have our AI
                  craft a professional, persuasive opening for your proposal.
                  This saves you time and ensures your proposal immediately
                  addresses the client's needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Step 3: Select Modules</AccordionTrigger>
                <AccordionContent>
                  Browse our catalog of products and services (Modules). Check
                  the boxes next to the ones that solve your client's problems.
                  The total price of the proposal will update dynamically on the
                  right as you make your selections.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Step 4: Review and Finalize</AccordionTrigger>
                <AccordionContent>
                  In the final step, you'll see a summary of your new proposal.
                  If everything looks correct, click{" "}
                  <strong>"Save and Finalize"</strong>. This will create the
                  proposal and take you to the detailed view where you can share
                  it with the client.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="text-primary" />
              Collaboration & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              On the proposal detail page, you and your client can communicate
              directly in the <strong>"Comments & Discussion"</strong> section.
              Any comments you post will appear in real-time. You can also monitor client engagement via the{" "}
              <strong>"Engagement Analytics"</strong> card, which tracks how many
              times the proposal has been viewed and when it was last opened.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
