import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TrendBadge from './TrendBadge';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  trend?: number | null;
  className?: string;
  compact?: boolean;
  footer?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  className = '',
  compact = false,
  footer
}) => {
  return (
    <Card className={`hover:shadow-sm transition-shadow ${className}`}>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${compact ? 'pb-1' : 'pb-2'}`}>
        <CardTitle className={`font-medium ${compact ? 'text-[11px]' : 'text-sm'}`}>{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className={compact ? 'pt-0' : ''}>
        <div className={`font-semibold ${compact ? 'text-base sm:text-lg' : 'text-xl md:text-2xl'} flex items-center`}> 
          {value}
          {trend !== undefined && trend !== null && <TrendBadge value={trend} />}
        </div>
        {subtitle && (
          <p className={`text-muted-foreground ${compact ? 'text-[10px] mt-0.5' : 'text-xs mt-1'}`}>{subtitle}</p>
        )}
        {footer && <div className="mt-2 text-[10px] text-muted-foreground">{footer}</div>}
      </CardContent>
    </Card>
  );
};

export default StatCard;