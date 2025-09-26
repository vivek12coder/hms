import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import React from 'react';

interface TrendBadgeProps {
  value?: number | null; // positive or negative percentage
  className?: string;
  hideIcon?: boolean;
  precision?: number; // decimal places
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ value, className = '', hideIcon = false, precision = 1 }) => {
  if (value === undefined || value === null) return null;
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  const formatted = Math.abs(value).toFixed(precision);
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md ml-1 ${
        positive
          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400'
      } ${className}`}
    >
      {!hideIcon && <Icon className="h-3 w-3 mr-0.5" />}{formatted}%
    </span>
  );
};

export default TrendBadge;