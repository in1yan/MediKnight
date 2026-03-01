'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MFAInput } from './mfa-input';
import { AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function MFAForm() {
  const router = useRouter();
  const { user, pendingEmail, isLoading: authLoading, verifyMfa } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  React.useEffect(() => {
    if (!authLoading && !pendingEmail && !user && !hasRedirected) {
      setHasRedirected(true);
      router.push('/auth/login');
    }
    // Already fully authenticated — redirect to dashboard
    if (!authLoading && user && !pendingEmail) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [authLoading, pendingEmail, user, hasRedirected, router]);

  if (authLoading || (!pendingEmail && !user)) {
    return null;
  }

  if (user && !pendingEmail) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Please enter a complete code');
      return;
    }

    setIsLoading(true);
    try {
      const verifiedUser = await verifyMfa(code);
      router.push(`/dashboard/${verifiedUser.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold">Verify Your Identity</CardTitle>
          </div>
          <CardDescription>
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="py-8">
              <MFAInput
                length={6}
                value={code}
                onChange={setCode}
                onComplete={() => {}}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="text-sm text-blue-600 hover:underline"
              >
                Back to login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
