import type { CompletedSubjectRecord } from "../../types/enrollment";

// Jane Doe (student-1) completed all Year 1 subjects
export const completedSubjectRecords: CompletedSubjectRecord[] = [];

export const getCompletedSubjectsForStudent = (
  studentId: string,
): CompletedSubjectRecord[] =>
  completedSubjectRecords.filter((r) => r.studentId === studentId);

export const getPassedSubjectIdsForStudent = (studentId: string): string[] =>
  completedSubjectRecords
    .filter((r) => r.studentId === studentId && r.passed)
    .map((r) => r.subjectId);

export const getFailedSubjectIdsForStudent = (studentId: string): string[] =>
  completedSubjectRecords
    .filter((r) => r.studentId === studentId && !r.passed)
    .map((r) => r.subjectId);
