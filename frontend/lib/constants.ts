import { User, Permission, UserRole } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  patient: ['view_own_records'],
  doctor: ['view_patient_records', 'edit_patient_records', 'prescribe_medication'],
  nurse: ['view_patient_records'],
  admin: ['manage_users', 'view_audit_logs', 'view_patient_records'],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  nurse: 'Nurse',
  admin: 'Administrator',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  patient: 'Access your medical records and health information',
  doctor: 'Manage patient care, view records, and prescribe treatments',
  nurse: 'View patient vitals and assist with care coordination',
  admin: 'Manage system users and view audit logs',
};

// Mock Users for testing different roles
export const MOCK_USERS: Record<UserRole, User> = {
  patient: {
    id: 'user-patient-001',
    email: 'patient@example.com',
    name: 'Sarah Johnson',
    role: 'patient',
    avatar: 'SJ',
    permissions: ROLE_PERMISSIONS.patient,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    mfaEnabled: true,
  },
  doctor: {
    id: 'user-doctor-001',
    email: 'doctor@example.com',
    name: 'Dr. James Smith',
    role: 'doctor',
    avatar: 'JS',
    permissions: ROLE_PERMISSIONS.doctor,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    mfaEnabled: true,
  },
  nurse: {
    id: 'user-nurse-001',
    email: 'nurse@example.com',
    name: 'Emily Davis',
    role: 'nurse',
    avatar: 'ED',
    permissions: ROLE_PERMISSIONS.nurse,
    lastLogin: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    mfaEnabled: false,
  },
  admin: {
    id: 'user-admin-001',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'AU',
    permissions: ROLE_PERMISSIONS.admin,
    lastLogin: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    mfaEnabled: true,
  },
};

// Mock Patient Records
export const MOCK_PATIENT_RECORDS = [
  {
    id: 'record-001',
    patientId: 'user-patient-001',
    type: 'diagnosis' as const,
    title: 'Type 2 Diabetes',
    description: 'Confirmed diagnosis with HbA1c 7.2%',
    date: '2024-01-15',
    provider: 'Dr. James Smith',
  },
  {
    id: 'record-002',
    patientId: 'user-patient-001',
    type: 'lab' as const,
    title: 'Blood Work Results',
    description: 'Annual checkup - All values within normal range',
    date: '2024-02-10',
    provider: 'Lab Services',
  },
  {
    id: 'record-003',
    patientId: 'user-patient-001',
    type: 'imaging' as const,
    title: 'Chest X-Ray',
    description: 'Routine imaging - No abnormalities detected',
    date: '2024-02-15',
    provider: 'Radiology Dept',
  },
  {
    id: 'record-004',
    patientId: 'user-patient-001',
    type: 'vital' as const,
    title: 'Vital Signs - Feb 2024',
    description: 'BP: 128/82, HR: 72, Temp: 98.6F',
    date: '2024-02-20',
    provider: 'Clinic',
  },
];

export const MOCK_PRESCRIPTIONS = [
  {
    id: 'rx-001',
    patientId: 'user-patient-001',
    medication: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2024-01-20',
    endDate: '2025-01-20',
    prescribedBy: 'Dr. James Smith',
    status: 'active' as const,
  },
  {
    id: 'rx-002',
    patientId: 'user-patient-001',
    medication: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2024-02-01',
    endDate: '2025-02-01',
    prescribedBy: 'Dr. James Smith',
    status: 'active' as const,
  },
  {
    id: 'rx-003',
    patientId: 'user-patient-001',
    medication: 'Aspirin',
    dosage: '81mg',
    frequency: 'Once daily',
    startDate: '2023-12-15',
    endDate: '2024-12-15',
    prescribedBy: 'Dr. James Smith',
    status: 'completed' as const,
  },
];

// Mock Audit Logs
export const MOCK_AUDIT_LOGS = [
  {
    id: 'log-001',
    userId: 'user-doctor-001',
    userName: 'Dr. James Smith',
    action: 'viewed',
    resource: 'patient_record',
    resourceId: 'user-patient-001',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'success' as const,
  },
  {
    id: 'log-002',
    userId: 'user-doctor-001',
    userName: 'Dr. James Smith',
    action: 'updated',
    resource: 'prescription',
    resourceId: 'rx-001',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'success' as const,
  },
  {
    id: 'log-003',
    userId: 'user-admin-001',
    userName: 'Admin User',
    action: 'login',
    resource: 'user_session',
    resourceId: 'user-admin-001',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'success' as const,
  },
  {
    id: 'log-004',
    userId: 'user-patient-001',
    userName: 'Sarah Johnson',
    action: 'failed_access_attempt',
    resource: 'admin_panel',
    resourceId: 'admin',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'failure' as const,
  },
];

// Mock patient list for doctor/admin views
export const MOCK_PATIENT_LIST = [
  {
    id: 'patient-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    dateOfBirth: '1985-06-15',
    lastVisit: '2024-02-20',
    status: 'active' as const,
  },
  {
    id: 'patient-002',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    dateOfBirth: '1978-03-22',
    lastVisit: '2024-02-15',
    status: 'active' as const,
  },
  {
    id: 'patient-003',
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    dateOfBirth: '1992-11-08',
    lastVisit: '2024-02-10',
    status: 'active' as const,
  },
];

// Mock Users list for admin
export const MOCK_ALL_USERS = [
  MOCK_USERS.doctor,
  MOCK_USERS.nurse,
  MOCK_USERS.patient,
  {
    id: 'user-doctor-002',
    email: 'doctor2@example.com',
    name: 'Dr. Emily Chen',
    role: 'doctor' as const,
    avatar: 'EC',
    permissions: ROLE_PERMISSIONS.doctor,
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    mfaEnabled: true,
  },
  {
    id: 'user-nurse-002',
    email: 'nurse2@example.com',
    name: 'Michael Brown',
    role: 'nurse' as const,
    avatar: 'MB',
    permissions: ROLE_PERMISSIONS.nurse,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    mfaEnabled: false,
  },
];
