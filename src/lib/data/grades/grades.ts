import type { GradeRecord, GradeStudent } from "../../types/grades";

// Extended student registry for grade display (includes students 2 & 3 not in enrollment profiles)
export const gradeStudents: Record<string, GradeStudent> = {};

//
// 2024-2025 1st Semester — BSCS-2A grade records
//
// class-1: CS211 (5 units) — inst-1 — finalized all
// class-2: CS221 (6 units) — inst-2 — s1/s3 submitted, s2 finalized
// class-3: CS231 (3 units) — inst-3 — finalized all
// class-4: PE201 (2 units) — inst-4 — finalized all
// class-5: ENG211 (3 units) — inst-2 — s1/s3 draft (no final), s2 finalized
//
const SCHOOL_YEAR = "2024-2025";
const SEMESTER = "1st";
const YEAR_LEVEL = 2;

// Mutable store — faculty encoding pushes changes here
export const gradeRecords: GradeRecord[] = [];

export const getGradesForStudent = (studentId: string): GradeRecord[] =>
  gradeRecords.filter((r) => r.studentId === studentId);

export const getGradesForClass = (classId: string): GradeRecord[] =>
  gradeRecords.filter((r) => r.classId === classId);

export const getGradeRecord = (
  studentId: string,
  classId: string,
): GradeRecord | undefined =>
  gradeRecords.find((r) => r.studentId === studentId && r.classId === classId);

export const updateGradeRecord = (
  id: string,
  updates: Partial<GradeRecord>,
): void => {
  const idx = gradeRecords.findIndex((r) => r.id === id);
  if (idx !== -1) Object.assign(gradeRecords[idx], updates);
};
