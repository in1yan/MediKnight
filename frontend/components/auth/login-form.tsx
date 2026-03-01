'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DEMO_USERS = [
  { label: 'Admin',   email: 'admin@example.com',   role: 'admin' },
  { label: 'Doctor',  email: 'doctor@example.com',  role: 'doctor' },
  { label: 'Nurse',   email: 'nurse@example.com',   role: 'nurse' },
  { label: 'Patient', email: 'patient@example.com', role: 'patient' },
];

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.requiresMfa) {
        router.push('/auth/mfa');
      } else {
        router.push(`/dashboard/${result.role}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your healthcare portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Demo accounts section */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Try a demo account</span>
              </div>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs">
                Demo accounts sign in instantly — <strong>no OTP required</strong>.
                Password: <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">Demo@1234</code>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((d) => (
                <Button
                  key={d.role}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo(d.email)}
                  className={email === d.email ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}
                >
                  {d.label}
                </Button>
              ))}
            </div>

            {email && DEMO_USERS.find(d => d.email === email) && (
              <p className="text-xs text-center text-muted-foreground">
                {email} · password pre-filled
              </p>
            )}

            <div className="pt-2 text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <button
                type="button"
                onClick={() => router.push('/auth/signup')}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
