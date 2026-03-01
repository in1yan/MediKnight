'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RestrictedSection } from '@/components/access-control/restricted-section';
import { useAuth } from '@/lib/auth-context';
import { patientApi, type ApiAppointment } from '@/lib/api';
import { useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Stethoscope,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ChevronRight,
  Loader2,
} from 'lucide-react';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  consultation: { label: 'Consultation', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400' },
  follow_up: { label: 'Follow-up', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400' },
  lab: { label: 'Lab', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400' },
  imaging: { label: 'Imaging', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400' },
  procedure: { label: 'Procedure', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400' },
  emergency: { label: 'Emergency', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: ReactNode; badgeClass: string }> = {
  scheduled: {
    label: 'Scheduled',
    icon: <CalendarClock className="h-3.5 w-3.5" />,
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400',
  },
  confirmed: {
    label: 'Confirmed',
    icon: <CalendarClock className="h-3.5 w-3.5" />,
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    badgeClass: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="h-3.5 w-3.5" />,
    badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400',
  },
  no_show: {
    label: 'No Show',
    icon: <XCircle className="h-3.5 w-3.5" />,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400',
  },
};

type FilterStatus = 'all' | 'upcoming' | 'completed' | 'cancelled';

function isUpcoming(status: string) {
  return status === 'scheduled' || status === 'confirmed';
}

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selected, setSelected] = useState<ApiAppointment | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    patientApi.getAppointments(user.id)
      .then((data) => {
        setAppointments(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const filtered = appointments.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return isUpcoming(a.status);
    if (filter === 'completed') return a.status === 'completed';
    if (filter === 'cancelled') return a.status === 'cancelled' || a.status === 'no_show';
    return true;
  });

  const upcomingCount = appointments.filter((a) => isUpcoming(a.status)).length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const nextAppt = appointments.find((a) => isUpcoming(a.status));

  return (
    <DashboardLayout requiredRole={['patient']}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Appointments</h1>
          <p className="text-muted-foreground">Your scheduled and past medical appointments</p>
        </div>

        {/* Stats + Next appointment banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="sm:col-span-1">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <CalendarClock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingCount}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-1">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {nextAppt && (
            <Card className="sm:col-span-1 border-blue-200 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-900">
              <CardContent className="pt-5">
                <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400 mb-1">Next Appointment</p>
                <p className="text-sm font-semibold truncate">{nextAppt.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{nextAppt.date} · {nextAppt.time}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <RestrictedSection requiredPermission="view_own_records">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-red-500">{error}</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List panel */}
              <div className="lg:col-span-2 space-y-4">
                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'upcoming', 'completed', 'cancelled'] as FilterStatus[]).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={filter === s ? 'default' : 'outline'}
                      onClick={() => setFilter(s)}
                      className={filter === s ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filtered.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No appointments in this category.</p>
                    ) : (
                      filtered.map((appt) => {
                        const typeCfg = TYPE_CONFIG[appt.appointment_type] ?? TYPE_CONFIG.consultation;
                        const statusCfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.scheduled;
                        return (
                          <button
                            key={appt.id}
                            onClick={() => setSelected(appt)}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                              selected?.id === appt.id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                                : 'border-border hover:border-blue-300 bg-white dark:bg-slate-950'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className={`flex-shrink-0 p-2 rounded-md border ${typeCfg.color}`}>
                                  <Stethoscope className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm">{appt.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {appt.date} · {appt.time}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{appt.doctor_name || 'TBD'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="outline" className={`hidden sm:flex gap-1 ${statusCfg.badgeClass}`}>
                                  {statusCfg.icon}
                                  {statusCfg.label}
                                </Badge>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detail panel */}
              {selected && (
                <Card className="h-fit sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Appointment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {(() => {
                      const typeCfg = TYPE_CONFIG[selected.appointment_type] ?? TYPE_CONFIG.consultation;
                      const statusCfg = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.scheduled;
                      return (
                        <>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className={`gap-1 ${statusCfg.badgeClass}`}>
                              {statusCfg.icon}
                              {statusCfg.label}
                            </Badge>
                            <Badge variant="outline" className={typeCfg.color}>
                              {typeCfg.label}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Title</p>
                            <p className="text-sm font-semibold">{selected.title}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                <Calendar className="inline h-3 w-3 mr-1" />Date
                              </p>
                              <p className="text-sm">{selected.date}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                <Clock className="inline h-3 w-3 mr-1" />Time
                              </p>
                              <p className="text-sm">{selected.time}</p>
                            </div>
                          </div>
                          {selected.doctor_name && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                <User className="inline h-3 w-3 mr-1" />Doctor
                              </p>
                              <p className="text-sm">{selected.doctor_name}</p>
                              {selected.department && <p className="text-xs text-muted-foreground">{selected.department}</p>}
                            </div>
                          )}
                          {selected.location && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                                <MapPin className="inline h-3 w-3 mr-1" />Location
                              </p>
                              <p className="text-sm">{selected.location}</p>
                            </div>
                          )}
                          {selected.notes && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Notes</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{selected.notes}</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </RestrictedSection>
      </div>
    </DashboardLayout>
  );
}
