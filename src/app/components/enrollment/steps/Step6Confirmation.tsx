import { CheckCircle2, Download, Printer, RotateCcw, GraduationCap, BookOpen, CalendarDays, Hash } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { cn } from '@/app/components/ui/utils';
import type { EnrollmentRecord, Subject, TuitionBreakdown } from '@/lib/types/enrollment';

const TYPE_COLORS: Record<string, string> = {
  major:    'bg-blue-100 text-blue-700',
  minor:    'bg-purple-100 text-purple-700',
  GE:       'bg-green-100 text-green-700',
  elective: 'bg-amber-100 text-amber-700',
  PE:       'bg-orange-100 text-orange-700',
  NSTP:     'bg-teal-100 text-teal-700',
};

interface Step6Props {
  enrollmentRecord: EnrollmentRecord;
  selectedSubjects: Subject[];
  tuitionBreakdown: TuitionBreakdown;
  courseCode: string;
  courseName: string;
  onReset: () => void;
}

export function Step6Confirmation({
  enrollmentRecord,
  selectedSubjects,
  tuitionBreakdown,
  courseCode,
  courseName,
  onReset,
}: Step6Props) {
  const formatPeso = (v: number) =>
    `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const yearLabel =
    enrollmentRecord.yearLevel === 1 ? '1st' :
    enrollmentRecord.yearLevel === 2 ? '2nd' :
    enrollmentRecord.yearLevel === 3 ? '3rd' : '4th';

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const content = [
      '='.repeat(60),
      'ENROLLMENT CONFIRMATION RECEIPT',
      '='.repeat(60),
      `Reference No: ${enrollmentRecord.referenceNumber}`,
      `Date: ${new Date(enrollmentRecord.submittedAt).toLocaleDateString('en-PH', { dateStyle: 'long' })}`,
      `Status: SUBMITTED`,
      '',
      'STUDENT ENROLLMENT DETAILS',
      '-'.repeat(40),
      `Program: ${courseCode} — ${courseName}`,
      `Year Level: ${yearLabel} Year`,
      `Semester: ${enrollmentRecord.semester} Semester`,
      `School Year: ${enrollmentRecord.schoolYear}`,
      '',
      'ENROLLED SUBJECTS',
      '-'.repeat(40),
      ...selectedSubjects.map((s) => `  ${s.code.padEnd(12)} ${s.title.padEnd(40)} ${s.units}u`),
      '',
      `Total Units: ${tuitionBreakdown.totalUnits}`,
      '',
      'FEE BREAKDOWN',
      '-'.repeat(40),
      `  Lecture Fee (${tuitionBreakdown.lecUnits} units): ${formatPeso(tuitionBreakdown.lectureFee)}`,
      `  Lab Fee (${tuitionBreakdown.labUnits} units):     ${formatPeso(tuitionBreakdown.laboratoryFee)}`,
      `  Miscellaneous:                  ${formatPeso(tuitionBreakdown.miscTotal)}`,
      '-'.repeat(40),
      `  ESTIMATED TOTAL:               ${formatPeso(tuitionBreakdown.grandTotal)}`,
      '',
      '='.repeat(60),
      'This is a system-generated confirmation. Present this',
      'at the Registrar\'s Office for final verification.',
      '='.repeat(60),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollment-${enrollmentRecord.referenceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div>
          <h2 className="font-bold text-2xl text-slate-800">Enrollment Submitted!</h2>
          <p className="text-slate-500 mt-2">
            Your enrollment request has been submitted successfully and is pending registrar verification.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-full">
          <Hash className="w-4 h-4 text-slate-500" />
          <span className="font-mono font-semibold text-slate-700 text-sm">
            {enrollmentRecord.referenceNumber}
          </span>
          <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Pending Verification</Badge>
        </div>
      </div>

      {/* Receipt card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden print:border-0 print:shadow-none">
        {/* Receipt header */}
        <div className="p-6 bg-gradient-to-r from-[var(--color-primary)] to-blue-700 text-white">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-7 h-7" />
            <div>
              <p className="font-bold">School Integrated Management System</p>
              <p className="text-blue-200 text-sm">Enrollment Confirmation</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wider">Reference No.</p>
              <p className="font-mono font-semibold">{enrollmentRecord.referenceNumber}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wider">Date Submitted</p>
              <p className="font-semibold">
                {new Date(enrollmentRecord.submittedAt).toLocaleDateString('en-PH', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Enrollment details */}
        <div className="p-5 border-b border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <GraduationCap className="w-4 h-4" />, label: 'Program', value: courseCode },
              { icon: <BookOpen className="w-4 h-4" />, label: 'Year', value: `${yearLabel} Year` },
              { icon: <CalendarDays className="w-4 h-4" />, label: 'Semester', value: `${enrollmentRecord.semester} Sem` },
              { icon: <CalendarDays className="w-4 h-4" />, label: 'SY', value: enrollmentRecord.schoolYear },
            ].map((item) => (
              <div key={item.label} className="text-center p-2.5 bg-slate-50 rounded-xl">
                <div className="flex justify-center text-slate-400 mb-1">{item.icon}</div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subject list */}
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
            Enrolled Subjects
          </h3>
          <div className="space-y-2">
            {selectedSubjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{subject.code}</span>
                    <Badge
                      variant="outline"
                      className={cn('text-[9px] px-1.5 py-0 h-4 border-0', TYPE_COLORS[subject.type])}
                    >
                      {subject.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-800 mt-0.5">{subject.title}</p>
                </div>
                <span className="text-sm font-semibold text-slate-600 shrink-0">{subject.units}u</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee summary */}
        <div className="p-5">
          <h3 className="font-semibold text-slate-700 mb-3">Fee Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Lecture ({tuitionBreakdown.lecUnits} units)</span>
              <span>{formatPeso(tuitionBreakdown.lectureFee)}</span>
            </div>
            {tuitionBreakdown.labUnits > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Lab ({tuitionBreakdown.labUnits} units)</span>
                <span>{formatPeso(tuitionBreakdown.laboratoryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Miscellaneous</span>
              <span>{formatPeso(tuitionBreakdown.miscTotal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Estimated Total</span>
              <span className="text-[var(--color-primary)]">{formatPeso(tuitionBreakdown.grandTotal)}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-center">
            *Amount is estimated only. Final fees are subject to registrar validation.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Print Receipt
        </Button>
        <Button variant="outline" onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Download (.txt)
        </Button>
        <Button
          onClick={onReset}
          className="bg-[var(--color-primary)] hover:opacity-90 text-white gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Enrollment
        </Button>
      </div>
    </div>
  );
}
