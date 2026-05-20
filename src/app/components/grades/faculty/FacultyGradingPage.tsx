import { useState } from 'react';
import { useFacultyGradeEncoding, type FacultyGradeRow } from '@/lib/hooks/grades/useFacultyGradeEncoding';
import { GradeStatusBadge } from '../components/GradeStatusBadge';
import { RemarksBadge } from '../components/RemarksBadge';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { instructors } from '@/lib/data/attendance/instructors';
import { subjects } from '@/lib/data/enrollment/subjects';
import { classOfferings } from '@/lib/data/attendance/class-offerings';
import { Save, Send, Lock, CheckCheck, AlertTriangle } from 'lucide-react';

// Demo instructor selector — defaults to Dr. Ana Reyes (inst-2) who has two classes
const DEMO_INSTRUCTORS = instructors.map((i) => ({ id: i.id, name: i.name }));

function getSubjectForClass(classId: string) {
  const offering = classOfferings.find((o) => o.id === classId);
  return subjects.find((s) => s.id === offering?.subjectId);
}

interface GradeInputProps {
  value: number | null;
  onChange: (v: number | null) => void;
  disabled: boolean;
  error?: string | null;
}

function GradeInput({ value, onChange, disabled, error }: GradeInputProps) {
  if (disabled) {
    return (
      <span className="font-mono tabular-nums text-muted-foreground">
        {value !== null ? value.toFixed(1) : '—'}
      </span>
    );
  }
  return (
    <div className="min-w-[70px]">
      <input
        type="number"
        min={0}
        max={100}
        step={0.5}
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value === '' ? null : Number(e.target.value);
          onChange(v);
        }}
        className={cn(
          'w-full rounded border px-2 py-1 text-center text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500',
          error ? 'border-red-400 bg-red-50' : 'border-border bg-background',
        )}
        placeholder="—"
      />
      {error && <p className="mt-0.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function OverallDisplay({ row }: { row: FacultyGradeRow }) {
  const { overall, gradePoint, remarks } = row.computed;
  if (overall === null) return <span className="text-muted-foreground">—</span>;
  const color = gradePoint === 5.0 ? 'text-red-600' : (gradePoint ?? 5) <= 1.75 ? 'text-green-600' : 'text-foreground';
  return (
    <div className={cn('text-center', color)}>
      <p className="font-mono font-semibold tabular-nums">{overall.toFixed(1)}</p>
      <p className="text-xs opacity-70">{gradePoint?.toFixed(2)}</p>
    </div>
  );
}

interface RowActionsProps {
  row: FacultyGradeRow;
  onSave: () => void;
  onSubmit: () => void;
  onFinalize: () => void;
}

function RowActions({ row, onSave, onSubmit, onFinalize }: RowActionsProps) {
  const effectiveStatus = row.status;

  if (effectiveStatus === 'finalized') {
    return (
      <div className="flex items-center gap-1 text-muted-foreground text-xs">
        <Lock className="h-3 w-3" />
        <span>Locked</span>
      </div>
    );
  }

  if (effectiveStatus === 'submitted') {
    return (
      <Button size="sm" variant="default" onClick={onFinalize} className="h-7 text-xs">
        <Lock className="mr-1 h-3 w-3" />
        Finalize
      </Button>
    );
  }

  // draft
  return (
    <div className="flex gap-1">
      {row.isDirty && (
        <Button size="sm" variant="outline" onClick={onSave} className="h-7 text-xs">
          <Save className="mr-1 h-3 w-3" />
          Save
        </Button>
      )}
      <Button
        size="sm"
        variant="secondary"
        onClick={onSubmit}
        disabled={row.localEdit.final === null}
        className="h-7 text-xs"
        title={row.localEdit.final === null ? 'Enter final grade first' : undefined}
      >
        <Send className="mr-1 h-3 w-3" />
        Submit
      </Button>
    </div>
  );
}

