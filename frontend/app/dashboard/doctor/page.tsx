'use client';

import { useState } from 'react';
import { usePatientList, useInvites } from '@/lib/hooks/use-dashboard-data';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Stethoscope, TrendingUp, Loader2, UserPlus, Mail, X } from 'lucide-react';
import { inviteApi, ApiInvite } from '@/lib/api';
import Link from 'next/link';

function InvitePatientModal({ open, onClose, onSent }: { open: boolean; onClose: () => void; onSent: () => void }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  async function handleSend() {
    if (!email.trim()) { setError('Email is required'); return; }
    setSending(true);
    setError('');
    try {
      await inviteApi.create(email.trim(), 'patient');
      setSuccess(true);
      setEmail('');
      setTimeout(() => { setSuccess(false); onSent(); onClose(); }, 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send invite');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" /> Invite Patient
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {success ? (
          <div className="flex flex-col items-center py-6 gap-3 text-green-600">
            <Mail className="h-10 w-10" />
            <p className="font-medium">Invitation sent!</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Enter the patient&apos;s email. They&apos;ll be able to register using that email. The invite expires in 7 days.
            </p>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={sending}>Cancel</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleSend} disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Send Invite
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { patients, isLoading } = usePatientList();
  const { invites, refetch: refetchInvites } = useInvites();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const recentPatients = patients.slice(0, 5);
  const myInvites = invites.filter((i) => !i.used).slice(0, 5);

  return (
    <DashboardLayout requiredRole={['doctor']}>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Doctor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your patients, view medical records, and prescribe treatments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-bold">{patients.length}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Registered patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">—</div>
              <p className="text-xs text-muted-foreground mt-1">View in patient records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">—</div>
              <p className="text-xs text-muted-foreground mt-1">View in patient records</p>
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
                  Patient List
                </CardTitle>
                <CardDescription>All registered patients</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : recentPatients.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No patients found.</p>
                ) : (
                  <div className="space-y-4">
                    {recentPatients.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                        <div>
                          <p className="font-medium text-sm">{p.full_name || p.email}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/doctor/records?patient=${p.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Quick Access
                </CardTitle>
                <CardDescription>Recent actions and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-2">Select a patient above to view their records and prescriptions.</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                <Link href="/dashboard/doctor/records">View Patient Records</Link>
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                Write Prescription
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                Schedule Appointment
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                View Test Results
              </Button>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white justify-start gap-2"
                onClick={() => setInviteOpen(true)}
              >
                <UserPlus className="h-4 w-4" /> Invite Patient
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pending Patient Invites */}
        {myInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Pending Patient Invites
              </CardTitle>
              <CardDescription>Patients you&apos;ve invited who haven&apos;t signed up yet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Email</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myInvites.map((inv) => (
                      <tr key={inv.id} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-2 px-3 font-medium">{inv.email}</td>
                        <td className="py-2 px-3">
                          <button
                            disabled={revoking === inv.id}
                            onClick={async () => {
                              setRevoking(inv.id);
                              try { await inviteApi.revoke(inv.id); refetchInvites(); }
                              finally { setRevoking(null); }
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                          >
                            {revoking === inv.id ? 'Removing…' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <InvitePatientModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onSent={refetchInvites}
        />
      </div>
    </DashboardLayout>
  );
}
