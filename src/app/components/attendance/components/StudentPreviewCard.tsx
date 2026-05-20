import type { ScanResult } from '@/lib/types/attendance';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { cn } from '@/app/components/ui/utils';
import { CheckCircle2, XCircle, Clock, AlertCircle, User } from 'lucide-react';

interface Props {
  result: ScanResult;
  studentName?: string;
  studentNumber?: string;
}

const RESULT_ICONS = {
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 border-green-200' },
  late: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  warning: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
};

function getResultStyle(result: ScanResult) {
  if (result.code === 'already-logged') return RESULT_ICONS.warning;
  if (!result.success) return RESULT_ICONS.error;
  if (result.status === 'late') return RESULT_ICONS.late;
  return RESULT_ICONS.success;
}

export function StudentPreviewCard({ result, studentName, studentNumber }: Props) {
  const style = getResultStyle(result);
  const Icon = style.icon;

  return (
    <div className={cn('rounded-xl border-2 p-5 transition-all', style.bg)}>
      <div className="flex items-start gap-4">
        <div className={cn('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2', style.bg)}>
          {result.success ? (
            <User className={cn('h-6 w-6', style.color)} />
          ) : (
            <Icon className={cn('h-6 w-6', style.color)} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {result.success && studentName ? (
            <>
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold">{studentName}</p>
                {result.status && <AttendanceStatusBadge status={result.status} size="sm" />}
              </div>
              <p className="text-muted-foreground text-sm">{studentNumber}</p>
              {result.subjectCode && (
                <p className="mt-1 text-sm">
                  <span className="font-medium">{result.subjectCode}</span>
                  {result.subjectTitle && (
                    <span className="text-muted-foreground"> — {result.subjectTitle}</span>
                  )}
                </p>
              )}
              {result.timeIn && (
                <p className="text-muted-foreground mt-1 text-sm">Time In: {result.timeIn}</p>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold">{getErrorTitle(result.code)}</p>
              <p className="text-muted-foreground mt-1 text-sm">{result.message}</p>
              {result.code === 'already-logged' && result.timeIn && (
                <p className="text-muted-foreground text-sm">Recorded at: {result.timeIn}</p>
              )}
            </>
          )}
        </div>

        <Icon className={cn('h-6 w-6 flex-shrink-0', style.color)} />
      </div>
    </div>
  );
}

function getErrorTitle(code: string): string {
  switch (code) {
    case 'unknown-card': return 'Unknown Card';
    case 'inactive-card': return 'Inactive Card';
    case 'already-logged': return 'Already Logged';
    case 'no-class': return 'Not Enrolled';
    case 'too-early': return 'Too Early';
    case 'session-closed': return 'Session Closed';
    default: return 'Scan Failed';
  }
}
