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
      <Card className="mx-auto w-full max-w-sm sm:max-w-md">
        <CardHeader className="p-4 text-center sm:p-6">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 sm:mb-4 sm:h-12 sm:w-12">
            <AlertCircle className="h-5 w-5 text-orange-600 sm:h-6 sm:w-6" />
          </div>
          <CardTitle className="text-lg sm:text-xl">Sign In Required</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            You need to be signed in to proceed with checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-center sm:p-6">
          <SignInButton mode="modal">
            <Button className="w-full" size="sm">
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
