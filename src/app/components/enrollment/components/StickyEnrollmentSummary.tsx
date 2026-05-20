import { Trash2, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { UnitCounter } from './UnitCounter';
import { cn } from '@/app/components/ui/utils';
import type { UnitComputationResult } from '@/lib/hooks/useUnitComputation';
import type { Subject } from '@/lib/types/enrollment';

const TYPE_COLORS: Record<string, string> = {
  major:    'bg-blue-100 text-blue-700',
  minor:    'bg-purple-100 text-purple-700',
  GE:       'bg-green-100 text-green-700',
  elective: 'bg-amber-100 text-amber-700',
  PE:       'bg-orange-100 text-orange-700',
  NSTP:     'bg-teal-100 text-teal-700',
};

interface StickyEnrollmentSummaryProps {
  selectedSubjects: Subject[];
  computation: UnitComputationResult;
  onRemove: (id: string) => void;
  onContinue: () => void;
  continueLabel?: string;
  isLastStep?: boolean;
}

export function StickyEnrollmentSummary({
  selectedSubjects,
  computation,
  onRemove,
  onContinue,
  continueLabel = 'Continue',
  isLastStep = false,
}: StickyEnrollmentSummaryProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-slate-800">Enrollment Cart</h3>
          <Badge className="ml-auto bg-[var(--color-primary)] text-white text-xs">
            {selectedSubjects.length}
          </Badge>
        </div>
        <UnitCounter computation={computation} />
      </div>

      {/* Subject list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {selectedSubjects.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No subjects selected yet</p>
            </div>
          ) : (
            selectedSubjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400">{subject.code}</span>
                    <Badge
                      variant="outline"
                      className={cn('text-[9px] px-1 py-0 h-3.5 border-0', TYPE_COLORS[subject.type])}
                    >
                      {subject.type}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-snug mt-0.5 truncate">
                    {subject.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{subject.units} units</p>
                </div>
                <button
                  onClick={() => onRemove(subject.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 hover:text-red-500 text-slate-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <Separator className="mb-3" />
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total Subjects</span>
          <span className="font-semibold">{selectedSubjects.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total Units</span>
          <span className="font-semibold">{computation.totalUnits}</span>
        </div>
        <Button
          onClick={onContinue}
          disabled={selectedSubjects.length === 0 || computation.isOverload}
          title={computation.isUnderload ? `Warning: only ${computation.totalUnits} units selected (min ${15} recommended)` : undefined}
          className={cn(
            'w-full mt-2 gap-1.5',
            isLastStep
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark,#1d4ed8)]',
          )}
        >
          {continueLabel}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
