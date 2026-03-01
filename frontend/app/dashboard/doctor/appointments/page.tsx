'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { patientApi, doctorApi, type ApiAppointment, type ApiUser } from '@/lib/api';
import { Calendar, Clock, Loader2, Plus, ChevronDown, Trash2, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  no_show: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function DoctorAppointmentsPage() {
  const [patients, setPatients] = useState<ApiUser[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ApiUser | null>(null);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    appointment_type: ApiAppointment['appointment_type'];
    date: string;
    time: string;
    notes: string;
    location: string;
    department: string;
  }>({
    title: '',
    appointment_type: 'consultation',
    date: '',
    time: '',
    notes: '',
    location: '',
    department: '',
  });

  useEffect(() => {
    doctorApi.getPatients().then(setPatients).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    setIsLoading(true);
    patientApi.getAppointments(selectedPatient.id)
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedPatient]);

  const handleCreate = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      const appt = await patientApi.createAppointment(selectedPatient.id, form);
      setAppointments((prev) => [appt, ...prev]);
      setShowAdd(false);
      setForm({ title: '', appointment_type: 'consultation', date: '', time: '', notes: '', location: '', department: '' });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to create appointment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (appt: ApiAppointment, newStatus: string) => {
    if (!selectedPatient) return;
    const updated = await patientApi.updateAppointment(selectedPatient.id, appt.id, { status: newStatus } as Partial<ApiAppointment>);
    setAppointments((prev) => prev.map((a) => (a.id === appt.id ? updated : a)));
  };

  const handleDelete = async (appt: ApiAppointment) => {
    if (!selectedPatient || !confirm('Delete this appointment?')) return;
    await patientApi.deleteAppointment(selectedPatient.id, appt.id);
    setAppointments((prev) => prev.filter((a) => a.id !== appt.id));
  };

  const upcoming = appointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed');
  const past = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show');

  return (
    <DashboardLayout requiredRole={['doctor']}>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Appointments</h1>
            <p className="text-muted-foreground">Schedule and manage patient appointments</p>
          </div>
        </div>

        {/* Patient selector */}
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
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
            {selectedPatient && (
              <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 hover:bg-blue-700 text-white gap-1 ml-auto">
                <Plus className="h-4 w-4" /> Schedule
              </Button>
            )}
          </CardContent>
        </Card>

        {!selectedPatient ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Select a patient to view or schedule appointments.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add appointment form */}
            {showAdd && (
              <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
                <CardHeader>
                  <CardTitle className="text-base">Schedule New Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">Type</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                        value={form.appointment_type}
                        onChange={(e) => setForm({ ...form, appointment_type: e.target.value as ApiAppointment['appointment_type'] })}
                      >
                        {['consultation', 'follow_up', 'lab', 'imaging', 'procedure', 'emergency'].map((t) => (
                          <option key={t} value={t}>{t.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Title</Label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Appointment title" className="text-sm h-9" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Date</Label>
                      <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="text-sm h-9" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Time (HH:MM)</Label>
                      <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="text-sm h-9" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Department</Label>
                      <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Cardiology" className="text-sm h-9" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Location</Label>
                      <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Room / building" className="text-sm h-9" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Notes</Label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Instructions for the patient..."
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleCreate} disabled={isSaving || !form.title || !form.date || !form.time} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Schedule'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-blue-600" /> Upcoming ({upcoming.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">No upcoming appointments.</p>
                ) : (
                  upcoming.map((appt) => (
                    <div key={appt.id} className="p-4 rounded-lg border flex items-start gap-3 bg-white dark:bg-slate-950">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{appt.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{appt.date}
                          <Clock className="h-3 w-3 ml-1" />{appt.time}
                        </p>
                        {appt.department && <p className="text-xs text-muted-foreground mt-0.5">{appt.department}</p>}
                        {appt.notes && <p className="text-xs text-muted-foreground mt-1 italic">{appt.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[appt.status] ?? ''}`}>{appt.status}</Badge>
                        <div className="flex gap-1">
                          <button onClick={() => handleUpdateStatus(appt, 'completed')} title="Mark completed" className="text-green-500 hover:text-green-700 p-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleUpdateStatus(appt, 'cancelled')} title="Cancel" className="text-orange-400 hover:text-orange-600 p-1">
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(appt)} title="Delete" className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Past */}
            {past.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Past ({past.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {past.map((appt) => (
                    <div key={appt.id} className="p-4 rounded-lg border flex items-start gap-3 bg-white dark:bg-slate-950 opacity-75">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{appt.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {appt.date} · {appt.time}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[appt.status] ?? ''}`}>{appt.status.replace('_', ' ')}</Badge>
                    </div>
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
