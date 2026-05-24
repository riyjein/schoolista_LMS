import { Lock, CheckCircle2, AlertTriangle, BookOpen, FlaskConical, Info } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/app/components/ui/tooltip';
import { cn } from '@/app/components/ui/utils';
import type { EnrichedSubject } from '@/lib/types/enrollment';

const TYPE_COLORS: Record<string, string> = {
  major:    'bg-blue-100 text-blue-700 border-blue-200',
  minor:    'bg-purple-100 text-purple-700 border-purple-200',
  GE:       'bg-green-100 text-green-700 border-green-200',
  elective: 'bg-amber-100 text-amber-700 border-amber-200',
  PE:       'bg-orange-100 text-orange-700 border-orange-200',
  NSTP:     'bg-teal-100 text-teal-700 border-teal-200',
};

interface SubjectCardProps {
  subject: EnrichedSubject;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function SubjectCard({ subject, isSelected, onToggle }: SubjectCardProps) {
  const isLocked = subject.status === 'locked';
  const isCompleted = subject.status === 'completed';
  const isDisabled = isLocked || isCompleted;

  return (
    <TooltipProvider>
      <div
        onClick={() => !isDisabled && onToggle(subject.id)}
        className={cn(
          'relative rounded-xl border-2 p-4 transition-all duration-200 select-none',
          !isDisabled && 'cursor-pointer',
          isDisabled && 'cursor-not-allowed opacity-60',
          isSelected && !isDisabled
            ? 'border-[var(--color-primary)] bg-blue-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
          isLocked && 'bg-slate-50 border-slate-200',
          isCompleted && 'bg-green-50 border-green-200',
          subject.isRecommended && !isSelected && 'ring-2 ring-amber-300 ring-offset-1',
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-slate-500 shrink-0">
                {subject.code}
              </span>
              <Badge
                variant="outline"
                className={cn('text-[10px] px-1.5 py-0 h-4 border', TYPE_COLORS[subject.type] ?? 'bg-slate-100 text-slate-600')}
              >
                {subject.type.toUpperCase()}
              </Badge>
              {subject.isRecommended && !isSelected && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-500 text-white">
                  Suggested
                </Badge>
              )}
            </div>
            <p className="mt-1 font-medium text-slate-800 leading-snug">
              {subject.title}
            </p>
          </div>

          {/* Status icon */}
          <div className="shrink-0 mt-0.5">
            {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {isLocked && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock className="w-5 h-5 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-56">
                  <p className="text-xs">{subject.lockReason}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isSelected && !isDisabled && (
              <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Units row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {subject.lecUnits} lec
          </span>
          {subject.labUnits > 0 && (
            <span className="flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" />
              {subject.labUnits} lab
            </span>
          )}
          <span className="font-semibold text-slate-700 ml-auto">
            {subject.units} unit{subject.units !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Prerequisite warning */}
        {isLocked && subject.unmetPrerequisites.length > 0 && (
          <div className="mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-tight">
              Requires:{' '}
              {subject.unmetPrerequisites.map((p) => (
                <span key={p.id} className="font-semibold">{p.code}</span>
              )).reduce((acc: React.ReactNode[], el, i) => (
                i === 0 ? [el] : [...acc, ', ', el]
              ), [])}
            </p>
          </div>
        )}

        {/* Description tooltip */}
        {subject.description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-3 right-3 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-64">
              <p className="text-xs">{subject.description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
