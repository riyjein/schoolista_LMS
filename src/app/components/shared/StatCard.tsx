import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../ui/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  description?: string;
  trend?: { value: number; label: string };
  accent?: 'primary' | 'secondary' | 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const accentStyles: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export function StatCard({ title, value, Icon, description, trend, accent = 'primary' }: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <Card className="gap-4 p-5 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="mt-1 text-[1.75rem] leading-none font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {description && (
            <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={cn('mt-2 inline-flex items-center gap-1 text-xs font-medium', isPositive ? 'text-emerald-600' : 'text-red-500')}>
              {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              <span>{isPositive ? '+' : ''}{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('flex-shrink-0 size-11 rounded-lg flex items-center justify-center', accentStyles[accent])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
