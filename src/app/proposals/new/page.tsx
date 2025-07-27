
'use client'

import { MainLayout } from "@/components/main-layout";
import { ProposalWizard } from "@/components/proposal-wizard";
import { useTour } from "@/components/tour/use-tour";
import { proposalWizardTourSteps } from "@/components/tour/tour-steps";
import { useEffect } from "react";

export default function NewProposalPage() {
  const { setSteps } = useTour();

  useEffect(() => {
    setSteps(proposalWizardTourSteps);
  }, [setSteps]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-headline font-bold">Create a New Proposal</h1>
        <p className="text-muted-foreground">
          Follow the steps to generate a tailored proposal for your client.
        </p>
      </div>
      <ProposalWizard />
    </div>
  );
}
