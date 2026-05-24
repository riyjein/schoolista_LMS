import { useState, useCallback } from 'react';
import type { EvalAnswer, EvalRecord } from '../../types/evaluation';
import {
  getEvalRecord,
  addEvalRecord,
  updateEvalRecord,
} from '../../data/evaluation/eval-records';
import { classOfferings } from '../../data/attendance/class-offerings';
import { insertRow } from '../../supabase/queries';

function persistAnswers(evaluationRecordId: string, answers: EvalAnswer[]): void {
  // Supabase CRUD goes here: replace the answer rows for this evaluation record.
  void Promise.all(
    answers.map((answer) =>
      insertRow('evaluation_answers', {
        evaluation_record_id: evaluationRecordId,
        question_id: answer.questionId,
        rating: answer.rating ?? null,
        comment: answer.comment ?? null,
      }),
    ),
  );
}

export function useEvaluationSubmission(studentId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<'draft' | 'submitted' | null>(null);

  const saveDraft = useCallback(
    (classId: string, answers: EvalAnswer[]): void => {
      const existing = getEvalRecord(studentId, classId);

      if (existing) {
        if (existing.status === 'submitted') return;
        updateEvalRecord(existing.id, { answers });
        persistAnswers(existing.id, answers);
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
        void insertRow('evaluation_records', {
          id: `eval-${classId}-${studentId}-draft`,
          student_id: studentId,
          class_id: classId,
          instructor_id: offering?.instructorId ?? '',
          subject_id: offering?.subjectId ?? '',
          section_code: offering?.sectionCode ?? '',
          semester: '1st',
          school_year: '2024-2025',
          status: 'draft',
          submitted_at: null,
        });
        persistAnswers(`eval-${classId}-${studentId}-draft`, answers);
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
        persistAnswers(existing.id, answers);
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
        void insertRow('evaluation_records', {
          id: `eval-${classId}-${studentId}`,
          student_id: studentId,
          class_id: classId,
          instructor_id: offering?.instructorId ?? '',
          subject_id: offering?.subjectId ?? '',
          section_code: offering?.sectionCode ?? '',
          semester: '1st',
          school_year: '2024-2025',
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        });
        persistAnswers(`eval-${classId}-${studentId}`, answers);
      }

      setIsSubmitting(false);
      setLastAction('submitted');
    },
    [studentId],
  );

  return { saveDraft, submit, isSubmitting, lastAction };
}
