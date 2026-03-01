'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RestrictedSection } from '@/components/access-control/restricted-section';
import { useAuth } from '@/lib/auth-context';
import { usePatientRecords } from '@/lib/hooks/use-patient-data';
import { PatientRecord } from '@/lib/types';
import {
  FileText,
  FlaskConical,
  ScanLine,
  Activity,
  ClipboardList,
  Eye,
  Search,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const RECORD_TYPE_CONFIG: Record<
  string,
  { label: string; icon: ReactNode; color: string }
> = {
  diagnosis: {
    label: 'Diagnosis',
    icon: <ClipboardList className="h-4 w-4" />,
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400',
  },
  lab: {
    label: 'Lab',
    icon: <FlaskConical className="h-4 w-4" />,
    color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400',
  },
  imaging: {
    label: 'Imaging',
    icon: <ScanLine className="h-4 w-4" />,
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400',
  },
  vital: {
    label: 'Vital',
    icon: <Activity className="h-4 w-4" />,
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400',
  },
  note: {
    label: 'Note',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  },
};

export default function PatientRecordsPage() {
  const { user } = useAuth();
  const { records, isLoading, error, refetch } = usePatientRecords(user?.id);
  const [selected, setSelected] = useState<PatientRecord | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Auto-select first record when data loads
  if (records.length > 0 && !selected) {
    setSelected(records[0]);
  }

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.provider.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const activeRecord = selected ?? filtered[0] ?? null;
  const typeConfig = activeRecord
    ? (RECORD_TYPE_CONFIG[activeRecord.type] ?? RECORD_TYPE_CONFIG.note)
    : null;

  return (
    <DashboardLayout requiredRole={['patient']}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">My Records</h1>
            <p className="text-muted-foreground">Your personal medical history and test results</p>
          </div>
          {error && (
            <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          )}
        </div>

        <RestrictedSection requiredPermission="view_own_records">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="font-medium">Failed to load records</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch} className="gap-2 mt-2">
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'diagnosis', 'lab', 'imaging', 'vital', 'note'].map((t) => (
                    <Button
                      key={t}
                      size="sm"
                      variant={filterType === t ? 'default' : 'outline'}
                      onClick={() => setFilterType(t)}
                      className={filterType === t ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                    >
                      {t === 'all' ? 'All' : RECORD_TYPE_CONFIG[t]?.label ?? t}
                    </Button>
                  ))}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Records</CardTitle>
                  <CardDescription>{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No records match your search.</p>
                  ) : (
                    filtered.map((record) => {
                      const cfg = RECORD_TYPE_CONFIG[record.type] ?? RECORD_TYPE_CONFIG.note;
                      return (
                        <button
                          key={record.id}
                          onClick={() => setSelected(record)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            activeRecord?.id === record.id
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                              : 'border-border hover:border-blue-300 bg-white dark:bg-slate-950'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 p-2 rounded-md border ${cfg.color}`}>
                              {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{record.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {record.date} · {record.provider}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {record.description}
                              </p>
                            </div>
                            <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
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
                <CardTitle className="text-lg">Record Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {activeRecord && typeConfig ? (
                  <>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Type</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium border ${typeConfig.color}`}>
                    {typeConfig.icon}
                    {typeConfig.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Title</p>
                  <p className="text-sm font-medium">{activeRecord.title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Date</p>
                  <p className="text-sm">{activeRecord.date}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Provider</p>
                  <p className="text-sm">{activeRecord.provider}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Details</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{activeRecord.description}</p>
                </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">Select a record to view details.</p>
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
