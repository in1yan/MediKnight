'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/lib/types';
import { Shield, Stethoscope, Heart, Lock } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';

interface RoleIndicatorProps {
  role: UserRole;
  showLabel?: boolean;
  showIcon?: boolean;
}

const ROLE_CONFIG: Record<UserRole, { icon: React.ReactNode; color: string; bgColor: string }> = {
  patient: {
    icon: <Heart className="h-4 w-4" />,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  doctor: {
    icon: <Stethoscope className="h-4 w-4" />,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  nurse: {
    icon: <Heart className="h-4 w-4" />,
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  admin: {
    icon: <Shield className="h-4 w-4" />,
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
  },
};

export function RoleIndicator({ role, showLabel = true, showIcon = true }: RoleIndicatorProps) {
  const config = ROLE_CONFIG[role];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
      {showIcon && config.icon}
      {showLabel && <span className="capitalize">{ROLE_LABELS[role]}</span>}
    </span>
  );
}

export function RoleGrid({ selectedRole, onSelect }: { selectedRole: UserRole; onSelect: (role: UserRole) => void }) {
  const roles: UserRole[] = ['patient', 'doctor', 'nurse', 'admin'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {roles.map((role) => {
        const config = ROLE_CONFIG[role];
        const isSelected = role === selectedRole;

        return (
          <button
            key={role}
            onClick={() => onSelect(role)}
            className={`p-3 rounded-lg border-2 transition-all ${
              isSelected
                ? `border-blue-600 ${config.bgColor}`
                : 'border-border hover:border-blue-300'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={config.color}>{config.icon}</div>
              <span className="text-sm font-medium capitalize">{ROLE_LABELS[role]}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
