import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  variant?: 'default' | 'success' | 'danger';
}

export function KPICard({ title, value, subtitle, icon, trend, className, variant = 'default' }: KPICardProps) {
  // Determine card styling based on variant
  const cardClasses = variant === 'success' 
    ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30 glow-blue' 
    : variant === 'danger' 
    ? 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30 glow-orange' 
    : 'bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 border-accent-blue/20';
  
  const valueClasses = variant === 'success'
    ? 'text-green-400'
    : variant === 'danger'
    ? 'text-red-400'
    : 'text-gray-100';

  const iconClasses = variant === 'success'
    ? 'text-green-400'
    : variant === 'danger'
    ? 'text-red-400'
    : 'text-accent-blue';

  return (
    <Card className={`${cardClasses} ${className || ''} hover:scale-105 transition-transform duration-200`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${valueClasses}`}>{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={`text-sm mt-2 ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          {icon && (
            <div className={`ml-4 ${iconClasses} opacity-80`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

