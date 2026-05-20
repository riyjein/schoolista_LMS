import { useState, useCallback } from 'react';
import type { EvalAnswer, EvalRecord } from '../../types/evaluation';
import {
  evalRecords,
  getEvalRecord,
  addEvalRecord,
  updateEvalRecord,
} from '../../data/evaluation/eval-records';
import { classOfferings } from '../../data/attendance/class-offerings';

export function useEvaluationSubmission(studentId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<'draft' | 'submitted' | null>(null);

  const saveDraft = useCallback(
    (classId: string, answers: EvalAnswer[]): void => {
      const existing = getEvalRecord(studentId, classId);

      if (existing) {
        if (existing.status === 'submitted') return;
        updateEvalRecord(existing.id, { answers });
      } else {
        const offering = classOfferings.find((o) => o.id === classId);
        addEvalRecord({
          id: `eval-${classId}-${studentId}-draft`,
          studentId,
          classId,
          instructorId: offering?.instructorId ?? '',
          subjectId: offering?.subjectId ?? '',
          sectionCode: offering?.sectionCode ?? '',
          semester: '1st',
          schoolYear: '2024-2025',
          status: 'draft',
          answers,
        });
      }
      setLastAction('draft');
    },
    [studentId],
  );

  const submit = useCallback(
    async (classId: string, answers: EvalAnswer[]): Promise<void> => {
      const existing = getEvalRecord(studentId, classId);
      if (existing?.status === 'submitted') return;

      setIsSubmitting(true);
      await new Promise((r) => setTimeout(r, 700));

      if (existing) {
        updateEvalRecord(existing.id, {
          answers,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        });
      } else {
        const offering = classOfferings.find((o) => o.id === classId);
        addEvalRecord({
          id: `eval-${classId}-${studentId}`,
          studentId,
          classId,
          instructorId: offering?.instructorId ?? '',
          subjectId: offering?.subjectId ?? '',
          sectionCode: offering?.sectionCode ?? '',
          semester: '1st',
          schoolYear: '2024-2025',
          status: 'submitted',
          answers,
          submittedAt: new Date().toISOString(),
        });
      }

      setIsSubmitting(false);
      setLastAction('submitted');
    },
    [studentId],
  );

  return { saveDraft, submit, isSubmitting, lastAction };
}
