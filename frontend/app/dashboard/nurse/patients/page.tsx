'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { patientApi, doctorApi, type ApiUser, type ApiPatientRecord, type ApiPrescription } from '@/lib/api';
import { FileText, Pill, Loader2, Plus, User, ChevronRight, ChevronLeft } from 'lucide-react';

const RECORD_TYPE_COLORS: Record<string, string> = {
  diagnosis: 'bg-red-50 text-red-700 border-red-200',
  lab: 'bg-green-50 text-green-700 border-green-200',
  imaging: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  vital: 'bg-orange-50 text-orange-700 border-orange-200',
  note: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function NursePatientsPage() {
  const [patients, setPatients] = useState<ApiUser[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ApiUser | null>(null);
  const [records, setRecords] = useState<ApiPatientRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<ApiPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'prescriptions'>('records');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newRecord, setNewRecord] = useState<{ type: ApiPatientRecord['type']; title: string; description: string; date: string; provider: string }>({ type: 'vital', title: '', description: '', date: '', provider: '' });

  useEffect(() => {
    doctorApi.getPatients()
      .then(setPatients)
      .catch(console.error)
      .finally(() => setIsLoadingPatients(false));
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    setIsLoading(true);
    setRecords([]);
    setPrescriptions([]);
    Promise.all([
      patientApi.getRecords(selectedPatient.id),
      patientApi.getPrescriptions(selectedPatient.id),
    ]).then(([recs, rxs]) => {
      setRecords(recs);
      setPrescriptions(rxs);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [selectedPatient]);

  const handleAddVital = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      const rec = await patientApi.createRecord(selectedPatient.id, newRecord);
      setRecords((prev) => [rec, ...prev]);
      setShowAddRecord(false);
      setNewRecord({ type: 'vital', title: '', description: '', date: '', provider: '' });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to save record');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout requiredRole={['nurse']}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Patients</h1>
          <p className="text-muted-foreground">View patient records and add vitals or notes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient list */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" /> Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {isLoadingPatients ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                ) : patients.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No patients found.</p>
                ) : (
                  <ul className="space-y-1">
                    {patients.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => setSelectedPatient(p)}
                          className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                            selectedPatient?.id === p.id
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <p className="font-medium truncate">{p.full_name || p.email}</p>
                          {p.full_name && <p className={`text-xs truncate ${selectedPatient?.id === p.id ? 'text-blue-200' : 'text-muted-foreground'}`}>{p.email}</p>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Patient detail */}
          <div className="lg:col-span-3 space-y-4">
            {!selectedPatient ? (
              <Card>
                <CardContent className="py-16 text-center text-sm text-muted-foreground">
                  Select a patient to view their records.
                </CardContent>
              </Card>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Patient header */}
                <Card>
                  <CardContent className="pt-4 pb-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{selectedPatient.full_name || selectedPatient.email}</p>
                      <p className="text-xs text-muted-foreground">{selectedPatient.email}</p>
                    </div>
                    {selectedPatient.date_of_birth && (
                      <p className="text-xs text-muted-foreground">DOB: {selectedPatient.date_of_birth}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex gap-1 border-b">
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
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">{records.length} record{records.length !== 1 ? 's' : ''}</p>
                      <Button size="sm" onClick={() => setShowAddRecord(!showAddRecord)} className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                        <Plus className="h-4 w-4" /> Add Vital / Note
                      </Button>
                    </div>

                    {/* Add vital form */}
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
                                <option value="vital">vital</option>
                                <option value="note">note</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs mb-1 block">Date</Label>
                              <Input type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} className="text-sm h-9" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Title</Label>
                            <Input value={newRecord.title} onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })} placeholder="e.g. Blood Pressure Reading" className="text-sm h-9" />
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Provider / Nurse</Label>
                            <Input value={newRecord.provider} onChange={(e) => setNewRecord({ ...newRecord, provider: e.target.value })} placeholder="Your name / ward" className="text-sm h-9" />
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Details</Label>
                            <textarea
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[70px]"
                              value={newRecord.description}
                              onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                              placeholder="Measurements, observations..."
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => setShowAddRecord(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleAddVital} disabled={isSaving || !newRecord.title || !newRecord.date} className="bg-blue-600 hover:bg-blue-700 text-white">
                              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardContent className="pt-4 space-y-2">
                        {records.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">No records for this patient.</p>
                        ) : (
                          records.map((r) => (
                            <div key={r.id} className="p-4 rounded-lg border flex items-start gap-3 bg-white dark:bg-slate-950">
                              <FileText className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{r.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{r.date} · {r.provider}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                              </div>
                              <Badge variant="outline" className={`text-xs capitalize flex-shrink-0 ${RECORD_TYPE_COLORS[r.type] ?? ''}`}>{r.type}</Badge>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'prescriptions' && (
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      {prescriptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No prescriptions for this patient.</p>
                      ) : (
                        prescriptions.map((rx) => (
                          <div key={rx.id} className="p-4 rounded-lg border flex items-start gap-3 bg-white dark:bg-slate-950">
                            <Pill className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{rx.medication}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{rx.dosage} · {rx.frequency}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {rx.start_date}{rx.end_date ? ` → ${rx.end_date}` : ''}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">Prescribed by: {rx.prescribed_by}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs flex-shrink-0 ${
                                rx.status === 'active'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {rx.status}
                            </Badge>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
