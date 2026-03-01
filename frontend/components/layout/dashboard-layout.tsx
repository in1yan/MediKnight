'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: string[];
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, hasRedirected, router]);

  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page
          </p>
          <button
            onClick={() => router.push(`/dashboard/${user.role}`)}
            className="text-blue-600 hover:underline font-medium"
          >
            Go to your dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto lg:pl-0">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
