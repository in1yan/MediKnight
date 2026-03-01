const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_access_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...restOptions,
    headers: { 'Content-Type': 'application/json', ...optHeaders },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function authedRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');
  return request<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

// ─── Auth types ──────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  avatar?: string;
  is_active?: boolean;
  created_at: string;
  date_of_birth?: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name?: string;
  date_of_birth?: string;
  role?: string;
}

// ─── Patient resource types ───────────────────────────────────────────────────

export interface ApiPatientRecord {
  id: string;
  patient_id: string;
  type: 'diagnosis' | 'lab' | 'imaging' | 'vital' | 'note';
  title: string;
  description: string;
  date: string;
  provider: string;
  created_by_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiPrescription {
  id: string;
  patient_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  prescribed_by: string;
  prescribed_by_id?: string;
  status: 'active' | 'inactive' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface ApiAppointment {
  id: string;
  patient_id: string;
  doctor_id?: string;
  doctor_name?: string;
  title: string;
  appointment_type: 'consultation' | 'follow_up' | 'lab' | 'imaging' | 'procedure' | 'emergency';
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  location?: string;
  department?: string;
  created_at: string;
  updated_at?: string;
}

// ─── Invite types ─────────────────────────────────────────────────────────────

export interface ApiInvite {
  id: string;
  email: string;
  role: string;
  invited_by_id: string;
  invited_by_name: string;
  created_at: string;
  used: boolean;
}

// ─── Admin types ──────────────────────────────────────────────────────────────

export interface ApiAdminStats {
  total_users: number;
  patients: number;
  doctors: number;
  nurses: number;
  admins: number;
  total_audit_logs: number;
  failed_logins: number;
}

export interface ApiAuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  resource_id: string;
  timestamp: string;
  ip_address?: string;
  status: 'success' | 'failure';
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (payload: SignupPayload) =>
    request<ApiUser>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (email: string, password: string) =>
    request<{ mfa_required: boolean; email: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyMfa: (email: string, token: string) =>
    request<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      user: ApiUser;
    }>('/api/v1/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    }),

  logout: () =>
    request<void>('/api/v1/auth/logout', { method: 'POST' }),
};

// ─── Patient API ──────────────────────────────────────────────────────────────

export const patientApi = {
  getRecords: (patientId: string) =>
    authedRequest<ApiPatientRecord[]>(`/api/v1/patients/${patientId}/records`),

  getRecord: (patientId: string, recordId: string) =>
    authedRequest<ApiPatientRecord>(`/api/v1/patients/${patientId}/records/${recordId}`),

  getPrescriptions: (patientId: string) =>
    authedRequest<ApiPrescription[]>(`/api/v1/patients/${patientId}/prescriptions`),

  getPrescription: (patientId: string, prescriptionId: string) =>
    authedRequest<ApiPrescription>(`/api/v1/patients/${patientId}/prescriptions/${prescriptionId}`),

  getAppointments: (patientId: string) =>
    authedRequest<ApiAppointment[]>(`/api/v1/patients/${patientId}/appointments`),

  createAppointment: (patientId: string, payload: Partial<ApiAppointment>) =>
    authedRequest<ApiAppointment>(`/api/v1/patients/${patientId}/appointments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAppointment: (patientId: string, appointmentId: string, payload: Partial<ApiAppointment>) =>
    authedRequest<ApiAppointment>(`/api/v1/patients/${patientId}/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteAppointment: (patientId: string, appointmentId: string) =>
    authedRequest<void>(`/api/v1/patients/${patientId}/appointments/${appointmentId}`, {
      method: 'DELETE',
    }),

  createRecord: (patientId: string, payload: Partial<ApiPatientRecord>) =>
    authedRequest<ApiPatientRecord>(`/api/v1/patients/${patientId}/records`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateRecord: (patientId: string, recordId: string, payload: Partial<ApiPatientRecord>) =>
    authedRequest<ApiPatientRecord>(`/api/v1/patients/${patientId}/records/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteRecord: (patientId: string, recordId: string) =>
    authedRequest<void>(`/api/v1/patients/${patientId}/records/${recordId}`, {
      method: 'DELETE',
    }),

  createPrescription: (patientId: string, payload: Partial<ApiPrescription>) =>
    authedRequest<ApiPrescription>(`/api/v1/patients/${patientId}/prescriptions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updatePrescription: (patientId: string, prescriptionId: string, payload: Partial<ApiPrescription>) =>
    authedRequest<ApiPrescription>(`/api/v1/patients/${patientId}/prescriptions/${prescriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

// ─── Invite API ───────────────────────────────────────────────────────────────

export const inviteApi = {
  create: (email: string, role: string) =>
    authedRequest<ApiInvite>('/api/v1/invites', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),

  list: () =>
    authedRequest<ApiInvite[]>('/api/v1/invites'),

  revoke: (id: string) =>
    authedRequest<void>(`/api/v1/invites/${id}`, { method: 'DELETE' }),
};

export const doctorApi = {
  getPatients: () =>
    authedRequest<ApiUser[]>('/api/v1/patients'),
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: () =>
    authedRequest<ApiAdminStats>('/api/v1/admin/stats'),

  getUsers: (role?: string) =>
    authedRequest<ApiUser[]>(`/api/v1/admin/users${role ? `?role=${role}` : ''}`),

  getAuditLogs: (limit = 5) =>
    authedRequest<ApiAuditLog[]>(`/api/v1/audit-logs?limit=${limit}`),

  getAuditLogsFiltered: (skip = 0, limit = 100) =>
    authedRequest<ApiAuditLog[]>(`/api/v1/audit-logs?skip=${skip}&limit=${limit}`),
};

// ─── Profile API ───────────────────────────────────────────────────────────────

export const profileApi = {
  updateMe: (payload: { full_name?: string; date_of_birth?: string }) =>
    authedRequest<ApiUser>('/api/v1/patients/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    authedRequest<ApiUser>('/api/v1/patients/me'),
};
