import { useCallback, useMemo } from 'react';
import type { EvalStatus } from '../../types/evaluation';
import { evalRecords as fallbackEvalRecords, getEvalRecord } from '../../data/evaluation/eval-records';
import { classOfferings as fallbackClassOfferings } from '../../data/attendance/class-offerings';
import { useSupabaseTable } from '../../supabase/useSupabaseTable';

export interface ClassEvalStatus {
  classId: string;
  status: 'not-started' | 'draft' | 'submitted';
  record: ReturnType<typeof getEvalRecord>;
}

export function useEvaluationValidation(studentId: string) {
  const { data: evalRecords } = useSupabaseTable({
    table: 'evaluation_records_view',
    fallback: fallbackEvalRecords,
    orderBy: 'submitted_at',
  });
  const { data: classOfferings } = useSupabaseTable({
    table: 'class_offerings_view',
    fallback: fallbackClassOfferings,
    orderBy: 'id',
  });

  const enrolledClasses = useMemo(
    () => classOfferings.filter((o) => o.enrolledStudentIds.includes(studentId)),
    [studentId, classOfferings],
  );

  const getClassStatus = useCallback(
    (classId: string): ClassEvalStatus['status'] => {
      const record = evalRecords.find((r) => r.studentId === studentId && r.classId === classId);
      if (!record) return 'not-started';
      return record.status === 'submitted' ? 'submitted' : 'draft';
    },
    [studentId, evalRecords],
  );

  const canEvaluate = useCallback(
    (classId: string): { can: boolean; reason?: string } => {
      const isEnrolled = enrolledClasses.some((o) => o.id === classId);
      if (!isEnrolled) return { can: false, reason: 'Not enrolled in this class.' };

      const record = evalRecords.find((r) => r.studentId === studentId && r.classId === classId);
      if (record?.status === 'submitted') {
        return { can: false, reason: 'Evaluation already submitted and cannot be changed.' };
      }
      return { can: true };
    },
    [studentId, enrolledClasses, evalRecords],
  );

  const classStatuses = useMemo((): ClassEvalStatus[] =>
    enrolledClasses.map((cls) => ({
      classId: cls.id,
      status: getClassStatus(cls.id),
      record: evalRecords.find((r) => r.studentId === studentId && r.classId === cls.id),
    })),
    [enrolledClasses, getClassStatus, studentId, evalRecords],
  );

  const submittedCount = useMemo(
    () => classStatuses.filter((s) => s.status === 'submitted').length,
    [classStatuses],
  );

  const draftCount = useMemo(
    () => classStatuses.filter((s) => s.status === 'draft').length,
    [classStatuses],
  );

  const pendingCount = useMemo(
    () => classStatuses.filter((s) => s.status === 'not-started').length,
    [classStatuses],
  );

  return {
    enrolledClasses,
    classStatuses,
    getClassStatus,
    canEvaluate,
    submittedCount,
    draftCount,
    pendingCount,
    totalClasses: enrolledClasses.length,
  };
}
