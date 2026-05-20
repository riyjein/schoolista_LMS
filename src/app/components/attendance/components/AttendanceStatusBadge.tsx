import type { AttendanceStatus } from '@/lib/types/attendance';
import { cn } from '@/app/components/ui/utils';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: 'Present', className: 'bg-green-100 text-green-800 border-green-200' },
  late: { label: 'Late', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  absent: { label: 'Absent', className: 'bg-red-100 text-red-800 border-red-200' },
  excused: { label: 'Excused', className: 'bg-blue-100 text-blue-800 border-blue-200' },
};

interface Props {
  status: AttendanceStatus;
  size?: 'sm' | 'md';
}

export function AttendanceStatusBadge({ status, size = 'md' }: Props) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 font-medium',
        size === 'sm' ? 'py-0.5 text-xs' : 'py-1 text-sm',
        className,
      )}
    >
      {label}
    </span>
  );
}
