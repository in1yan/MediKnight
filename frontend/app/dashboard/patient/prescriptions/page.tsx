'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RestrictedSection } from '@/components/access-control/restricted-section';
import { Prescription } from '@/lib/types';
import { usePatientPrescriptions } from '@/lib/hooks/use-patient-data';
import { useAuth } from '@/lib/auth-context';
import { Pill, Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'inactive' | 'completed';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: ReactNode }
> = {
  active: {
    label: 'Active',
    variant: 'default',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  inactive: {
    label: 'Inactive',
    variant: 'outline',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  completed: {
    label: 'Completed',
    variant: 'secondary',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

export default function PatientPrescriptionsPage() {
  const { user } = useAuth();
  const { prescriptions, isLoading, error, refetch } = usePatientPrescriptions(user?.id);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Prescription | null>(null);

  // Auto-select first when data loads
  if (prescriptions.length > 0 && !selected) {
    setSelected(prescriptions[0]);
  }

  const filtered = prescriptions.filter(
    (p) => filter === 'all' || p.status === filter
  );

  const activeMeds = prescriptions.filter((p) => p.status === 'active').length;
  const completedMeds = prescriptions.filter((p) => p.status === 'completed').length;
  const activeSelected = selected ?? filtered[0] ?? null;

  return (
    <DashboardLayout requiredRole={['patient']}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Prescriptions</h1>
            <p className="text-muted-foreground">Your current and past medications</p>
          </div>
          {error && (
            <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <Pill className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeMeds}</p>
                  <p className="text-xs text-muted-foreground">Active medications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <CheckCircle2 className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedMeds}</p>
                  <p className="text-xs text-muted-foreground">Completed courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{prescriptions.length}</p>
                  <p className="text-xs text-muted-foreground">Total prescriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <RestrictedSection requiredPermission="view_own_records">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="font-medium">Failed to load prescriptions</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch} className="gap-2 mt-2">
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filter tabs */}
              <div className="flex gap-2">
                {(['all', 'active', 'inactive', 'completed'] as StatusFilter[]).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={filter === s ? 'default' : 'outline'}
                    onClick={() => setFilter(s)}
                    className={filter === s ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {s !== 'all' && (
                      <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-xs">
                        {prescriptions.filter((p) => p.status === s).length}
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Medications</CardTitle>
                  <CardDescription>{filtered.length} prescription{filtered.length !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No prescriptions in this category.</p>
                  ) : (
                    filtered.map((rx) => {
                      const cfg = STATUS_CONFIG[rx.status];
                      return (
                        <button
                          key={rx.id}
                          onClick={() => setSelected(rx)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            activeSelected?.id === rx.id
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                              : 'border-border hover:border-blue-300 bg-white dark:bg-slate-950'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 flex-shrink-0">
                                <Pill className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm">{rx.medication}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {rx.dosage} · {rx.frequency}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {rx.startDate} → {rx.endDate}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={cfg.variant}
                              className={`flex-shrink-0 gap-1 ${rx.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/20' : ''}`}
                            >
                              {cfg.icon}
                              {cfg.label}
                            </Badge>
                          </div>
                        </button>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detail panel */}
            <Card className="h-fit sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Prescription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {activeSelected ? (() => {
                  const cfg = STATUS_CONFIG[activeSelected.status];
                  return (
                    <>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Status</p>
                        <Badge
                          variant={cfg.variant}
                          className={`gap-1 ${activeSelected.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/20' : ''}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Medication</p>
                        <p className="text-sm font-semibold">{activeSelected.medication}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Dosage</p>
                          <p className="text-sm">{activeSelected.dosage}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Frequency</p>
                          <p className="text-sm">{activeSelected.frequency}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                          <Calendar className="inline h-3 w-3 mr-1" />Start Date
                        </p>
                        <p className="text-sm">{activeSelected.startDate}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                          <Clock className="inline h-3 w-3 mr-1" />End Date
                        </p>
                        <p className="text-sm">{activeSelected.endDate ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                          <User className="inline h-3 w-3 mr-1" />Prescribed By
                        </p>
                        <p className="text-sm">{activeSelected.prescribedBy}</p>
                      </div>
                    </>
                  );
                })() : (
                  <p className="text-sm text-muted-foreground py-4 text-center">Select a prescription to view details.</p>
                )}
              </CardContent>
            </Card>
          </div>
          )}
        </RestrictedSection>
      </div>
    </DashboardLayout>
  );
}
