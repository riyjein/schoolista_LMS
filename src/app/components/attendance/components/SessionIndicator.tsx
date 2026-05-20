import type { AttendanceSession } from '@/lib/types/attendance';
import { cn } from '@/app/components/ui/utils';
import { Clock, CheckCircle2, Lock } from 'lucide-react';
import { classOfferings } from '@/lib/data/attendance/class-offerings';
import { subjects } from '@/lib/data/enrollment/subjects';

interface Props {
  session: AttendanceSession;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SessionIndicator({ session, isSelected, onClick }: Props) {
  const offering = classOfferings.find((o) => o.id === session.classId);
  const subject = subjects.find((s) => s.id === offering?.subjectId);

  const statusConfig = {
    open: { icon: Clock, color: 'text-green-600', bg: 'bg-green-50 border-green-300', label: 'Open' },
    closed: { icon: Lock, color: 'text-gray-400', bg: 'bg-gray-50 border-gray-200', label: 'Closed' },
    upcoming: { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200', label: 'Upcoming' },
  };

  const { icon: Icon, color, bg, label } = statusConfig[session.status];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'w-full rounded-lg border-2 p-3 text-left transition-all',
        bg,
        isSelected && 'ring-2 ring-offset-1 ring-blue-500',
        onClick && 'cursor-pointer hover:shadow-sm',
        !onClick && 'cursor-default',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{subject?.code ?? session.classId}</p>
          <p className="text-muted-foreground truncate text-sm">{subject?.title}</p>
          <p className="text-muted-foreground text-xs mt-1">
            {session.openTime} – {session.closeTime} · Late after {session.lateAfter}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Icon className={cn('h-4 w-4', color)} />
          <span className={cn('text-xs font-medium', color)}>{label}</span>
        </div>
      </div>
    </button>
  );
}
