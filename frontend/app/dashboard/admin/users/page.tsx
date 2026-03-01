'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionsList } from '@/components/access-control/permission-badge';
import { RoleIndicator } from '@/components/access-control/role-indicator';
import { SensitiveActionModal } from '@/components/modals/sensitive-action-modal';
import { useAdminUsers, useInvites } from '@/lib/hooks/use-dashboard-data';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '@/lib/constants';
import { ApiUser, ApiInvite, inviteApi } from '@/lib/api';
import { UserRole, Permission } from '@/lib/types';
import { Shield, Trash2, Lock, Eye, Search, Loader2, RefreshCw, X, UserPlus, Mail } from 'lucide-react';
import { format } from 'date-fns';

function getPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role as UserRole] ?? [];
}

// ─── Send Invite Modal ────────────────────────────────────────────────────────

function InviteModal({
  open, onClose, onSent,
  allowedRoles,
}: {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
  allowedRoles: string[];
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(allowedRoles[0] ?? 'doctor');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  async function handleSend() {
    if (!email.trim()) { setError('Email is required'); return; }
    setSending(true);
    setError('');
    try {
      await inviteApi.create(email.trim(), role);
      setEmail('');
      onSent();
      onClose();
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
            <UserPlus className="h-5 w-5 text-blue-600" /> Add to Access List
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Add an email to the access list. When that person signs up, their account will be created with the selected role.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="colleague@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Role</label>
            <div className="flex gap-2">
              {allowedRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all capitalize ${
                    role === r
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300'
                      : 'border-border hover:border-blue-300'
                  }`}
                >
                  {ROLE_LABELS[r as UserRole] ?? r}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={sending}>Cancel</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Add to List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { users, isLoading, error, refetch } = useAdminUsers();
  const { invites, isLoading: loadingInvites, refetch: refetchInvites } = useInvites();
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users');

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const active = selectedUser ?? filtered[0] ?? null;

  return (
    <DashboardLayout requiredRole={['admin']}>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage system users, permissions, and access levels
            </p>
          </div>
          <div className="flex gap-2">
            {error && (
              <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
            )}
            <Button
              onClick={() => setInviteModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              size="sm"
            >
              <UserPlus className="h-4 w-4" /> Add to Access List
            </Button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 border-b">
          {(['users', 'invites'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'users' ? `Users (${users.length})` : `Access List (${invites.filter(i => !i.used).length} pending)`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          {activeTab === 'users' && <>
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {(['all', 'admin', 'doctor', 'nurse', 'patient'] as const).map((r) => (
                  <Button
                    key={r}
                    size="sm"
                    variant={roleFilter === r ? 'default' : 'outline'}
                    onClick={() => setRoleFilter(r)}
                    className={roleFilter === r ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                  >
                    {r === 'all' ? 'All' : ROLE_LABELS[r as UserRole]}
                  </Button>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>
                  {isLoading ? 'Loading…' : `${filtered.length} user${filtered.length !== 1 ? 's' : ''} found`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : error ? (
                  <p className="text-sm text-destructive text-center py-4">{error}</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No users found.</p>
                ) : (
                  filtered.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        active?.id === u.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                          : 'border-border hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{u.full_name || u.email}</p>
                          <p className="text-xs text-muted-foreground mb-2">{u.email}</p>
                          <div className="flex items-center gap-2">
                            <RoleIndicator role={u.role as UserRole} />
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              u.is_active !== false
                                ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                            }`}>
                              {u.is_active !== false ? 'Active' : 'Suspended'}
                            </span>
                          </div>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!active ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Select a user to view details.</p>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Name</p>
                      <p className="text-sm font-medium">{active.full_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Email</p>
                      <p className="text-sm font-medium break-all">{active.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Role</p>
                      <RoleIndicator role={active.role as UserRole} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Joined</p>
                      <p className="text-sm">{format(new Date(active.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Status</p>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        active.is_active !== false
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                      }`}>
                        {active.is_active !== false ? '✓ Active' : '✗ Suspended'}
                      </span>
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-3">Actions</p>
                      <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Shield className="h-4 w-4" />
                        Edit Permissions
                      </Button>
                      <Button
                        onClick={() => setSuspendModalOpen(true)}
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Suspend Account
                      </Button>
                      <Button
                        onClick={() => setDeleteModalOpen(true)}
                        variant="outline"
                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete User
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          </>}
        </div>

        {/* Invites tab */}
        {activeTab === 'invites' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Access List
              </CardTitle>
              <CardDescription>
                Emails pre-authorized to sign up. When an email on this list registers, the account is created with the assigned role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInvites ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : invites.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-3 text-muted-foreground">
                  <Mail className="h-8 w-8" />
                  <p className="text-sm">No invitations sent yet.</p>
                  <Button onClick={() => setInviteModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-2" size="sm">
                    <UserPlus className="h-4 w-4" /> Add First Entry
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Added By</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invites.map((inv) => (
                        <tr key={inv.id} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="py-3 px-4 font-medium">{inv.email}</td>
                          <td className="py-3 px-4">
                            <RoleIndicator role={inv.role as UserRole} />
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{inv.invited_by_name}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              inv.used
                                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                                : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
                            }`}>
                              {inv.used ? '✓ Signed up' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {!inv.used && (
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
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Permissions Section */}
        {activeTab === 'users' && active && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Permissions
              </CardTitle>
              <CardDescription>
                Permissions for {active.full_name || active.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionsList permissions={getPermissions(active.role)} />
            </CardContent>
          </Card>
        )}

        {/* Sensitive Action Modals */}
        {active && (
          <>
            <SensitiveActionModal
              open={suspendModalOpen}
              onOpenChange={setSuspendModalOpen}
              title="Suspend Account"
              description={`You are about to suspend the account for ${active.full_name || active.email}. They will be logged out of all sessions.`}
              actionName="Suspend Account"
              confirmationText="SUSPEND"
              requiresConfirmation
              onConfirm={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                alert(`Account suspended for ${active.full_name || active.email}`);
              }}
              isDestructive
              riskLevel="high"
            >
              <div className="space-y-2 text-sm">
                <p><strong>This user will:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Be logged out of all current sessions</li>
                  <li>Be unable to log in</li>
                  <li>Still appear in audit logs</li>
                </ul>
              </div>
            </SensitiveActionModal>

            <SensitiveActionModal
              open={deleteModalOpen}
              onOpenChange={setDeleteModalOpen}
              title="Delete User"
              description={`You are about to permanently delete ${active.full_name || active.email} and all their associated data.`}
              actionName="Delete Permanently"
              confirmationText="DELETE"
              requiresConfirmation
              onConfirm={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                alert(`User ${active.full_name || active.email} has been deleted`);
              }}
              isDestructive
              riskLevel="high"
            >
              <div className="space-y-2 text-sm">
                <p className="font-medium text-red-700 dark:text-red-300">
                  ⚠️ This action cannot be undone!
                </p>
                <p>All data associated with this user will be permanently removed from the system.</p>
              </div>
            </SensitiveActionModal>
          </>
        )}

        <InviteModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onSent={refetchInvites}
          allowedRoles={['doctor', 'nurse', 'patient']}
        />
      </div>
    </DashboardLayout>
  );
}
