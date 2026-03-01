export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  permissions: Permission[];
  lastLogin?: string;
  mfaEnabled: boolean;
  dateOfBirth?: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name?: string;
  date_of_birth?: string;
  role?: UserRole;
}

export type Permission = 
  | 'view_own_records'
  | 'view_patient_records'
  | 'edit_patient_records'
  | 'prescribe_medication'
  | 'manage_users'
  | 'view_audit_logs'
  | 'break_glass_access';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export interface PatientRecord {
  id: string;
  patientId: string;
  type: 'diagnosis' | 'lab' | 'imaging' | 'vital' | 'note';
  title: string;
  description: string;
  date: string;
  provider: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  status: 'active' | 'inactive' | 'completed';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress?: string;
  status: 'success' | 'failure';
}
