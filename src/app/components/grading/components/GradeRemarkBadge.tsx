import { cn } from '@/app/components/ui/utils';
import type { GradeRemark } from '@/lib/types/grades';

const CONFIG: Record<GradeRemark, string> = {
  'Passed':     'bg-green-50 text-green-800 border-green-200',
  'Failed':     'bg-red-50 text-red-800 border-red-200',
  'Incomplete': 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'No Grade':   'bg-muted text-muted-foreground border-border',
  'Dropped':    'bg-slate-50 text-slate-700 border-slate-200',
};

interface Props {
  remark: GradeRemark;
  size?: 'sm' | 'md';
}

export function GradeRemarkBadge({ remark, size = 'md' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        CONFIG[remark],
      )}
    >
      {remark}
    </span>
  );
}
