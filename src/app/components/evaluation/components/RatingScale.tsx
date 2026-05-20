import { cn } from '@/app/components/ui/utils';
import { evalSettings } from '@/lib/data/evaluation/eval-settings';

interface Props {
  questionId: string;
  value: number | undefined;
  onChange: (value: number) => void;
  disabled?: boolean;
  required?: boolean;
}

export function RatingScale({ value, onChange, disabled, required }: Props) {
  const scale = evalSettings.ratingScale;
  const labels = evalSettings.ratingLabels;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: scale }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            title={labels[n]}
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all',
              disabled && 'cursor-default',
              !disabled && 'hover:scale-105 hover:shadow-sm',
              value === n
                ? n <= 2
                  ? 'border-red-400 bg-red-500 text-white shadow-sm'
                  : n === 3
                    ? 'border-yellow-400 bg-yellow-500 text-white shadow-sm'
                    : 'border-green-500 bg-green-500 text-white shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-accent',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between px-0.5">
        <span className="text-xs text-muted-foreground">{labels[1]}</span>
        <span className="text-xs text-muted-foreground">{labels[scale]}</span>
      </div>
      {required && value === undefined && (
        <p className="text-xs text-red-500">* Required</p>
      )}
    </div>
  );
}
