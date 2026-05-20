import { useCallback, useMemo } from 'react';
import type { EvalStatus } from '../../types/evaluation';
import { evalRecords, getEvalRecord } from '../../data/evaluation/eval-records';
import { classOfferings } from '../../data/attendance/class-offerings';

export interface ClassEvalStatus {
  classId: string;
  status: 'not-started' | 'draft' | 'submitted';
  record: ReturnType<typeof getEvalRecord>;
}

export function useEvaluationValidation(studentId: string) {
  const enrolledClasses = useMemo(
    () => classOfferings.filter((o) => o.enrolledStudentIds.includes(studentId)),
    [studentId],
  );

  const getClassStatus = useCallback(
    (classId: string): ClassEvalStatus['status'] => {
      const record = getEvalRecord(studentId, classId);
      if (!record) return 'not-started';
      return record.status === 'submitted' ? 'submitted' : 'draft';
    },
    [studentId],
  );

  const canEvaluate = useCallback(
    (classId: string): { can: boolean; reason?: string } => {
      const isEnrolled = enrolledClasses.some((o) => o.id === classId);
      if (!isEnrolled) return { can: false, reason: 'Not enrolled in this class.' };

      const record = getEvalRecord(studentId, classId);
      if (record?.status === 'submitted') {
        return { can: false, reason: 'Evaluation already submitted and cannot be changed.' };
      }
      return { can: true };
    },
    [studentId, enrolledClasses],
  );

  const classStatuses = useMemo((): ClassEvalStatus[] =>
    enrolledClasses.map((cls) => ({
      classId: cls.id,
      status: getClassStatus(cls.id),
      record: getEvalRecord(studentId, cls.id),
    })),
    [enrolledClasses, getClassStatus, studentId],
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
