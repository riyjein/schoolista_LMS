import type { GradeStatus } from '@/lib/types/grades';
import { cn } from '@/app/components/ui/utils';

const CONFIG: Record<GradeStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-gray-100 text-gray-600 border-gray-200' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  finalized: { label: 'Finalized', className: 'bg-green-100 text-green-700 border-green-200' },
};

export function GradeStatusBadge({ status, size = 'md' }: { status: GradeStatus; size?: 'sm' | 'md' }) {
  const { label, className } = CONFIG[status];
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      className,
    )}>
      {label}
    </span>
  );
}
