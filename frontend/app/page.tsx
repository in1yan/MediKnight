'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Stethoscope, Lock, Activity, BarChart3 } from 'lucide-react';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, MOCK_USERS } from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';

const features = [
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    description: 'Fine-grained permissions for patients, doctors, nurses, and admins',
  },
  {
    icon: Lock,
    title: 'Multi-Factor Authentication',
    description: 'Secure your account with 2FA and MFA verification',
  },
  {
    icon: Activity,
    title: 'Audit Logging',
    description: 'Comprehensive audit trails of all user activities',
  },
  {
    icon: BarChart3,
    title: 'Security Dashboard',
    description: 'Real-time security status and session monitoring',
  },
];

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-border bg-white dark:bg-slate-950 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Healthcare Portal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {user ? (
          // Logged in view
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                Welcome, {user.name}!
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access your {user.role} dashboard to manage healthcare records securely
              </p>
            </div>

            <Link href={`/dashboard/${user.role}`}>
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                Go to {ROLE_LABELS[user.role]} Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          // Logged out view
          <>
            {/* Hero */}
            <div className="text-center space-y-6 mb-20">
              <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-full border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Healthcare Security Platform
                </span>
              </div>
              <h2 className="text-5xl font-bold text-balance text-slate-900 dark:text-white">
                Secure Healthcare Access Control
              </h2>
              <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
                A comprehensive platform demonstrating role-based access control, multi-factor
                authentication, and security best practices for healthcare systems
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth/login">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Demo Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="border border-border">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <CardTitle>{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* Demo Roles */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Try Different Roles
                </h3>
                <p className="text-muted-foreground">
                  Log in with different roles to see how the platform adapts to different user types
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(MOCK_USERS).map(([role, userData]) => (
                  <Card key={role} className="border border-border hover:border-blue-400 transition-colors cursor-pointer group">
                    <CardHeader className="space-y-4">
                      <div>
                        <CardTitle className="capitalize text-lg">{ROLE_LABELS[role]}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {ROLE_DESCRIPTIONS[role]}
                        </CardDescription>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Email: </span>
                          <span className="font-mono text-xs">{userData.email}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Password: </span>
                          <span className="font-mono text-xs">password</span>
                        </div>
                      </div>
                      <Link href="/auth/login" onClick={() => {
                        // Store the role preference in localStorage for the login form
                        localStorage.setItem('preferred_role', role);
                      }}>
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Try as {ROLE_LABELS[role]}
                        </Button>
                      </Link>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-20 pt-12 border-t border-border">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Four Role Types
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Patient, Doctor, Nurse, and Admin roles with customized dashboards
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    Security Focus
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Multi-factor authentication, permission checks, and audit logging
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    Healthcare Data
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Realistic medical records, prescriptions, and patient information
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white dark:bg-slate-950 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          Healthcare Security & Access Control Platform • Built for demonstration
        </div>
      </footer>
    </div>
  );
}
