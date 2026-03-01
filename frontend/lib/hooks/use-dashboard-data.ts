import { useState, useEffect, useCallback } from 'react';
import {
  adminApi, doctorApi, inviteApi,
  ApiAdminStats, ApiAuditLog, ApiUser, ApiInvite,
} from '@/lib/api';

// ─── Generic async hook ───────────────────────────────────────────────────────

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetcher()
      .then((result) => { if (!cancelled) { setData(result); setIsLoading(false); } })
      .catch((err: Error) => { if (!cancelled) { setError(err.message); setIsLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, isLoading, error, refetch };
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminStats() {
  const state = useAsyncData<ApiAdminStats>(() => adminApi.getStats(), []);
  return { ...state, stats: state.data };
}

export function useAdminUsers(role?: string) {
  const state = useAsyncData<ApiUser[]>(() => adminApi.getUsers(role), [role]);
  return { ...state, users: state.data ?? [] };
}

export function useAdminAuditLogs(limit = 5) {
  const state = useAsyncData<ApiAuditLog[]>(() => adminApi.getAuditLogs(limit), [limit]);
  return { ...state, logs: state.data ?? [] };
}

export function useAdminAuditLogsFull(skip: number, limit: number, search: string) {
  const state = useAsyncData<ApiAuditLog[]>(
    () => adminApi.getAuditLogsFiltered(skip, limit),
    [skip, limit],
  );
  // client-side search filter applied to the loaded page
  const logs = (state.data ?? []).filter((l) =>
    !search ||
    l.user_name.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase()),
  );
  return { ...state, logs };
}

// ─── Doctor / Nurse hook (shared patient list) ────────────────────────────────

export function usePatientList() {
  const state = useAsyncData<ApiUser[]>(() => doctorApi.getPatients(), []);
  return { ...state, patients: state.data ?? [] };
}

// ─── Invites hook ─────────────────────────────────────────────────────────────

export function useInvites() {
  const state = useAsyncData<ApiInvite[]>(() => inviteApi.list(), []);
  return { ...state, invites: state.data ?? [] };
}
