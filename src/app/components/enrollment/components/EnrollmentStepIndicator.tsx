import { Check } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface Step {
  number: number;
  label: string;
}

const STEPS: Step[] = [
  { number: 1, label: 'Context' },
  { number: 2, label: 'History' },
  { number: 3, label: 'Subjects' },
  { number: 4, label: 'Summary' },
  { number: 5, label: 'Payment' },
  { number: 6, label: 'Confirm' },
];

interface EnrollmentStepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: Record<number, boolean>;
}

export function EnrollmentStepIndicator({
  currentStep,
  onStepClick,
  completedSteps = {},
}: EnrollmentStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center justify-between w-full">
        {STEPS.map((step, idx) => {
          const isCompleted = completedSteps[step.number] && step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isPast = step.number < currentStep;
          const isClickable = isPast && onStepClick;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => isClickable && onStepClick(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                    isCurrent && 'bg-[var(--color-primary)] text-white shadow-md ring-4 ring-blue-100',
                    isPast && !isCurrent && 'bg-[var(--color-primary)] text-white',
                    !isCurrent && !isPast && 'bg-slate-100 text-slate-400 border-2 border-slate-200',
                    isClickable && 'cursor-pointer hover:opacity-90',
                    !isClickable && 'cursor-default',
                  )}
                >
                  {isCompleted || isPast ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{step.number}</span>
                  )}
                </button>
                <span
                  className={cn(
                    'text-[11px] font-medium whitespace-nowrap',
                    isCurrent && 'text-[var(--color-primary)]',
                    isPast && !isCurrent && 'text-slate-500',
                    !isCurrent && !isPast && 'text-slate-400',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mt-[-18px] transition-colors duration-300',
                    isPast ? 'bg-[var(--color-primary)]' : 'bg-slate-200',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact indicator */}
      <div className="flex sm:hidden items-center justify-between px-1">
        <span className="text-sm font-medium text-slate-700">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="text-sm text-slate-500">
          {STEPS.find((s) => s.number === currentStep)?.label}
        </span>
      </div>

      {/* Mobile: progress bar */}
      <div className="sm:hidden mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
