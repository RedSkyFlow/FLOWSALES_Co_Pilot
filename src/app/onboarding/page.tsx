
import { OnboardingWizard } from "@/components/onboarding-wizard";

// This is a stand-alone page with a unique layout for the onboarding process.
export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <OnboardingWizard />
      </div>
    </div>
  );
}
