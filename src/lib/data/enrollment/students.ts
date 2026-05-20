import type { StudentProfile } from '../../types/enrollment';

export const studentProfiles: StudentProfile[] = [
  {
    id: 'student-1',
    userId: 'u1',
    name: 'Maria Santos',
    studentNumber: '2023-00142',
    courseId: 'bscs',
    yearLevel: 2,
    currentSemester: '1st',
    schoolYear: '2024-2025',
    status: 'irregular',
  },
  {
    id: 'student-2',
    userId: 'u8',
    name: 'Juan Reyes',
    studentNumber: '2023-00143',
    courseId: 'bscs',
    yearLevel: 2,
    currentSemester: '1st',
    schoolYear: '2024-2025',
    status: 'regular',
  },
  {
    id: 'student-3',
    userId: 'u9',
    name: 'Ana Dela Cruz',
    studentNumber: '2023-00144',
    courseId: 'bscs',
    yearLevel: 2,
    currentSemester: '1st',
    schoolYear: '2024-2025',
    status: 'regular',
  },
];

export const getStudentProfileByUserId = (userId: string): StudentProfile | undefined =>
  studentProfiles.find((s) => s.userId === userId);

export const getStudentProfileById = (id: string): StudentProfile | undefined =>
  studentProfiles.find((s) => s.id === id);

// Fallback profile for demo mode when no match found
export const defaultStudentProfile: StudentProfile = {
  id: 'student-1',
  userId: 'u1',
  name: 'Maria Santos',
  studentNumber: '2023-00142',
  courseId: 'bscs',
  yearLevel: 2,
  currentSemester: '1st',
  schoolYear: '2024-2025',
  status: 'irregular',
};