export default function FacultyGradingPage() {
  const [instructorId, setInstructorId] = useState('inst-2');

  const encoding = useFacultyGradeEncoding(instructorId);

  const selectedSubject = getSubjectForClass(encoding.selectedClassId);

  const draftCount = encoding.rows.filter((r) => r.status === 'draft').length;
  const submittedCount = encoding.rows.filter((r) => r.status === 'submitted').length;
  const finalizedCount = encoding.rows.filter((r) => r.status === 'finalized').length;
  const canSubmitAll = draftCount > 0 && encoding.rows.some((r) => r.status === 'draft' && r.localEdit.final !== null);
  const canFinalizeAll = submittedCount > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold tracking-tight">Grade Encoding</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Enter, submit, and finalize student grades for your assigned classes.
          </p>
        </div>

        {/* Demo instructor selector */}
        <div className="mb-6 rounded-xl border bg-amber-50 border-amber-200 p-4">
          <p className="mb-2 text-sm font-medium text-amber-800">Demo Mode — Simulated Instructor</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_INSTRUCTORS.map((inst) => {
              const hasClasses = classOfferings.some((o) => o.instructorId === inst.id);
              return (
                <button
                  key={inst.id}
                  onClick={() => setInstructorId(inst.id)}
                  disabled={!hasClasses}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    instructorId === inst.id
                      ? 'border-amber-500 bg-amber-100 text-amber-800'
                      : hasClasses
                        ? 'border-border bg-background hover:bg-accent'
                        : 'border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed',
                  )}
                >
                  {inst.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Class tabs */}
        {encoding.instructorClasses.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground shadow-sm">
            No classes assigned to this instructor.
          </div>
        ) : (
          <>
            <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 shadow-sm">
              {encoding.instructorClasses.map((cls) => {
                const sub = getSubjectForClass(cls.id);
                return (
                  <button
                    key={cls.id}
                    onClick={() => encoding.setSelectedClassId(cls.id)}
                    className={cn(
                      'flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                      encoding.selectedClassId === cls.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {sub?.code ?? cls.id}
                    <span className="ml-1 opacity-70">({cls.sectionCode})</span>
                  </button>
                );
              })}
            </div>

            {/* Class info + stats */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">
                  {selectedSubject?.code} — {selectedSubject?.title}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {encoding.instructorClasses.find((c) => c.id === encoding.selectedClassId)?.sectionCode}
                  {' · '}
                  {encoding.rows.length} students
                </p>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  <span className="font-bold">{draftCount}</span> Draft
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                  <span className="font-bold">{submittedCount}</span> Submitted
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                  <span className="font-bold">{finalizedCount}</span> Finalized
                </span>
              </div>
            </div>

            {/* Bulk actions */}
            {(canSubmitAll || canFinalizeAll) && (
              <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-dashed p-3">
                <p className="w-full text-xs text-muted-foreground font-medium mb-1">Bulk Actions</p>
                {canSubmitAll && (
                  <Button variant="secondary" size="sm" onClick={encoding.submitAll}>
                    <Send className="mr-2 h-3.5 w-3.5" />
                    Submit All Drafts
                  </Button>
                )}
                {canFinalizeAll && (
                  <Button variant="default" size="sm" onClick={encoding.finalizeAll}>
                    <CheckCheck className="mr-2 h-3.5 w-3.5" />
                    Finalize All Submitted
                  </Button>
                )}
              </div>
            )}

            {/* Grading weights info */}
            <div className="mb-4 rounded-xl border bg-blue-50 border-blue-200 p-3 text-xs text-blue-800">
              <span className="font-semibold">Grading Weights: </span>
              Prelim 30% · Midterm 30% · Final 40% · Passing Grade: 75
            </div>

            {/* Grade table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {encoding.rows.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  No students enrolled in this class.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Prelim <span className="opacity-60">(30%)</span></th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Midterm <span className="opacity-60">(30%)</span></th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Final <span className="opacity-60">(40%)</span></th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Overall</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Remarks</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {encoding.rows.map((row) => {
                        const isLocked = row.status === 'finalized';
                        const isSubmitted = row.status === 'submitted';
                        const isDisabled = isLocked || isSubmitted;

                        return (
                          <tr
                            key={row.id}
                            className={cn(
                              'transition-colors',
                              isLocked ? 'bg-muted/30' : 'hover:bg-muted/20',
                              row.computed.remarks === 'Failed' && !isLocked && 'bg-red-50/40',
                              row.isDirty && 'bg-yellow-50/40',
                            )}
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium">{row.studentName}</p>
                              <p className="text-muted-foreground text-xs">{row.studentNumber}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <GradeInput
                                value={row.localEdit.prelim}
                                disabled={isDisabled}
                                error={encoding.validateGrade(row.localEdit.prelim)}
                                onChange={(v) => encoding.updateLocal(row.id, 'prelim', v)}
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <GradeInput
                                value={row.localEdit.midterm}
                                disabled={isDisabled}
                                error={encoding.validateGrade(row.localEdit.midterm)}
                                onChange={(v) => encoding.updateLocal(row.id, 'midterm', v)}
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <GradeInput
                                value={row.localEdit.final}
                                disabled={isDisabled}
                                error={encoding.validateGrade(row.localEdit.final)}
                                onChange={(v) => encoding.updateLocal(row.id, 'final', v)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <OverallDisplay row={row} />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <RemarksBadge remarks={row.computed.remarks} size="sm" />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <GradeStatusBadge status={row.status} size="sm" />
                              {row.isDirty && (
                                <p className="text-xs text-yellow-600 mt-0.5 flex items-center justify-center gap-0.5">
                                  <AlertTriangle className="h-2.5 w-2.5" /> unsaved
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <RowActions
                                row={row}
                                onSave={() => encoding.saveDraft(row.id)}
                                onSubmit={() => encoding.submitGrade(row.id)}
                                onFinalize={() => encoding.finalizeGrade(row.id)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span><span className="font-semibold text-gray-700">Draft</span> — saved, not yet submitted</span>
              <span><span className="font-semibold text-blue-700">Submitted</span> — awaiting finalization</span>
              <span><span className="font-semibold text-green-700">Finalized</span> — locked, visible to students</span>
              <span className="text-yellow-700 font-medium">Yellow row</span><span>= unsaved changes</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
