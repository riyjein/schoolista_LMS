import { cn } from '@/app/components/ui/utils';
import { Lock, Send, PenLine } from 'lucide-react';
import type { GradeStatus } from '@/lib/types/grades';

const CONFIG: Record<GradeStatus, { label: string; className: string; Icon: React.ElementType }> = {
  draft:     { label: 'Draft',     className: 'bg-yellow-50 text-yellow-800 border-yellow-200', Icon: PenLine },
  submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-800 border-blue-200',       Icon: Send },
  finalized: { label: 'Finalized', className: 'bg-green-50 text-green-800 border-green-200',    Icon: Lock },
};

interface Props {
  status: GradeStatus;
  size?: 'sm' | 'md';
}

export function GradeStatusBadge({ status, size = 'md' }: Props) {
  const { label, className, Icon } = CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </span>
  );
}
