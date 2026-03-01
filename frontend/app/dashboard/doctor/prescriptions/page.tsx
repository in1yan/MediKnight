'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { patientApi, doctorApi, type ApiPrescription, type ApiUser } from '@/lib/api';
import { Pill, Plus, Loader2, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_COLORS: Record<ApiPrescription['status'], string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-gray-50 text-gray-500 border-gray-200',
  completed: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function DoctorPrescriptionsPage() {
  const [patients, setPatients] = useState<ApiUser[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ApiUser | null>(null);
  const [prescriptions, setPrescriptions] = useState<ApiPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    doctorApi.getPatients().then(setPatients).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    setIsLoading(true);
    setPrescriptions([]);
    patientApi
      .getPrescriptions(selectedPatient.id)
      .then(setPrescriptions)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedPatient]);

  const handleCreate = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      const rx = await patientApi.createPrescription(selectedPatient.id, form);
      setPrescriptions((prev) => [rx, ...prev]);
      setShowAdd(false);
      setForm({ medication: '', dosage: '', frequency: '', start_date: '', end_date: '' });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to create prescription');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (rx: ApiPrescription, status: ApiPrescription['status']) => {
    if (!selectedPatient) return;
    const updated = await patientApi.updatePrescription(selectedPatient.id, rx.id, { status });
    setPrescriptions((prev) => prev.map((p) => (p.id === rx.id ? updated : p)));
  };

  const activeRx = prescriptions.filter((p) => p.status === 'active');
  const otherRx = prescriptions.filter((p) => p.status !== 'active');

  return (
    <DashboardLayout requiredRole={['doctor']}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Prescriptions
            </h1>
            <p className="text-muted-foreground">
              Manage prescriptions for your patients
            </p>
          </div>
        </div>

        {/* Patient selector */}
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3 flex-wrap">
            <Label className="flex-shrink-0 text-sm font-medium">Patient:</Label>
            <div className="relative flex-1 max-w-xs">
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none pr-8"
                value={selectedPatient?.id ?? ''}
                onChange={(e) => {
                  const p = patients.find((x) => x.id === e.target.value) ?? null;
                  setSelectedPatient(p);
                }}
              >
                <option value="">— Select a patient —</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {selectedPatient && (
              <Button
                size="sm"
                onClick={() => setShowAdd(!showAdd)}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1 ml-auto"
              >
                <Plus className="h-4 w-4" /> New Prescription
              </Button>
            )}
          </CardContent>
        </Card>

        {!selectedPatient ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              Select a patient above to view or write prescriptions.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* New prescription form */}
            {showAdd && (
              <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pill className="h-4 w-4 text-blue-600" /> New Prescription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">Medication *</Label>
                      <Input
                        value={form.medication}
                        onChange={(e) => setForm({ ...form, medication: e.target.value })}
                        placeholder="Drug name"
                        className="text-sm h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Dosage *</Label>
                      <Input
                        value={form.dosage}
                        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                        placeholder="e.g. 500mg"
                        className="text-sm h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Frequency *</Label>
                      <Input
                        value={form.frequency}
                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                        placeholder="e.g. twice daily"
                        className="text-sm h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Start Date *</Label>
                      <Input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        className="text-sm h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">End Date (optional)</Label>
                      <Input
                        type="date"
                        value={form.end_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreate}
                      disabled={
                        isSaving ||
                        !form.medication ||
                        !form.dosage ||
                        !form.frequency ||
                        !form.start_date
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Prescribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active prescriptions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Active Prescriptions ({activeRx.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeRx.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3 text-center">
                    No active prescriptions.
                  </p>
                ) : (
                  activeRx.map((rx) => (
                    <PrescriptionRow
                      key={rx.id}
                      rx={rx}
                      onMarkCompleted={() => handleUpdateStatus(rx, 'completed')}
                      onMarkInactive={() => handleUpdateStatus(rx, 'inactive')}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Past prescriptions */}
            {otherRx.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-slate-400" />
                    Past Prescriptions ({otherRx.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {otherRx.map((rx) => (
                    <PrescriptionRow
                      key={rx.id}
                      rx={rx}
                      onMarkActive={() => handleUpdateStatus(rx, 'active')}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function PrescriptionRow({
  rx,
  onMarkCompleted,
  onMarkInactive,
  onMarkActive,
}: {
  rx: ApiPrescription;
  onMarkCompleted?: () => void;
  onMarkInactive?: () => void;
  onMarkActive?: () => void;
}) {
  return (
    <div className="p-4 rounded-lg border flex items-start gap-3 bg-white dark:bg-slate-950">
      <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 flex-shrink-0">
        <Pill className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{rx.medication}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {rx.dosage} · {rx.frequency}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {rx.start_date}
              {rx.end_date ? ` → ${rx.end_date}` : ''}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`text-xs capitalize flex-shrink-0 ${STATUS_COLORS[rx.status]}`}
          >
            {rx.status}
          </Badge>
        </div>
        {/* Actions */}
        <div className="flex gap-3 mt-2">
          {onMarkCompleted && (
            <button
              onClick={onMarkCompleted}
              className="text-xs text-green-600 hover:underline"
            >
              Mark completed
            </button>
          )}
          {onMarkInactive && (
            <button
              onClick={onMarkInactive}
              className="text-xs text-gray-500 hover:underline"
            >
              Deactivate
            </button>
          )}
          {onMarkActive && (
            <button
              onClick={onMarkActive}
              className="text-xs text-blue-600 hover:underline"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
