'use client';

import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface FormErrorProps {
  message?: string | null;
  attemptsRemaining?: number | null;
  retryAfter?: number | null;
}

export function FormError({ message, attemptsRemaining, retryAfter }: FormErrorProps) {
  if (!message) return null;

  let content = message;

  // Add attempts remaining information if available
  if (typeof attemptsRemaining === 'number') {
    content += ` (${attemptsRemaining} attempts remaining)`;
  }

  // Add retry timer if locked out
  if (typeof retryAfter === 'number' && retryAfter > 0) {
    content += `. Try again in ${retryAfter} seconds.`;
  }

  return (
    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start gap-2 my-2">
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>{content}</div>
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
  touched?: boolean;
}

export function FieldError({ error, touched }: FieldErrorProps) {
  if (!error || !touched) return null;

  return (
    <div className="text-destructive text-xs flex items-center mt-1">
      <XCircle className="h-3 w-3 mr-1" />
      {error}
    </div>
  );
}

interface AlertProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
}

export function Alert({ type, title, children }: AlertProps) {
  const styles = {
    error: {
      bg: 'bg-destructive/15',
      text: 'text-destructive',
      icon: <AlertCircle className="h-5 w-5" />,
    },
    warning: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-600',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    info: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-600',
      icon: <Info className="h-5 w-5" />,
    },
    success: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-600',
      icon: <Info className="h-5 w-5" />,
    },
  };

  const { bg, text, icon } = styles[type];

  return (
    <div className={`${bg} ${text} p-4 rounded-md my-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div>
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}