
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignInWithEmailAndPassword, useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function FlowSalesLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-md bg-primary text-primary-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3L2 7l10 4 10-4-10-4z"></path>
          <path d="M2 17l10 4 10-4"></path>
          <path d="M2 12l10 4 10-4"></path>
        </svg>
      </div>
      <h1 className="text-2xl font-headline font-bold tracking-tighter">
        Flow Sales Co-Pilot
      </h1>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
  const [createUserWithEmailAndPassword, newUser, creating, createError] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(email, password);
  };
  
  const handleSignUp = (e: React.FormEvent) => {
      e.preventDefault();
      createUserWithEmailAndPassword(email, password);
  };

  useEffect(() => {
    if (user || newUser) {
      router.push('/');
    }
  }, [user, newUser, router]);

  useEffect(() => {
    if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive"});
    }
    if (createError) {
        toast({ title: "Sign Up Failed", description: createError.message, variant: "destructive"});
    }
  }, [error, createError, toast]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <FlowSalesLogo />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-headline">Welcome</CardTitle>
            <CardDescription>
              Enter your credentials to access your sales dashboard.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || creating}>
                {(loading || creating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log in
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Button variant="link" onClick={handleSignUp} className="underline p-0 h-auto" disabled={loading || creating}>
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
