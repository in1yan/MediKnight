'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminAuditLogsFull } from '@/lib/hooks/use-dashboard-data';
import { CheckCircle2, AlertCircle, Search, Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const PAGE_SIZE = 50;

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failure'>('all');
  const [page, setPage] = useState(0);

  const { logs: rawLogs, isLoading, error, refetch } = useAdminAuditLogsFull(page * PAGE_SIZE, PAGE_SIZE, '');

  // Apply client-side filters
  const filteredLogs = rawLogs.filter((log) => {
    const matchesSearch =
      !search ||
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const successCount = filteredLogs.filter((l) => l.status === 'success').length;
  const failureCount = filteredLogs.filter((l) => l.status === 'failure').length;

  return (
    <DashboardLayout requiredRole={['admin']}>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Audit Logs
            </h1>
            <p className="text-muted-foreground">
              Comprehensive system activity and security event logging
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Audit Trail</CardTitle>
            <CardDescription>
              All user actions and system events are logged for security and compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, action, or resource..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'success', 'failure'] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={statusFilter === s ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(s)}
                    className={statusFilter === s ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
            ) : error ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Try again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Action</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Resource</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">IP</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                          No audit logs found.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <td className="py-3 px-4">
                            {log.status === 'success' ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">Success</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-xs font-medium text-red-700 dark:text-red-400">Failed</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{log.user_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{log.user_id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium capitalize">{log.resource}</p>
                              <p className="text-xs text-muted-foreground font-mono">{log.resource_id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                            {log.ip_address ?? '—'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm">{format(new Date(log.timestamp), 'MMM d, yyyy')}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(log.timestamp), 'h:mm:ss a')}</p>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={rawLogs.length < PAGE_SIZE}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Page {page + 1} &middot; {filteredLogs.length} entries shown
              </p>
            </div>

            {/* Summary Stats */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Total (this page)</p>
                  <p className="text-2xl font-bold">{filteredLogs.length}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{failureCount}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
