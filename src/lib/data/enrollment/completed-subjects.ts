import type { CompletedSubjectRecord } from '../../types/enrollment';

// Jane Doe (student-1) completed all Year 1 subjects
export const completedSubjectRecords: CompletedSubjectRecord[] = [
  // Year 1, Semester 1 — all passed
  { studentId: 'student-1', subjectId: 'ite101',  grade: 88, yearLevel: 1, semester: '1st', schoolYear: '2023-2024', passed: true },
  { studentId: 'student-1', subjectId: 'math111', grade: 82, yearLevel: 1, semester: '1st', schoolYear: '2023-2024', passed: true },
  { studentId: 'student-1', subjectId: 'eng111',  grade: 91, yearLevel: 1, semester: '1st', schoolYear: '2023-2024', passed: true },
  { studentId: 'student-1', subjectId: 'pe101',   grade: 95, yearLevel: 1, semester: '1st', schoolYear: '2023-2024', passed: true },
  { studentId: 'student-1', subjectId: 'nstp101', grade: 90, yearLevel: 1, semester: '1st', schoolYear: '2023-2024', passed: true },
  { studentId: 'student-1', subjectId: 'huma111', grade: 85, yearLevel: 1, semester: '1st', schoolYear: '2023-2024', passed: true },

  // Year 1, Semester 2 — passed most, failed Math 121 (Trigonometry)
  { studentId: 'student-1', subjectId: 'cs111',   grade: 89, yearLevel: 1, semester: '2nd', schoolYear: '2023-2024', passed: true },
  { studentId: 'student-1', subjectId: 'math121', grade: 64, yearLevel: 1, semester: '2nd', schoolYear: '2023-2024', passed: false },
  { studentId: 'student-1', subjectId: 'eng121',  grade: 87, yearLevel: 1, semester: '2nd', schoolYear: '2023-2024', passed: true },
  { studentId: 'student-1', subjectId: 'pe102',   grade: 92, yearLevel: 1, semester: '2nd', schoolYear: '2023-2024', passed: true },
  { studentId: 'student-1', subjectId: 'nstp102', grade: 88, yearLevel: 1, semester: '2nd', schoolYear: '2023-2024', passed: true },
  { studentId: 'student-1', subjectId: 'sci111',  grade: 79, yearLevel: 1, semester: '2nd', schoolYear: '2023-2024', passed: true },
];

export const getCompletedSubjectsForStudent = (studentId: string): CompletedSubjectRecord[] =>
  completedSubjectRecords.filter((r) => r.studentId === studentId);

export const getPassedSubjectIdsForStudent = (studentId: string): string[] =>
  completedSubjectRecords
    .filter((r) => r.studentId === studentId && r.passed)
    .map((r) => r.subjectId);

export const getFailedSubjectIdsForStudent = (studentId: string): string[] =>
  completedSubjectRecords
    .filter((r) => r.studentId === studentId && !r.passed)
    .map((r) => r.subjectId);
