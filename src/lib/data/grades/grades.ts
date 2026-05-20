import type { GradeRecord, GradeStudent } from '../../types/grades';

// Extended student registry for grade display (includes students 2 & 3 not in enrollment profiles)
export const gradeStudents: Record<string, GradeStudent> = {
  'student-1': { id: 'student-1', name: 'Maria Santos',    studentNumber: '2023-00142' },
  'student-2': { id: 'student-2', name: 'Jose Reyes',      studentNumber: '2023-00143' },
  'student-3': { id: 'student-3', name: 'Ana Dela Cruz',   studentNumber: '2023-00144' },
};

//
// 2024-2025 1st Semester — BSCS-2A grade records
//
// class-1: CS211 (5 units) — inst-1 — finalized all
// class-2: CS221 (6 units) — inst-2 — s1/s3 submitted, s2 finalized
// class-3: CS231 (3 units) — inst-3 — finalized all
// class-4: PE201 (2 units) — inst-4 — finalized all
// class-5: ENG211 (3 units) — inst-2 — s1/s3 draft (no final), s2 finalized
//
const SCHOOL_YEAR = '2024-2025';
const SEMESTER = '1st';
const YEAR_LEVEL = 2;

// Mutable store — faculty encoding pushes changes here
export const gradeRecords: GradeRecord[] = [
  // ── CS 211 — Programming 2 (finalized) ─────────────────────────────────────
  {
    id: 'gr-c1-s1', studentId: 'student-1', classId: 'class-1', subjectId: 'cs211',
    instructorId: 'inst-1', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 85, midtermGrade: 88, finalGrade: 90, status: 'finalized',
  },
  {
    id: 'gr-c1-s2', studentId: 'student-2', classId: 'class-1', subjectId: 'cs211',
    instructorId: 'inst-1', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 95, midtermGrade: 97, finalGrade: 96, status: 'finalized',
  },
  {
    id: 'gr-c1-s3', studentId: 'student-3', classId: 'class-1', subjectId: 'cs211',
    instructorId: 'inst-1', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 72, midtermGrade: 74, finalGrade: 70, status: 'finalized',
  },

  // ── CS 221 — Discrete Mathematics (s1/s3 submitted, s2 finalized) ──────────
  {
    id: 'gr-c2-s1', studentId: 'student-1', classId: 'class-2', subjectId: 'cs221',
    instructorId: 'inst-2', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 78, midtermGrade: 82, finalGrade: 80, status: 'submitted',
  },
  {
    id: 'gr-c2-s2', studentId: 'student-2', classId: 'class-2', subjectId: 'cs221',
    instructorId: 'inst-2', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 90, midtermGrade: 92, finalGrade: 93, status: 'finalized',
  },
  {
    id: 'gr-c2-s3', studentId: 'student-3', classId: 'class-2', subjectId: 'cs221',
    instructorId: 'inst-2', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 78, midtermGrade: 80, finalGrade: 78, status: 'submitted',
  },

  // ── CS 231 — Computer Organization (finalized all) ─────────────────────────
  {
    id: 'gr-c3-s1', studentId: 'student-1', classId: 'class-3', subjectId: 'cs231',
    instructorId: 'inst-3', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 92, midtermGrade: 88, finalGrade: 94, status: 'finalized',
  },
  {
    id: 'gr-c3-s2', studentId: 'student-2', classId: 'class-3', subjectId: 'cs231',
    instructorId: 'inst-3', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 94, midtermGrade: 95, finalGrade: 96, status: 'finalized',
  },
  {
    id: 'gr-c3-s3', studentId: 'student-3', classId: 'class-3', subjectId: 'cs231',
    instructorId: 'inst-3', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 80, midtermGrade: 82, finalGrade: 83, status: 'finalized',
  },

  // ── PE 201 — Physical Education 3 (finalized all) ──────────────────────────
  {
    id: 'gr-c4-s1', studentId: 'student-1', classId: 'class-4', subjectId: 'pe201',
    instructorId: 'inst-4', sectionCode: 'PE-2024-A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 88, midtermGrade: 90, finalGrade: 91, status: 'finalized',
  },
  {
    id: 'gr-c4-s2', studentId: 'student-2', classId: 'class-4', subjectId: 'pe201',
    instructorId: 'inst-4', sectionCode: 'PE-2024-A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 91, midtermGrade: 92, finalGrade: 93, status: 'finalized',
  },
  {
    id: 'gr-c4-s3', studentId: 'student-3', classId: 'class-4', subjectId: 'pe201',
    instructorId: 'inst-4', sectionCode: 'PE-2024-A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 85, midtermGrade: 88, finalGrade: 86, status: 'finalized',
  },

  // ── ENG 211 — Purposive Communication (s1/s3 draft, s2 finalized) ──────────
  {
    id: 'gr-c5-s1', studentId: 'student-1', classId: 'class-5', subjectId: 'eng211',
    instructorId: 'inst-2', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 85, midtermGrade: 87, finalGrade: null, status: 'draft',
  },
  {
    id: 'gr-c5-s2', studentId: 'student-2', classId: 'class-5', subjectId: 'eng211',
    instructorId: 'inst-2', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 92, midtermGrade: 90, finalGrade: 91, status: 'finalized',
  },
  {
    id: 'gr-c5-s3', studentId: 'student-3', classId: 'class-5', subjectId: 'eng211',
    instructorId: 'inst-2', sectionCode: 'BSCS-2A',
    schoolYear: SCHOOL_YEAR, semester: SEMESTER, yearLevel: YEAR_LEVEL,
    prelimGrade: 79, midtermGrade: 81, finalGrade: null, status: 'draft',
  },
];

export const getGradesForStudent = (studentId: string): GradeRecord[] =>
  gradeRecords.filter((r) => r.studentId === studentId);

export const getGradesForClass = (classId: string): GradeRecord[] =>
  gradeRecords.filter((r) => r.classId === classId);

export const getGradeRecord = (studentId: string, classId: string): GradeRecord | undefined =>
  gradeRecords.find((r) => r.studentId === studentId && r.classId === classId);

export const updateGradeRecord = (id: string, updates: Partial<GradeRecord>): void => {
  const idx = gradeRecords.findIndex((r) => r.id === id);
  if (idx !== -1) Object.assign(gradeRecords[idx], updates);
};
