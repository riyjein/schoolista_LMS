import type { GPAResult } from '../../../../lib/types/grades';
import { cn } from '../../ui/utils';
import { TrendingUp } from 'lucide-react';

interface Props {
  gpaResult: GPAResult;
  label?: string;
}

function gpaColor(gpa: number | null): string {
  if (gpa === null) return 'text-muted-foreground';
  if (gpa <= 1.5) return 'text-green-600';
  if (gpa <= 1.75) return 'text-blue-600';
  if (gpa <= 2.5) return 'text-foreground';
  if (gpa <= 3.0) return 'text-orange-600';
  return 'text-red-600';
}

function gpaLabel(gpa: number): string {
  if (gpa <= 1.25) return 'Excellent — Summa';
  if (gpa <= 1.5)  return 'Excellent — Magna';
  if (gpa <= 1.75) return 'Very Good — Cum Laude';
  if (gpa <= 2.0)  return 'Good';
  if (gpa <= 2.5)  return 'Satisfactory';
  if (gpa <= 3.0)  return 'Passing';
  return 'Below Passing';
}

export function GPASummaryCard({ gpaResult, label = 'Semester GPA' }: Props) {
  const { gpa, totalUnits, finalizedUnits, items } = gpaResult;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className={cn('mt-1 text-4xl font-bold tabular-nums', gpaColor(gpa))}>
            {gpa !== null ? gpa.toFixed(3) : '—'}
          </p>
          {gpa !== null && (
            <p className={cn('mt-1 text-sm font-medium', gpaColor(gpa))}>{gpaLabel(gpa)}</p>
          )}
        </div>

        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="mt-4 flex gap-6 border-t pt-4 text-sm">
        <div>
          <p className="text-muted-foreground">Finalized Units</p>
          <p className="font-semibold">{finalizedUnits} / {totalUnits}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Subjects Counted</p>
          <p className="font-semibold">{items.length}</p>
        </div>
        {gpa !== null && (
          <div>
            <p className="text-muted-foreground">Scale</p>
            <p className="font-semibold">Philippine 5-pt</p>
          </div>
        )}
      </div>
    </div>
  );
}
