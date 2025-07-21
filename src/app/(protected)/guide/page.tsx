
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
  PenSquare,
  CheckCircle,
  Download,
  Settings,
  Briefcase,
  GitBranch,
} from "lucide-react";

export default function GuidePage() {
  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold">User Guide</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to the Flow Sales Co-Pilot! Here’s how to get the most out of the platform.
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
                  industry. If you choose to use the AI Transcript Analysis in the next step, a template may be automatically selected for you.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Step 2: Use AI to Generate Content
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">This step has two AI-powered paths:</p>
                   <p className="mb-2"><strong>Quick Summary:</strong> Select your client, paste your meeting notes or a summary of the client's pain points into the 'Pain Points' field, and click <strong>"Generate Executive Summary"</strong>. This will craft a professional opening for your proposal.</p>
                  <p><strong>Full Transcript Analysis:</strong> For maximum efficiency, paste the entire meeting transcript into the 'Meeting Transcript' field and click <strong>"Analyze Transcript & Generate All Content"</strong>. Our AI will read the conversation, select the best template, identify client pain points, suggest relevant products, and draft both a "Problem Statement" and "Proposed Solution" section for you.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Step 3: Select Modules & Products</AccordionTrigger>
                <AccordionContent>
                  Browse our catalog of products and services. Check the boxes next to the ones that solve your client's problems. The total price of the proposal will update dynamically on the right. If your administrator has set up product rules, selecting one product may automatically add another required dependency.
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
              Collaboration & Client Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="flex items-start gap-4">
              <MessageCircle className="h-5 w-5 mt-1 text-primary shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Live Comments</h4>
                <p>On the proposal detail page, you and your client can communicate directly in the <strong>"Comments & Discussion"</strong> section. Any comments you post will appear in real-time for seamless collaboration.</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <PenSquare className="h-5 w-5 mt-1 text-primary shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Suggest Edits</h4>
                <p>Clients can suggest changes directly on the proposal. By hovering over a section, they can click the <strong>"Suggest Edit"</strong> button, propose new text, and submit it for your review.</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <CheckCircle className="h-5 w-5 mt-1 text-primary shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Accept Proposal</h4>
                <p>Once the client is satisfied, they can click the <strong>"Accept & E-Sign"</strong> button to formally accept the proposal, which will update its status accordingly.</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <Download className="h-5 w-5 mt-1 text-primary shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Download PDF</h4>
                <p>Anyone with access can download a clean, formatted PDF of the proposal at any time using the <strong>"Download as PDF"</strong> button.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="text-primary" />
              Admin Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Users with 'admin' privileges can configure the application by navigating to the Settings page. This is where you manage the core building blocks of your proposals.</p>
             <div className="flex items-start gap-4">
              <Briefcase className="h-5 w-5 mt-1 text-primary shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Product Catalog</h4>
                <p>Add, edit, and manage all the products and services your company offers. These will appear in the "Select Modules" step of the proposal wizard.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <GitBranch className="h-5 w-5 mt-1 text-primary shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Product Rules</h4>
                <p>Define dependencies between products. For example, you can create a rule that says "Product A requires Product B," ensuring that agents always include necessary components in their proposals.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <FileText className="h-5 w-5 mt-1 text-primary shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Template Management</h4>
                <p>Navigate to the "Templates" page from the main sidebar to create new proposal templates. Define default sections and content to standardize your sales documents across the organization.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
