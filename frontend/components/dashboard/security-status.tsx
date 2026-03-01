'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { Shield, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function SecurityStatus() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;
  const timeAgo = lastLoginDate
    ? Math.floor((Date.now() - lastLoginDate.getTime()) / (1000 * 60))
    : null;

  const getTimeAgoLabel = (minutes: number): string => {
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Security Status
        </CardTitle>
        <CardDescription>Session and account security information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* MFA Status */}
        <div className="flex items-start gap-3 pb-4 border-b last:border-0">
          <div className="flex-shrink-0">
            {user.mfaEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Multi-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">
              {user.mfaEnabled ? 'Enabled - Your account is protected' : 'Disabled - Consider enabling for security'}
            </p>
          </div>
        </div>

        {/* Last Login */}
        <div className="flex items-start gap-3 pb-4 border-b last:border-0">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Last Login</p>
            <p className="text-xs text-muted-foreground">
              {lastLoginDate
                ? `${getTimeAgoLabel(timeAgo || 0)} • ${format(lastLoginDate, 'MMM d, yyyy h:mm a')}`
                : 'No previous login'}
            </p>
          </div>
        </div>

        {/* Account Status */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Account Status</p>
            <p className="text-xs text-muted-foreground">Active and in good standing</p>
          </div>
        </div>

        {/* Permissions Summary */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
            Your Permissions
          </p>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400"
              >
                {perm.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
