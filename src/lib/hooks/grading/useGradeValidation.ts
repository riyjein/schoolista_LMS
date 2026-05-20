import { useCallback } from 'react';
import { gradeRecords } from '../../data/grades/grades';
import { classOfferings } from '../../data/attendance/class-offerings';

export interface FieldValidation {
  prelim?: string;
  midterm?: string;
  final?: string;
}

export interface SubmitValidation {
  canSubmit: boolean;
  reason?: string;
}

export interface FinalizeValidation {
  canFinalize: boolean;
  reason?: string;
}

function validateRange(value: number | null): string | undefined {
  if (value === null) return undefined;
  if (isNaN(value)) return 'Must be a number';
  if (value < 0 || value > 100) return 'Grade must be 0–100';
  return undefined;
}

export function useGradeValidation(instructorId: string, classId: string) {
  const isAuthorized = useCallback((): boolean => {
    const offering = classOfferings.find((o) => o.id === classId);
    return offering?.instructorId === instructorId;
  }, [instructorId, classId]);

  const isStudentEnrolled = useCallback(
    (studentId: string): boolean => {
      const offering = classOfferings.find((o) => o.id === classId);
      return offering?.enrolledStudentIds.includes(studentId) ?? false;
    },
    [classId],
  );

  const validateFields = useCallback(
    (prelim: number | null, midterm: number | null, final: number | null): FieldValidation => {
      const errors: FieldValidation = {};
      const p = validateRange(prelim);
      const m = validateRange(midterm);
      const f = validateRange(final);
      if (p) errors.prelim = p;
      if (m) errors.midterm = m;
      if (f) errors.final = f;
      return errors;
    },
    [],
  );

  const hasFieldErrors = useCallback(
    (errors: FieldValidation): boolean =>
      !!(errors.prelim || errors.midterm || errors.final),
    [],
  );

  const validateForSubmit = useCallback(
    (recordId: string, prelim: number | null, midterm: number | null, final: number | null): SubmitValidation => {
      const record = gradeRecords.find((r) => r.id === recordId);
      if (!record) return { canSubmit: false, reason: 'Record not found' };
      if (record.status === 'finalized') return { canSubmit: false, reason: 'Grade is already finalized' };
      if (!isStudentEnrolled(record.studentId)) return { canSubmit: false, reason: 'Student is not enrolled in this class' };
      if (prelim === null) return { canSubmit: false, reason: 'Prelim grade is required' };
      if (midterm === null) return { canSubmit: false, reason: 'Midterm grade is required' };
      if (final === null) return { canSubmit: false, reason: 'Final grade is required' };
      const fieldErrors = validateFields(prelim, midterm, final);
      if (hasFieldErrors(fieldErrors)) return { canSubmit: false, reason: 'One or more grades are out of range' };
      return { canSubmit: true };
    },
    [isStudentEnrolled, validateFields, hasFieldErrors],
  );

  const validateForFinalize = useCallback(
    (recordId: string): FinalizeValidation => {
      const record = gradeRecords.find((r) => r.id === recordId);
      if (!record) return { canFinalize: false, reason: 'Record not found' };
      if (record.status === 'finalized') return { canFinalize: false, reason: 'Already finalized' };
      if (record.status === 'draft') return { canFinalize: false, reason: 'Grades must be submitted before finalizing' };
      return { canFinalize: true };
    },
    [],
  );

  return {
    isAuthorized,
    isStudentEnrolled,
    validateFields,
    hasFieldErrors,
    validateForSubmit,
    validateForFinalize,
  };
}
