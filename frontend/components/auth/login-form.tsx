'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Zap, Shield, Stethoscope, HeartPulse, UserRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DEMO_USERS = [
  { label: 'Admin',   email: 'admin@example.com',   role: 'admin',   icon: Shield,        desc: 'Manage users & system' },
  { label: 'Doctor',  email: 'doctor@example.com',  role: 'doctor',  icon: Stethoscope,   desc: 'View patients & prescribe' },
  { label: 'Nurse',   email: 'nurse@example.com',   role: 'nurse',   icon: HeartPulse,    desc: 'Record vitals & notes' },
  { label: 'Patient', email: 'patient@example.com', role: 'patient', icon: UserRound,     desc: 'View records & appointments' },
];
const DEMO_PASSWORD = 'Demo@1234';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);

  const doLogin = async (e: string, p: string) => {
    setError('');
    setIsLoading(true);
    try {
      const result = await login(e, p);
      if (result.requiresMfa) {
        router.push('/auth/mfa');
      } else {
        router.push(`/dashboard/${result.role}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
      setLoadingDemo(null);
    }
  };

  // Auto-login if arriving from landing page "Try as X" button
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const preferred = localStorage.getItem('preferred_demo_email');
    if (preferred) {
      localStorage.removeItem('preferred_demo_email');
      const demo = DEMO_USERS.find(d => d.email === preferred);
      if (demo) {
        setEmail(demo.email);
        setPassword(DEMO_PASSWORD);
        setLoadingDemo(demo.role);
        doLogin(demo.email, DEMO_PASSWORD);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  const handleDemoLogin = (demo: typeof DEMO_USERS[0]) => {
    setEmail(demo.email);
    setPassword(DEMO_PASSWORD);
    setLoadingDemo(demo.role);
    doLogin(demo.email, DEMO_PASSWORD);
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
              {isLoading && !loadingDemo ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
              ) : 'Sign In'}
            </Button>

            {/* Demo accounts section */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Try a demo account</span>
              </div>
            </div>

            <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <Zap className="h-4 w-4 text-amber-600 shrink-0" />
              <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                Click any role below to <strong>instantly log in</strong> — no OTP or email verification needed for demo accounts.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((d) => {
                const Icon = d.icon;
                const isThisLoading = loadingDemo === d.role;
                return (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => !isLoading && handleDemoLogin(d)}
                    disabled={isLoading}
                    className="flex items-start gap-2 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isThisLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mt-0.5 text-blue-600 shrink-0" />
                    ) : (
                      <Icon className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium leading-none">{d.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Demo password: <code className="font-mono bg-muted px-1 py-0.5 rounded">{DEMO_PASSWORD}</code>
            </p>

            <div className="pt-1 text-center text-sm">
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
