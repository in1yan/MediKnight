'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RestrictedSection } from '@/components/access-control/restricted-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { patientApi, doctorApi, type ApiPatientRecord, type ApiUser, type ApiPrescription } from '@/lib/api';
import { FileText, Plus, Loader2, Trash2, Pill, ChevronDown } from 'lucide-react';

const RECORD_TYPE_COLORS: Record<string, string> = {
  diagnosis: 'bg-red-50 text-red-700 border-red-200',
  lab: 'bg-green-50 text-green-700 border-green-200',
  imaging: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  vital: 'bg-orange-50 text-orange-700 border-orange-200',
  note: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function DoctorRecordsPage() {
  const [patients, setPatients] = useState<ApiUser[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ApiUser | null>(null);
  const [records, setRecords] = useState<ApiPatientRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<ApiPrescription[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ApiPatientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'prescriptions'>('records');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddRx, setShowAddRx] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New record form state
  const [newRecord, setNewRecord] = useState<{ type: ApiPatientRecord['type']; title: string; description: string; date: string; provider: string }>({ type: 'diagnosis', title: '', description: '', date: '', provider: '' });
  // New prescription form state
  const [newRx, setNewRx] = useState({ medication: '', dosage: '', frequency: '', start_date: '', end_date: '' });

  useEffect(() => {
    doctorApi.getPatients().then(setPatients).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    setIsLoading(true);
    setRecords([]);
    setPrescriptions([]);
    setSelectedRecord(null);
    Promise.all([
      patientApi.getRecords(selectedPatient.id),
      patientApi.getPrescriptions(selectedPatient.id),
    ]).then(([recs, rxs]) => {
      setRecords(recs);
      setPrescriptions(rxs);
      if (recs.length > 0) setSelectedRecord(recs[0]);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [selectedPatient]);

  const handleAddRecord = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      const rec = await patientApi.createRecord(selectedPatient.id, newRecord);
      setRecords((prev) => [rec, ...prev]);
      setSelectedRecord(rec);
      setShowAddRecord(false);
      setNewRecord({ type: 'diagnosis', title: '', description: '', date: '', provider: '' });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to create record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!selectedPatient || !confirm('Delete this record?')) return;
    await patientApi.deleteRecord(selectedPatient.id, recordId);
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    if (selectedRecord?.id === recordId) setSelectedRecord(records.find((r) => r.id !== recordId) ?? null);
  };

  const handleAddPrescription = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      const rx = await patientApi.createPrescription(selectedPatient.id, newRx);
      setPrescriptions((prev) => [rx, ...prev]);
      setShowAddRx(false);
      setNewRx({ medication: '', dosage: '', frequency: '', start_date: '', end_date: '' });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to create prescription');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePrescriptionStatus = async (patientId: string, rxId: string, status: string) => {
    const rx = await patientApi.updatePrescription(patientId, rxId, { status } as Partial<ApiPrescription>);
    setPrescriptions((prev) => prev.map((p) => (p.id === rxId ? rx : p)));
  };

  return (
    <DashboardLayout requiredRole={['doctor']}>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Patient Records</h1>
            <p className="text-muted-foreground">Manage medical records and prescriptions</p>
          </div>
        </div>

        {/* Patient selector */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
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
                    <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedPatient ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Select a patient above to view their records.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <RestrictedSection requiredPermission="view_patient_records">
            {/* Tabs */}
            <div className="flex gap-1 border-b mb-4">
              {(['records', 'prescriptions'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === t
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {activeTab === 'records' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">{records.length} record{records.length !== 1 ? 's' : ''}</p>
                    <Button size="sm" onClick={() => setShowAddRecord(!showAddRecord)} className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                      <Plus className="h-4 w-4" /> Add Record
                    </Button>
                  </div>

                  {/* Add record form */}
                  {showAddRecord && (
                    <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
                      <CardContent className="pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs mb-1 block">Type</Label>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                              value={newRecord.type}
                              onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as ApiPatientRecord['type'] })}
                            >
                              {['diagnosis', 'lab', 'imaging', 'vital', 'note'].map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Date</Label>
                            <Input type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} className="text-sm h-9" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Title</Label>
                          <Input value={newRecord.title} onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })} placeholder="Record title" className="text-sm h-9" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Provider</Label>
                          <Input value={newRecord.provider} onChange={(e) => setNewRecord({ ...newRecord, provider: e.target.value })} placeholder="Doctor / department" className="text-sm h-9" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Description</Label>
                          <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                            value={newRecord.description}
                            onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                            placeholder="Record details..."
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setShowAddRecord(false)}>Cancel</Button>
                          <Button size="sm" onClick={handleAddRecord} disabled={isSaving || !newRecord.title || !newRecord.date} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      {records.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No records yet.</p>
                      ) : (
                        records.map((record) => (
                          <div
                            key={record.id}
                            onClick={() => setSelectedRecord(record)}
                            className={`w-full p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedRecord?.id === record.id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                                : 'border-border hover:border-blue-300 bg-white dark:bg-slate-950'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{record.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{record.date} · {record.provider}</p>
                              </div>
                              <Badge variant="outline" className={`text-xs capitalize ${RECORD_TYPE_COLORS[record.type] ?? ''}`}>{record.type}</Badge>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteRecord(record.id); }}
                                className="text-red-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Detail panel */}
                {selectedRecord && (
                  <Card className="h-fit sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Record Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Type</p>
                        <Badge variant="outline" className={`capitalize ${RECORD_TYPE_COLORS[selectedRecord.type] ?? ''}`}>{selectedRecord.type}</Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Title</p>
                        <p className="text-sm font-medium">{selectedRecord.title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Date</p>
                        <p className="text-sm">{selectedRecord.date}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Provider</p>
                        <p className="text-sm">{selectedRecord.provider}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Details</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedRecord.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">{prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}</p>
                  <Button size="sm" onClick={() => setShowAddRx(!showAddRx)} className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                    <Plus className="h-4 w-4" /> Prescribe
                  </Button>
                </div>

                {/* Add prescription form */}
                {showAddRx && (
                  <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
                    <CardContent className="pt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Medication</Label>
                          <Input value={newRx.medication} onChange={(e) => setNewRx({ ...newRx, medication: e.target.value })} placeholder="Drug name" className="text-sm h-9" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Dosage</Label>
                          <Input value={newRx.dosage} onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })} placeholder="e.g. 500mg" className="text-sm h-9" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Frequency</Label>
                          <Input value={newRx.frequency} onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })} placeholder="e.g. twice daily" className="text-sm h-9" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Start Date</Label>
                          <Input type="date" value={newRx.start_date} onChange={(e) => setNewRx({ ...newRx, start_date: e.target.value })} className="text-sm h-9" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">End Date (optional)</Label>
                          <Input type="date" value={newRx.end_date} onChange={(e) => setNewRx({ ...newRx, end_date: e.target.value })} className="text-sm h-9" />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setShowAddRx(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleAddPrescription} disabled={isSaving || !newRx.medication || !newRx.start_date} className="bg-blue-600 hover:bg-blue-700 text-white">
                          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Prescribe'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-4 space-y-2">
                    {prescriptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No prescriptions yet.</p>
                    ) : (
                      prescriptions.map((rx) => (
                        <div key={rx.id} className="p-4 rounded-lg border bg-white dark:bg-slate-950 flex items-start gap-3">
                          <Pill className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{rx.medication}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{rx.dosage} · {rx.frequency}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {rx.start_date}{rx.end_date ? ` → ${rx.end_date}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant="outline"
                              className={
                                rx.status === 'active'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : rx.status === 'completed'
                                  ? 'bg-slate-50 text-slate-700 border-slate-200'
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                              }
                            >
                              {rx.status}
                            </Badge>
                            {rx.status === 'active' && (
                              <button
                                onClick={() => handleUpdatePrescriptionStatus(rx.patient_id, rx.id, 'completed')}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Mark completed
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </RestrictedSection>
        )}
      </div>
    </DashboardLayout>
  );
}

