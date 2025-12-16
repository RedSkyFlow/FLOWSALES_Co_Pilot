'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AutonomousOnboardingPage() {
  // In a real app, this would be determined by the user's subscription
  const isEnterpriseUser = true; 

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Autonomous Onboarding</h1>
      <p className="text-muted-foreground">
        Connect your external data sources and let our AI proactively optimize your sales workflows.
        This is an Enterprise-tier feature.
      </p>

      {isEnterpriseUser ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your CRM</CardTitle>
              <CardDescription>
                Sync your customer and deal data to enable AI-powered insights and proposal generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button disabled>Connect to Salesforce (Coming Soon)</Button>
              <Button disabled>Connect to HubSpot (Coming Soon)</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Database</CardTitle>
              <CardDescription>
                Connect a read-only replica of your database to allow the AI to learn from historical sales data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled>Connect to PostgreSQL (Coming Soon)</Button>
              <Button disabled>Connect to MySQL (Coming Soon)</Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="text-center p-8">
            <h3 className="text-xl font-semibold">Upgrade to Enterprise</h3>
            <p className="text-muted-foreground mb-4">
                The Autonomous Onboarding Engine is exclusively available for our Enterprise partners.
            </p>
            <Button>Schedule a Demo</Button>
        </Card>
      )}
    </div>
  );
}
