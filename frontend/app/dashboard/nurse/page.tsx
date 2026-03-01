'use client';

import { usePatientList } from '@/lib/hooks/use-dashboard-data';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Users, Loader2 } from 'lucide-react';

export default function NurseDashboard() {
  const { patients, isLoading } = usePatientList();

  const recentPatients = patients.slice(0, 5);

  return (
    <DashboardLayout requiredRole={['nurse']}>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Nurse Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor patients, coordinate care, and manage patient information
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
              <p className="text-xs text-muted-foreground mt-1">View via patient records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">—</div>
              <p className="text-xs text-muted-foreground mt-1">View via patient records</p>
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
                      <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{p.full_name || p.email}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                Record Vitals
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                Update Patient Notes
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                Report Alert Issue
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                Check Medications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
