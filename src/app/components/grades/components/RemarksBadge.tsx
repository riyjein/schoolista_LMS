import type { GradeRemark } from '@/lib/types/grades';
import { cn } from '@/app/components/ui/utils';

const CONFIG: Record<GradeRemark, { className: string }> = {
  Passed:     { className: 'bg-green-100 text-green-800 border-green-200' },
  Failed:     { className: 'bg-red-100 text-red-800 border-red-200' },
  Incomplete: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  Dropped:    { className: 'bg-gray-100 text-gray-600 border-gray-200' },
  'No Grade': { className: 'bg-muted text-muted-foreground border-border' },
};

export function RemarksBadge({ remarks, size = 'md' }: { remarks: GradeRemark; size?: 'sm' | 'md' }) {
  const { className } = CONFIG[remarks];
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      className,
    )}>
      {remarks}
    </span>
  );
}
