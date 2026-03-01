'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Permission } from '@/lib/types';
import { Lock, Eye, Edit3, Pill, Users, BarChart3, AlertTriangle } from 'lucide-react';

interface PermissionBadgeProps {
  permission: Permission;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

const PERMISSION_INFO: Record<Permission, { label: string; icon: React.ReactNode; description: string }> = {
  view_own_records: {
    label: 'View Own Records',
    icon: <Eye className="h-3 w-3" />,
    description: 'Can view their own medical records',
  },
  view_patient_records: {
    label: 'View Patient Records',
    icon: <Eye className="h-3 w-3" />,
    description: 'Can view patient medical information',
  },
  edit_patient_records: {
    label: 'Edit Patient Records',
    icon: <Edit3 className="h-3 w-3" />,
    description: 'Can edit patient medical records',
  },
  prescribe_medication: {
    label: 'Prescribe Medication',
    icon: <Pill className="h-3 w-3" />,
    description: 'Can create and manage prescriptions',
  },
  manage_users: {
    label: 'Manage Users',
    icon: <Users className="h-3 w-3" />,
    description: 'Can manage user accounts and roles',
  },
  view_audit_logs: {
    label: 'View Audit Logs',
    icon: <BarChart3 className="h-3 w-3" />,
    description: 'Can view system audit trails',
  },
  break_glass_access: {
    label: 'Break Glass Access',
    icon: <AlertTriangle className="h-3 w-3" />,
    description: 'Emergency access with security logging',
  },
};

export function PermissionBadge({ permission, variant = 'default' }: PermissionBadgeProps) {
  const info = PERMISSION_INFO[permission];

  return (
    <div
      title={info.description}
      className="inline-flex items-center gap-1"
    >
      <Badge variant={variant} className="gap-1">
        {info.icon}
        {info.label}
      </Badge>
    </div>
  );
}

export function PermissionsList({ permissions }: { permissions: Permission[] }) {
  return (
    <div className="space-y-2">
      {permissions.map((perm) => (
        <div key={perm} className="flex items-start gap-2">
          <PermissionBadge permission={perm} variant="secondary" />
          <span className="text-sm text-muted-foreground">{PERMISSION_INFO[perm].description}</span>
        </div>
      ))}
    </div>
  );
}
