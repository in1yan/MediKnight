'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Permission, UserRole } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Lock, AlertTriangle } from 'lucide-react';

interface RestrictedSectionProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole[];
  fallback?: ReactNode;
  className?: string;
}

export function RestrictedSection({
  children,
  requiredPermission,
  requiredRole,
  fallback,
  className = '',
}: RestrictedSectionProps) {
  const { user } = useAuth();

  if (!user) {
    return fallback || <AccessDeniedBlock title="Authentication Required" />;
  }

  const hasPermission = requiredPermission
    ? user.permissions.includes(requiredPermission)
    : true;

  const hasRole = requiredRole ? requiredRole.includes(user.role) : true;

  if (!hasPermission || !hasRole) {
    return (
      fallback || (
        <AccessDeniedBlock
          title="Access Denied"
          description={
            !hasRole
              ? `This section is only available to ${requiredRole?.join(', ')} users`
              : `You don't have the required permission: ${requiredPermission}`
          }
          showBreakGlass={user.permissions.includes('break_glass_access')}
        />
      )
    );
  }

  return <div className={className}>{children}</div>;
}

export function AccessDeniedBlock({
  title = 'Access Denied',
  description = "You don't have permission to access this content",
  showBreakGlass = false,
}: {
  title?: string;
  description?: string;
  showBreakGlass?: boolean;
}) {
  const [showBreakGlassForm, setShowBreakGlassForm] = React.useState(false);

  return (
    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-red-800 dark:text-red-200 mb-4">{description}</p>

          {showBreakGlass && !showBreakGlassForm && (
            <button
              onClick={() => setShowBreakGlassForm(true)}
              className="text-sm text-red-700 dark:text-red-300 hover:underline font-medium flex items-center gap-1"
            >
              <AlertTriangle className="h-4 w-4" />
              Request Break Glass Access
            </button>
          )}

          {showBreakGlassForm && (
            <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-800 space-y-3">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Break Glass Access Request
              </p>
              <p className="text-xs text-muted-foreground">
                This action will be logged and audited. Please provide a reason for emergency access:
              </p>
              <textarea
                className="w-full h-20 p-2 border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-600 outline-none"
                placeholder="Reason for emergency access..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowBreakGlassForm(false)}
                  className="px-3 py-1 text-sm rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">
                  Request Access
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface HasPermissionProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function HasPermission({ permission, children, fallback }: HasPermissionProps) {
  const { user } = useAuth();
  const hasPermission = user?.permissions.includes(permission);

  return <>{hasPermission ? children : fallback}</>;
}
