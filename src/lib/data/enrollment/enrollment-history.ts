import type { EnrollmentRecord } from '../../types/enrollment';

export const enrollmentHistory: EnrollmentRecord[] = [
 
];

export const getEnrollmentHistoryForStudent = (studentId: string): EnrollmentRecord[] =>
  enrollmentHistory.filter((e) => e.studentId === studentId);

export const getActiveEnrollment = (studentId: string): EnrollmentRecord | undefined =>
  enrollmentHistory.find(
    (e) => e.studentId === studentId && (e.status === 'submitted' || e.status === 'approved'),
  );

export const getAllEnrolledSubjectIds = (studentId: string): string[] => {
  const allEnrolled = enrollmentHistory
    .filter((e) => e.studentId === studentId && e.status === 'approved')
    .flatMap((e) => e.subjectIds);
  return [...new Set(allEnrolled)];
};

// In-memory store for newly created enrollment records (session-only)
export const sessionEnrollments: EnrollmentRecord[] = [];

export const addSessionEnrollment = (record: EnrollmentRecord): void => {
  sessionEnrollments.push(record);
};
