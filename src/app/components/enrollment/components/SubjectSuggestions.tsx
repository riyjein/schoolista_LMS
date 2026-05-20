import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/components/ui/utils';
import type { EnrichedSubject, EnrollmentStrategy } from '@/lib/types/enrollment';

const STRATEGY_LABELS: Record<EnrollmentStrategy, string> = {
  'major-priority':  'Major Priority',
  'minor-priority':  'Minor Priority',
  'balanced':        'Balanced',
};

const STRATEGY_DESC: Record<EnrollmentStrategy, string> = {
  'major-priority':  'Fills major subjects first',
  'minor-priority':  'Fills minor/GE subjects first',
  'balanced':        'Mixes all types evenly',
};

interface SubjectSuggestionsProps {
  suggestions: EnrichedSubject[];
  strategy: EnrollmentStrategy;
  onStrategyChange: (s: EnrollmentStrategy) => void;
  onApply: (ids: string[]) => void;
  totalSuggestedUnits: number;
}

export function SubjectSuggestions({
  suggestions,
  strategy,
  onStrategyChange,
  onApply,
  totalSuggestedUnits,
}: SubjectSuggestionsProps) {
  const strategies: EnrollmentStrategy[] = ['balanced', 'major-priority', 'minor-priority'];

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-slate-800">Smart Suggestions</span>
          <Badge className="bg-amber-500 text-white text-xs">{suggestions.length} subjects</Badge>
        </div>
        <span className="text-xs text-slate-500">{totalSuggestedUnits} units</span>
      </div>

      {/* Strategy selector */}
      <div className="flex gap-2 flex-wrap">
        {strategies.map((s) => (
          <button
            key={s}
            onClick={() => onStrategyChange(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              strategy === s
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300',
            )}
          >
            {STRATEGY_LABELS[s]}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">{STRATEGY_DESC[strategy]}</p>

      {/* Subject chips */}
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-amber-200 text-xs"
            >
              <span className="font-mono text-[10px] text-slate-400">{subject.code}</span>
              <span className="text-slate-700 truncate max-w-[120px]">{subject.title}</span>
              <span className="text-amber-600 font-medium">{subject.units}u</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">
          No additional subjects available for this strategy. Try a different strategy or adjust completed subjects.
        </p>
      )}

      {suggestions.length > 0 && (
        <Button
          size="sm"
          onClick={() => onApply(suggestions.map((s) => s.id))}
          className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 w-full"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Apply Suggestions ({totalSuggestedUnits} units)
        </Button>
      )}
    </div>
  );
}
