import { BookOpen, FlaskConical, Receipt, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { cn } from '@/app/components/ui/utils';
import type { Subject } from '@/lib/types/enrollment';
import type { TuitionBreakdown } from '@/lib/types/enrollment';
import type { UnitComputationResult } from '@/lib/hooks/useUnitComputation';
import { UnitCounter } from '../components/UnitCounter';

const TYPE_COLORS: Record<string, string> = {
  major:    'bg-blue-100 text-blue-700',
  minor:    'bg-purple-100 text-purple-700',
  GE:       'bg-green-100 text-green-700',
  elective: 'bg-amber-100 text-amber-700',
  PE:       'bg-orange-100 text-orange-700',
  NSTP:     'bg-teal-100 text-teal-700',
};

interface Step4Props {
  selectedSubjects: Subject[];
  computation: UnitComputationResult;
  tuitionBreakdown: TuitionBreakdown;
  courseCode: string;
  yearLevel: number;
  semester: string;
  schoolYear: string;
  validationErrors: string[];
  onNext: () => void;
  onBack: () => void;
}

export function Step4EnrollmentSummary({
  selectedSubjects,
  computation,
  tuitionBreakdown,
  courseCode,
  yearLevel,
  semester,
  schoolYear,
  validationErrors,
  onNext,
  onBack,
}: Step4Props) {
  const [showMisc, setShowMisc] = useState(false);

  const formatPeso = (amount: number) =>
    `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const yearLabel = yearLevel === 1 ? '1st' : yearLevel === 2 ? '2nd' : yearLevel === 3 ? '3rd' : '4th';
  const canSubmit =
    selectedSubjects.length > 0 &&
    !computation.isOverload &&
    validationErrors.length === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-semibold text-slate-800">Enrollment Summary</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review your selected subjects and estimated fees before proceeding to payment.
        </p>
      </div>

      {/* Enrollment details banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Course', value: courseCode },
          { label: 'Year Level', value: `${yearLabel} Year` },
          { label: 'Semester', value: `${semester} Sem` },
          { label: 'School Year', value: schoolYear },
        ].map((item) => (
          <div key={item.label} className="p-3 bg-blue-50 rounded-xl text-center border border-blue-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">{item.label}</p>
            <p className="font-semibold text-slate-800 mt-0.5 text-sm">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Validation */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-red-700 text-sm">Enrollment Issues</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((err, i) => (
              <li key={i} className="text-sm text-red-600">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {canSubmit && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-700">
            Your enrollment looks good! Proceed to payment after reviewing your subjects and fees.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Subject list */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Selected Subjects</h3>
            <Badge variant="outline">{selectedSubjects.length} subjects</Badge>
          </div>
          <div className="divide-y divide-slate-50">
            {selectedSubjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-slate-400">{subject.code}</span>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] px-1.5 py-0 h-4 border-0', TYPE_COLORS[subject.type])}
                    >
                      {subject.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">{subject.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />{subject.lecUnits} lec
                    </span>
                    {subject.labUnits > 0 && (
                      <span className="flex items-center gap-1">
                        <FlaskConical className="w-3 h-3" />{subject.labUnits} lab
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 shrink-0">
                  {subject.units}u
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {/* Units */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h3 className="font-semibold text-slate-800 mb-3">Unit Summary</h3>
            <UnitCounter computation={computation} />
          </div>

          {/* Tuition */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-slate-800">Fee Breakdown</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Lecture Fee ({tuitionBreakdown.lecUnits} lec units)</span>
                <span className="font-medium">{formatPeso(tuitionBreakdown.lectureFee)}</span>
              </div>
              {tuitionBreakdown.labUnits > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Lab Fee ({tuitionBreakdown.labUnits} lab units)</span>
                  <span className="font-medium">{formatPeso(tuitionBreakdown.laboratoryFee)}</span>
                </div>
              )}

              {/* Misc fees */}
              <div>
                <button
                  onClick={() => setShowMisc((p) => !p)}
                  className="flex items-center justify-between w-full text-sm"
                >
                  <span className="text-slate-500">Miscellaneous Fees</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatPeso(tuitionBreakdown.miscTotal)}</span>
                    {showMisc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>
                {showMisc && (
                  <div className="mt-2 ml-2 space-y-1.5 text-xs text-slate-400">
                    {tuitionBreakdown.miscFees.map((fee) => (
                      <div key={fee.name} className="flex justify-between">
                        <span>{fee.name}</span>
                        <span>{formatPeso(fee.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold text-slate-800">Estimated Total</span>
                <span className="font-bold text-[var(--color-primary)] text-lg">
                  {formatPeso(tuitionBreakdown.grandTotal)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                *Estimated amount only. Final fees may vary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back to Subject Selection
        </Button>
        <Button
          onClick={onNext}
          disabled={!canSubmit}
          className="flex-1 bg-[var(--color-primary)] hover:opacity-90 text-white"
        >
          Proceed to Payment Upload
        </Button>
      </div>
    </div>
  );
}
