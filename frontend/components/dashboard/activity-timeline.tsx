'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_AUDIT_LOGS } from '@/lib/constants';
import { format } from 'date-fns';
import { CheckCircle2, AlertCircle, Eye, Edit3, LogIn, Lock } from 'lucide-react';

type ActionIcon = React.ReactNode;

interface ActionConfig {
  icon: ActionIcon;
  label: string;
  color: string;
}

const ACTION_ICONS: Record<string, ActionConfig> = {
  viewed: { icon: <Eye className="h-4 w-4" />, label: 'Viewed', color: 'text-blue-600' },
  updated: { icon: <Edit3 className="h-4 w-4" />, label: 'Updated', color: 'text-purple-600' },
  created: { icon: <Edit3 className="h-4 w-4" />, label: 'Created', color: 'text-green-600' },
  deleted: { icon: <AlertCircle className="h-4 w-4" />, label: 'Deleted', color: 'text-red-600' },
  login: { icon: <LogIn className="h-4 w-4" />, label: 'Logged in', color: 'text-blue-600' },
  failed_access_attempt: { icon: <Lock className="h-4 w-4" />, label: 'Access denied', color: 'text-red-600' },
};

export function ActivityTimeline({ maxItems = 6 }: { maxItems?: number }) {
  const logs = MOCK_AUDIT_LOGS.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>Recent system activities and audit logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {logs.map((log, index) => {
            const actionConfig = ACTION_ICONS[log.action] || {
              icon: <Eye className="h-4 w-4" />,
              label: log.action,
              color: 'text-slate-600',
            };
            const isLast = index === logs.length - 1;

            return (
              <div key={log.id} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${log.status === 'success' ? 'bg-green-100 dark:bg-green-950/20' : 'bg-red-100 dark:bg-red-950/20'}`}>
                    {log.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  {!isLast && <div className="w-0.5 h-12 bg-border my-2" />}
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-white">
                        {log.userName}{' '}
                        <span className="font-normal text-muted-foreground">
                          {actionConfig.label}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {log.resource}: {log.resourceId}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium flex-shrink-0 ${
                        log.status === 'success'
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {log.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
