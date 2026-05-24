import { AlertTriangle, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import type { UnitComputationResult } from '@/lib/hooks/useUnitComputation';
import { MIN_UNITS, MAX_UNITS } from '@/lib/types/enrollment';

interface UnitCounterProps {
  computation: UnitComputationResult;
  compact?: boolean;
}

export function UnitCounter({ computation, compact = false }: UnitCounterProps) {
  const { totalUnits, isValid, isOverload, isUnderload, percentFilled } = computation;

  const barColor =
    isOverload ? 'bg-red-500' :
    isUnderload && totalUnits > 0 ? 'bg-amber-400' :
    isValid ? 'bg-emerald-500' :
    'bg-slate-300';

  const StatusIcon = isOverload ? XCircle : isValid ? CheckCircle2 : AlertTriangle;
  const statusColor = isOverload ? 'text-red-500' : isValid ? 'text-emerald-500' : 'text-amber-500';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${percentFilled}%` }}
          />
        </div>
        <span className={cn('text-xs font-semibold tabular-nums', statusColor)}>
          {totalUnits}/{MAX_UNITS}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('w-5 h-5', statusColor)} />
          <span className="font-semibold text-slate-800">Total Units</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-3xl font-bold tabular-nums', statusColor)}>
            {totalUnits}
          </span>
          <span className="text-sm text-slate-400">/ {MAX_UNITS}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percentFilled}%` }}
        />
        {/* Min marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400/50"
          style={{ left: `${(MIN_UNITS / MAX_UNITS) * 100}%` }}
        />
      </div>

      {/* Min/max labels */}
      <div className="flex justify-between text-[11px] text-slate-400">
        <span>0</span>
        <span className="text-slate-500">Min: {MIN_UNITS}</span>
        <span>{MAX_UNITS} max</span>
      </div>

      {/* Warnings */}
      {computation.warnings.length > 0 && (
        <div className="space-y-1.5">
          {computation.warnings.map((warning, i) => (
            <div
              key={i}
              className={cn(
                'flex items-start gap-2 p-2.5 rounded-lg text-xs',
                isOverload ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200',
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: 'Lecture', value: computation.lecUnits, unit: 'lec' },
          { label: 'Lab', value: computation.labUnits, unit: 'lab' },
          { label: 'Selected', value: computation.totalUnits, unit: 'total' },
        ].map((item) => (
          <div key={item.label} className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-700">{item.value}</div>
            <div className="text-[10px] text-slate-400">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
