'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { doctorApi, type ApiUser } from '@/lib/api';
import {
  Users,
  Loader2,
  Search,
  FileText,
  Calendar,
  Mail,
  User,
  ChevronRight,
} from 'lucide-react';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ApiUser | null>(null);

  useEffect(() => {
    doctorApi
      .getPatients()
      .then((data) => {
        setPatients(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.full_name || '').toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout requiredRole={['doctor']}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            My Patients
          </h1>
          <p className="text-muted-foreground">
            View and manage your patient list
          </p>
        </div>

        {/* Stats bar */}
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{patients.length}</p>
                <p className="text-xs text-muted-foreground">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient list */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patients..."
                  className="pl-9"
                />
              </div>

              <Card>
                <CardContent className="pt-4 space-y-2">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      No patients found.
                    </p>
                  ) : (
                    filtered.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                          selected?.id === p.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-border hover:border-blue-300 bg-white dark:bg-slate-950'
                        }`}
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {p.full_name || p.email}
                          </p>
                          {p.full_name && (
                            <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                          )}
                          {p.date_of_birth && (
                            <p className="text-xs text-muted-foreground">
                              DOB: {p.date_of_birth}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={
                              p.is_active
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                            }
                          >
                            {p.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Patient detail panel */}
            {selected && (
              <Card className="h-fit sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Patient Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <User className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{selected.full_name || selected.email}</p>
                      <Badge
                        variant="outline"
                        className={
                          selected.is_active
                            ? 'bg-green-50 text-green-700 border-green-200 text-xs mt-1'
                            : 'bg-gray-50 text-gray-500 border-gray-200 text-xs mt-1'
                        }
                      >
                        {selected.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="text-sm break-all">{selected.email}</p>
                  </div>

                  {selected.date_of_birth && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                        Date of Birth
                      </p>
                      <p className="text-sm">{selected.date_of_birth}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Member Since
                    </p>
                    <p className="text-sm">
                      {new Date(selected.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Quick links */}
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Quick Actions
                    </p>
                    <Link
                      href="/dashboard/doctor/records"
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                      View Records
                    </Link>
                    <Link
                      href="/dashboard/doctor/prescriptions"
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-purple-600" />
                      View Prescriptions
                    </Link>
                    <Link
                      href="/dashboard/doctor/appointments"
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Calendar className="h-4 w-4 text-green-600" />
                      Schedule Appointment
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
