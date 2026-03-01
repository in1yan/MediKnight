'use client';

import { useAdminStats, useAdminUsers, useAdminAuditLogs } from '@/lib/hooks/use-dashboard-data';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, Activity, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { stats, isLoading: loadingStats } = useAdminStats();
  const { users, isLoading: loadingUsers } = useAdminUsers();
  const { logs, isLoading: loadingLogs } = useAdminAuditLogs(5);

  const recentUsers = users.slice(0, 3);

  return (
    <DashboardLayout requiredRole={['admin']}>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Administration Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, review audit logs, and monitor system security
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /> : (
                <div className="text-3xl font-bold">{stats?.total_users ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed Logins</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /> : (
                <div className="text-3xl font-bold text-orange-600">{stats?.failed_logins ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Security events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /> : (
                <div className="text-3xl font-bold">{stats?.total_audit_logs ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Total entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Patients</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /> : (
                <div className="text-3xl font-bold text-blue-600">{stats?.patients ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Registered patients</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Users
                </CardTitle>
                <CardDescription>
                  Latest registered accounts ({stats ? `${stats.doctors} doctors, ${stats.nurses} nurses, ${stats.patients} patients` : '…'})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No users found.</p>
                ) : (
                  <div className="space-y-4">
                    {recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{u.full_name || u.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-950/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Audit Logs
                </CardTitle>
                <CardDescription>Latest system activity and security events</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLogs ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No audit logs yet.</p>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.user_name} &middot; {new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                        }`}>
                          {log.status === 'success' ? 'Success' : 'Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                <Link href="/dashboard/admin/users">Manage Users</Link>
              </Button>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                <Link href="/dashboard/admin/audit-logs">View Audit Logs</Link>
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                System Settings
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                Security Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
