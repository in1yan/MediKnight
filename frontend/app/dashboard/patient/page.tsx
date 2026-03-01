'use client';

import { useAuth } from '@/lib/auth-context';
import { usePatientRecords, usePatientPrescriptions } from '@/lib/hooks/use-patient-data';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityStatus } from '@/components/dashboard/security-status';
import { RestrictedSection } from '@/components/access-control/restricted-section';
import { Pill, FileText, Loader2 } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { records, isLoading: loadingRecords } = usePatientRecords(user?.id);
  const { prescriptions, isLoading: loadingPrescriptions } = usePatientPrescriptions(user?.id);

  const activeRx = prescriptions.filter((p) => p.status === 'active');
  const recentRecords = records.slice(0, 3);
  const recentRx = activeRx.slice(0, 3);

  return (
    <DashboardLayout requiredRole={['patient']}>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Your Health Dashboard
          </h1>
          <p className="text-muted-foreground">
            View and manage your medical records, prescriptions, and appointments
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPrescriptions ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-bold">{activeRx.length}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">All current medications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Medical Records</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecords ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-bold">{records.length}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Documents available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPrescriptions ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-bold">{prescriptions.length}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Including past medications</p>
            </CardContent>
          </Card>
        </div>

        {/* Security Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SecurityStatus />
          </div>
          <RestrictedSection requiredPermission="view_own_records">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Your Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You have access to view your own medical records and personal health information.
                </p>
              </CardContent>
            </Card>
          </RestrictedSection>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Medical Records
              </CardTitle>
              <CardDescription>Your latest health documents and test results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingRecords ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : recentRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No records yet.</p>
              ) : (
                recentRecords.map((r) => (
                  <div key={r.id} className="border-b pb-4 last:border-0">
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.date} &middot; {r.provider}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Active Prescriptions
              </CardTitle>
              <CardDescription>Medications you&apos;re currently taking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPrescriptions ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : recentRx.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No active medications.</p>
              ) : (
                recentRx.map((rx) => (
                  <div key={rx.id} className="border-b pb-4 last:border-0">
                    <p className="font-medium text-sm">{rx.medication}</p>
                    <p className="text-xs text-muted-foreground">{rx.dosage}, {rx.frequency}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
