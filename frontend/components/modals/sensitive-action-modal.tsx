'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SensitiveActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionName: string;
  requiresConfirmation?: boolean;
  confirmationText?: string;
  children?: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  isDestructive?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

export function SensitiveActionModal({
  open,
  onOpenChange,
  title,
  description,
  actionName,
  requiresConfirmation = true,
  confirmationText = actionName,
  children,
  onConfirm,
  isDestructive = false,
  riskLevel = 'medium',
}: SensitiveActionModalProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfirmed = !requiresConfirmation || confirmationInput === confirmationText;

  const handleConfirm = async () => {
    if (!isConfirmed) {
      setError('Confirmation text does not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onConfirm();
      setConfirmationInput('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const riskColors = {
    low: { bg: 'bg-blue-50 dark:bg-blue-950/10', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-900 dark:text-blue-100', icon: 'text-blue-600' },
    medium: { bg: 'bg-orange-50 dark:bg-orange-950/10', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-900 dark:text-orange-100', icon: 'text-orange-600' },
    high: { bg: 'bg-red-50 dark:bg-red-950/10', border: 'border-red-200 dark:border-red-800', text: 'text-red-900 dark:text-red-100', icon: 'text-red-600' },
  };

  const colors = riskColors[riskLevel];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${colors.icon}`} />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border} space-y-3`}>
          <div className={`text-sm ${colors.text}`}>
            <p className="font-medium">
              {riskLevel === 'high'
                ? '⚠️ This action cannot be undone'
                : riskLevel === 'medium'
                  ? '⚠️ Please review before confirming'
                  : 'This action will be recorded in audit logs'}
            </p>
          </div>

          {children && <div className="text-sm text-slate-700 dark:text-slate-300">{children}</div>}

          {requiresConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirmation" className="text-sm">
                Type "{confirmationText}" to confirm:
              </Label>
              <Input
                id="confirmation"
                placeholder={confirmationText}
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                disabled={isLoading}
                className="font-mono text-sm"
              />
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            onClick={() => {
              setConfirmationInput('');
              setError('');
              onOpenChange(false);
            }}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            className={isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              actionName
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
