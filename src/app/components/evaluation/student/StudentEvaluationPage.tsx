import { useState, useCallback } from 'react';
import { useEvaluationValidation } from '@/lib/hooks/evaluation/useEvaluationValidation';
import { useEvaluationForm } from '@/lib/hooks/evaluation/useEvaluationForm';
import { useEvaluationSubmission } from '@/lib/hooks/evaluation/useEvaluationSubmission';
import { EvalStatusBadge } from '../components/EvalStatusBadge';
import { RatingScale } from '../components/RatingScale';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/app/components/ui/dialog';
import { classOfferings } from '@/lib/data/attendance/class-offerings';
import { subjects } from '@/lib/data/enrollment/subjects';
import { instructors } from '@/lib/data/attendance/instructors';
import { evalCategories } from '@/lib/data/evaluation/eval-settings';
import { evalQuestions, getQuestionsByCategory } from '@/lib/data/evaluation/eval-questions';
import type { EvalAnswer } from '@/lib/types/evaluation';
import { getEvalRecord } from '@/lib/data/evaluation/eval-records';
import {
  BookOpen, CheckCircle2, PenLine, ChevronRight, Save, Send, Loader2,
} from 'lucide-react';

const STUDENT_ID = 'student-1';
const STUDENT_NAME = 'Maria Santos';

interface FormDialogProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitDone: () => void;
}

