'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { RoleIndicator } from '@/components/access-control/role-indicator';
import { PermissionsList } from '@/components/access-control/permission-badge';
import { SecurityStatus } from '@/components/dashboard/security-status';
import { ROLE_DESCRIPTIONS } from '@/lib/constants';
import { Shield, Mail, User as UserIcon, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            User Profile
          </h1>
          <p className="text-muted-foreground">
            Your account information and permissions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Name */}
                <div className="flex items-center gap-6 pb-6 border-b">
                  <Avatar className="h-16 w-16 bg-blue-600">
                    <AvatarFallback className="text-lg font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {user.name}
                    </p>
                    <RoleIndicator role={user.role} />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Email
                      </p>
                    </div>
                    <p className="text-sm break-all">{user.email}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        User ID
                      </p>
                    </div>
                    <p className="text-sm font-mono">{user.id}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Last Login
                      </p>
                    </div>
                    <p className="text-sm">
                      {user.lastLogin
                        ? format(new Date(user.lastLogin), 'MMM d, yyyy h:mm a')
                        : 'Never'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        MFA Status
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        user.mfaEnabled
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                          : 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400'
                      }`}
                    >
                      {user.mfaEnabled ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Description */}
            <Card>
              <CardHeader>
                <CardTitle>Role Information</CardTitle>
                <CardDescription>
                  Details about your role and responsibilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {ROLE_DESCRIPTIONS[user.role]}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Your Permissions
                  </p>
                  <PermissionsList permissions={user.permissions} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Panel */}
          <div>
            <SecurityStatus />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
