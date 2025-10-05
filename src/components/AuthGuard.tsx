'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
};

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while authentication is being checked
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  // If authentication is required but user is not signed in
  if (requireAuth && !isSignedIn) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Sign In Required</CardTitle>
          <CardDescription>
            You need to be signed in to proceed with checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <SignInButton mode="modal">
            <Button className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In to Continue
            </Button>
          </SignInButton>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