function EvalFormDialog({ classId, isOpen, onClose, onSubmitDone }: FormDialogProps) {
  const offering = classOfferings.find((o) => o.id === classId);
  const subject = subjects.find((s) => s.id === offering?.subjectId);
  const instructor = instructors.find((i) => i.id === offering?.instructorId);

  const existingRecord = getEvalRecord(STUDENT_ID, classId);
  const isSubmitted = existingRecord?.status === 'submitted';

  const form = useEvaluationForm(existingRecord?.answers ?? []);
  const submission = useEvaluationSubmission(STUDENT_ID);
  const [done, setDone] = useState(false);

  const handleSaveDraft = useCallback(() => {
    submission.saveDraft(classId, form.toAnswers());
  }, [classId, submission, form]);

  const handleSubmit = useCallback(async () => {
    await submission.submit(classId, form.toAnswers());
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); onSubmitDone(); }, 1500);
  }, [classId, submission, form, onClose, onSubmitDone]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Faculty Evaluation</DialogTitle>
          <DialogDescription>
            {instructor?.name} · {subject?.code} — {subject?.title} · {offering?.sectionCode}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="font-semibold">Evaluation submitted!</p>
            <p className="text-muted-foreground text-sm">Thank you for your feedback.</p>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="flex-shrink-0 space-y-1 px-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{form.answeredCount} of {form.requiredCount} required questions answered</span>
                <span>{form.progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${form.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-1 py-2 space-y-6">
              {evalCategories.map((cat) => {
                const catQuestions = getQuestionsByCategory(cat.id);
                const prog = form.categoryProgress.find((p) => p.categoryId === cat.id);
                const catComplete = prog ? prog.answered === prog.total : false;

                return (
                  <div key={cat.id} className="rounded-xl border overflow-hidden">
                    {/* Category header */}
                    <div className={cn('flex items-center justify-between px-4 py-3 border-b', catComplete ? 'bg-green-50' : 'bg-muted/40')}>
                      <div className="flex items-center gap-2">
                        <span className={cn('h-3 w-3 rounded-full', cat.color)} />
                        <div>
                          <p className="font-semibold text-sm">{cat.label}</p>
                          <p className="text-muted-foreground text-xs">{cat.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{prog?.answered}/{prog?.total}</span>
                        {catComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        <span className="text-xs font-medium text-muted-foreground">{Math.round(cat.weight * 100)}%</span>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="p-4 space-y-5">
                      {catQuestions.map((q) => (
                        <div key={q.id}>
                          <p className={cn('mb-2 text-sm', q.required && 'font-medium')}>
                            {q.required && <span className="text-red-500 mr-1">*</span>}
                            {q.text}
                          </p>
                          {q.type === 'rating' ? (
                            <RatingScale
                              questionId={q.id}
                              value={form.getAnswer(q.id) as number | undefined}
                              onChange={(v) => form.setRating(q.id, v)}
                              disabled={isSubmitted}
                              required={q.required}
                            />
                          ) : (
                            <textarea
                              rows={2}
                              placeholder="Optional comments…"
                              disabled={isSubmitted}
                              value={(form.getAnswer(q.id) as string) ?? ''}
                              onChange={(e) => form.setComment(q.id, e.target.value)}
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-60"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <DialogFooter className="flex-shrink-0 gap-2 pt-2 border-t">
              {isSubmitted ? (
                <p className="text-sm text-green-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Already submitted — read only
                </p>
              ) : (
                <>
                  <Button variant="outline" onClick={handleSaveDraft} disabled={!form.isDirty || submission.isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleSubmit} disabled={!form.isComplete || submission.isSubmitting}>
                    {submission.isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> Submit Evaluation</>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function StudentEvaluationPage() {
  const validation = useEvaluationValidation(STUDENT_ID);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmitDone = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold tracking-tight">Faculty Evaluation</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {STUDENT_NAME} · 2024-2025 1st Semester · Evaluate your instructors for each enrolled class.
          </p>
        </div>

        {/* Progress summary */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Pending', value: validation.pendingCount, color: 'text-muted-foreground' },
            { label: 'In Draft', value: validation.draftCount, color: 'text-yellow-600' },
            { label: 'Submitted', value: validation.submittedCount, color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm text-center">
              <p className={cn('text-3xl font-bold', s.color)}>{s.value}</p>
              <p className="text-muted-foreground text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">Overall Completion</span>
            <span className="text-muted-foreground">
              {validation.submittedCount} / {validation.totalClasses} submitted
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${Math.round((validation.submittedCount / validation.totalClasses) * 100)}%` }}
            />
          </div>
        </div>

        {/* Class evaluation cards */}
        <div className="space-y-3">
          {validation.classStatuses.map(({ classId, status }) => {
            const offering = classOfferings.find((o) => o.id === classId);
            const subject = subjects.find((s) => s.id === offering?.subjectId);
            const instructor = instructors.find((i) => i.id === offering?.instructorId);
            const { can } = validation.canEvaluate(classId);

            return (
              <div
                key={classId}
                className={cn(
                  'rounded-xl border bg-card p-5 shadow-sm transition-all',
                  status === 'submitted' ? 'border-green-200 bg-green-50/30' : '',
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="font-semibold">{subject?.code} — {subject?.title}</p>
                    </div>
                    <p className="text-muted-foreground text-sm">{instructor?.name}</p>
                    <p className="text-muted-foreground text-xs">{offering?.sectionCode} · {offering?.room}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <EvalStatusBadge status={status} size="sm" />
                    <Button
                      size="sm"
                      variant={status === 'submitted' ? 'outline' : status === 'draft' ? 'secondary' : 'default'}
                      onClick={() => setSelectedClassId(classId)}
                      className="min-w-[120px]"
                    >
                      {status === 'submitted' ? (
                        <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> View</>
                      ) : status === 'draft' ? (
                        <><PenLine className="mr-1.5 h-3.5 w-3.5" /> Continue</>
                      ) : (
                        <><ChevronRight className="mr-1.5 h-3.5 w-3.5" /> Evaluate</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Draft progress bar */}
                {status === 'draft' && (() => {
                  const record = getEvalRecord(STUDENT_ID, classId);
                  const ratingQs = evalQuestions.filter((q) => q.type === 'rating' && q.required);
                  const answered = record?.answers.filter((a) =>
                    ratingQs.some((q) => q.id === a.questionId && a.rating !== undefined)
                  ).length ?? 0;
                  const pct = Math.round((answered / ratingQs.length) * 100);
                  return (
                    <div className="mt-3 pt-3 border-t space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Draft progress</span>
                        <span>{answered}/{ratingQs.length} questions</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-yellow-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Evaluations are used to improve faculty performance. All responses are aggregated anonymously.
        </p>
      </div>

      {/* Evaluation form dialog */}
      {selectedClassId && (
        <EvalFormDialog
          key={`${selectedClassId}-${refreshKey}`}
          classId={selectedClassId}
          isOpen={!!selectedClassId}
          onClose={() => setSelectedClassId(null)}
          onSubmitDone={handleSubmitDone}
        />
      )}
    </div>
  );
}
