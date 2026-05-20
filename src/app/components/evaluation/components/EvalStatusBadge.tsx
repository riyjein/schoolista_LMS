import { cn } from '@/app/components/ui/utils';
import { CheckCircle2, PenLine, Circle } from 'lucide-react';

type EvalStatusType = 'not-started' | 'draft' | 'submitted';

const CONFIG: Record<EvalStatusType, { label: string; className: string; Icon: React.ElementType }> = {
  'not-started': { label: 'Not Started', className: 'bg-muted text-muted-foreground border-border', Icon: Circle },
  draft:         { label: 'Draft',       className: 'bg-yellow-50 text-yellow-800 border-yellow-200', Icon: PenLine },
  submitted:     { label: 'Submitted',   className: 'bg-green-50 text-green-800 border-green-200',   Icon: CheckCircle2 },
};

interface Props {
  status: EvalStatusType;
  size?: 'sm' | 'md';
}

export function EvalStatusBadge({ status, size = 'md' }: Props) {
  const { label, className, Icon } = CONFIG[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      className,
    )}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </span>
  );
}
