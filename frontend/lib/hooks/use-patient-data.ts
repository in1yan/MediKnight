import { useState, useEffect, useCallback } from 'react';
import { patientApi, ApiPatientRecord, ApiPrescription } from '@/lib/api';
import { PatientRecord, Prescription } from '@/lib/types';

// ─── Mappers (snake_case API → camelCase frontend types) ─────────────────────

export function mapRecord(r: ApiPatientRecord): PatientRecord {
  return {
    id: r.id,
    patientId: r.patient_id,
    type: r.type,
    title: r.title,
    description: r.description,
    date: r.date,
    provider: r.provider,
  };
}

export function mapPrescription(p: ApiPrescription): Prescription {
  return {
    id: p.id,
    patientId: p.patient_id,
    medication: p.medication,
    dosage: p.dosage,
    frequency: p.frequency,
    startDate: p.start_date,
    endDate: p.end_date ?? '',
    prescribedBy: p.prescribed_by,
    status: p.status,
  };
}

// ─── Generic hook factory ────────────────────────────────────────────────────

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

// ─── Patient Records hook ────────────────────────────────────────────────────

export function usePatientRecords(patientId: string | undefined) {
  const state = useAsyncData(
    () =>
      patientId
        ? patientApi.getRecords(patientId).then((rs) => rs.map(mapRecord))
        : Promise.resolve([]),
    [patientId],
  );
  return { ...state, records: state.data ?? [] };
}

// ─── Patient Prescriptions hook ───────────────────────────────────────────────

export function usePatientPrescriptions(patientId: string | undefined) {
  const state = useAsyncData(
    () =>
      patientId
        ? patientApi.getPrescriptions(patientId).then((ps) => ps.map(mapPrescription))
        : Promise.resolve([]),
    [patientId],
  );
  return { ...state, prescriptions: state.data ?? [] };
}
