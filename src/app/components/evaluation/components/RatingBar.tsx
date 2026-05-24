import { cn } from '@/app/components/ui/utils';

interface Props {
  value: number | null;
  maxValue?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  colorClass?: string;
}

function ratingColor(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.9) return 'bg-green-500';
  if (pct >= 0.7) return 'bg-blue-500';
  if (pct >= 0.5) return 'bg-yellow-500';
  return 'bg-red-500';
}

function ratingTextColor(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.9) return 'text-green-700';
  if (pct >= 0.7) return 'text-blue-700';
  if (pct >= 0.5) return 'text-yellow-700';
  return 'text-red-700';
}

export function RatingBar({ value, maxValue = 5, label, showValue = true, size = 'md', colorClass }: Props) {
  if (value === null) {
    return (
      <div className="flex items-center gap-2">
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
        <span className="text-muted-foreground text-sm">No data</span>
      </div>
    );
  }

  const pct = (value / maxValue) * 100;
  const barColor = colorClass ?? ratingColor(value, maxValue);
  const textColor = ratingTextColor(value, maxValue);

  return (
    <div className="flex items-center gap-2">
      {label && <span className={cn('flex-shrink-0 text-sm', size === 'sm' ? 'w-28 text-xs' : 'w-36')}>{label}</span>}
      <div className={cn('flex-1 overflow-hidden rounded-full bg-muted', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className={cn('flex-shrink-0 font-semibold tabular-nums', textColor, size === 'sm' ? 'text-xs w-6' : 'text-sm w-8')}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export function StarRating({ value, maxValue = 5 }: { value: number | null; maxValue?: number }) {
  if (value === null) return <span className="text-muted-foreground text-sm">—</span>;
  const textColor = ratingTextColor(value, maxValue);
  return (
    <div className="flex items-center gap-1">
      <span className={cn('text-3xl font-bold tabular-nums', textColor)}>{value.toFixed(2)}</span>
      <span className="text-muted-foreground text-sm">/ {maxValue}</span>
    </div>
  );
}
