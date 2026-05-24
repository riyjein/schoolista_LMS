import { Award, AlertCircle } from 'lucide-react';
import { DLQualification } from '../../../../lib/types/grades';
import { cn } from '../../../../lib/utils';

const BADGE_CONFIG: Record<Exclude<DLQualification['badge'], 'none'>, { label: string; className: string }> = {
  summa:      { label: "Summa Cum Laude",  className: 'bg-yellow-50 border-yellow-400 text-yellow-800' },
  magna:      { label: "Magna Cum Laude",  className: 'bg-blue-50 border-blue-400 text-blue-800' },
  'cum-laude':{ label: "Cum Laude",        className: 'bg-green-50 border-green-400 text-green-800' },
};

interface Props {
  qualification: DLQualification;
  showDisqualifiers?: boolean;
}
  
export function DLBadge({ qualification, showDisqualifiers = false }: Props) {
  if (qualification.qualified && qualification.badge !== 'none') {
    const { label, className } = BADGE_CONFIG[qualification.badge];
    return (
      <div className={cn('inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2', className)}>
        <Award className="h-5 w-5" />
        <div>
          <p className="font-semibold">{label}</p>
          {qualification.gpa !== null && (
            <p className="text-xs opacity-80">GPA {qualification.gpa.toFixed(3)}</p>
          )}
        </div>
      </div>
    );
  }

  if (!showDisqualifiers) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border-2 border-muted bg-muted px-4 py-2 text-muted-foreground">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Not qualified for Dean's List</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-orange-800">
        <AlertCircle className="h-4 w-4" />
        <p className="font-semibold">Not Qualified for Dean's List</p>
      </div>
      <ul className="space-y-1">
        {qualification.disqualifiers.map((d, i) => (
          <li key={i} className="text-sm text-orange-700">• {d}</li>
        ))}
      </ul>
    </div>
  );
}
