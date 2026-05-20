import type { EnrollmentRecord } from '../../types/enrollment';

export const enrollmentHistory: EnrollmentRecord[] = [
  {
    id: 'enr-2023-1-1',
    referenceNumber: 'ENR-2023-00142-01',
    studentId: 'student-1',
    courseId: 'bscs',
    yearLevel: 1,
    semester: '1st',
    schoolYear: '2023-2024',
    subjectIds: ['ite101', 'math111', 'eng111', 'pe101', 'nstp101', 'huma111'],
    totalUnits: 17,
    status: 'approved',
    submittedAt: '2023-06-15T08:30:00.000Z',
    receiptId: 'rcpt-2023-1-1',
  },
  {
    id: 'enr-2023-1-2',
    referenceNumber: 'ENR-2023-00142-02',
    studentId: 'student-1',
    courseId: 'bscs',
    yearLevel: 1,
    semester: '2nd',
    schoolYear: '2023-2024',
    subjectIds: ['cs111', 'math121', 'eng121', 'pe102', 'nstp102', 'sci111'],
    totalUnits: 17,
    status: 'approved',
    submittedAt: '2023-11-10T09:00:00.000Z',
    receiptId: 'rcpt-2023-1-2',
  },
  {
    id: 'enr-2024-1-1',
    referenceNumber: 'ENR-2023-00142-03',
    studentId: 'student-1',
    courseId: 'bscs',
    yearLevel: 2,
    semester: '1st',
    schoolYear: '2024-2025',
    subjectIds: ['cs211', 'cs221', 'cs231', 'math211', 'pe201', 'eng211'],
    totalUnits: 22,
    status: 'approved',
    submittedAt: '2024-06-15T08:00:00.000Z',
    receiptId: 'rcpt-2024-1-1',
  },
  {
    id: 'enr-2024-2-1',
    referenceNumber: 'ENR-2023-00143-01',
    studentId: 'student-2',
    courseId: 'bscs',
    yearLevel: 2,
    semester: '1st',
    schoolYear: '2024-2025',
    subjectIds: ['cs211', 'cs221', 'cs231', 'math211', 'pe201', 'eng211'],
    totalUnits: 22,
    status: 'approved',
    submittedAt: '2024-06-15T08:30:00.000Z',
    receiptId: 'rcpt-2024-2-1',
  },
  {
    id: 'enr-2024-3-1',
    referenceNumber: 'ENR-2023-00144-01',
    studentId: 'student-3',
    courseId: 'bscs',
    yearLevel: 2,
    semester: '1st',
    schoolYear: '2024-2025',
    subjectIds: ['cs211', 'cs221', 'cs231', 'math211', 'pe201', 'eng211'],
    totalUnits: 22,
    status: 'approved',
    submittedAt: '2024-06-15T09:00:00.000Z',
    receiptId: 'rcpt-2024-3-1',
  },
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
