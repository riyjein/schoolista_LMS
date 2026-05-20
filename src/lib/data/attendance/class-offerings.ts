import type { ClassOffering } from '../../types/attendance';

export const classOfferings: ClassOffering[] = [
  {
    id: 'class-1',
    subjectId: 'cs211',
    instructorId: 'inst-1',
    sectionCode: 'BSCS-2A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'CS Lab 1',
    maxStudents: 35,
    enrolledStudentIds: ['student-1', 'student-2', 'student-3'],
  },
  {
    id: 'class-2',
    subjectId: 'cs221',
    instructorId: 'inst-2',
    sectionCode: 'BSCS-2A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'Room 302',
    maxStudents: 40,
    enrolledStudentIds: ['student-1', 'student-2', 'student-3'],
  },
  {
    id: 'class-3',
    subjectId: 'cs231',
    instructorId: 'inst-3',
    sectionCode: 'BSCS-2A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'CS Lab 2',
    maxStudents: 35,
    enrolledStudentIds: ['student-1', 'student-2', 'student-3'],
  },
  {
    id: 'class-4',
    subjectId: 'pe201',
    instructorId: 'inst-4',
    sectionCode: 'PE-2024-A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'Gymnasium',
    maxStudents: 45,
    enrolledStudentIds: ['student-1', 'student-2', 'student-3'],
  },
  {
    id: 'class-5',
    subjectId: 'eng211',
    instructorId: 'inst-2',
    sectionCode: 'BSCS-2A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'Room 201',
    maxStudents: 40,
    enrolledStudentIds: ['student-1', 'student-2', 'student-3'],
  },
];

export const getClassById = (id: string): ClassOffering | undefined =>
  classOfferings.find((c) => c.id === id);

export const getClassesForStudent = (studentId: string): ClassOffering[] =>
  classOfferings.filter((c) => c.enrolledStudentIds.includes(studentId));

export const getClassesForInstructor = (instructorId: string): ClassOffering[] =>
  classOfferings.filter((c) => c.instructorId === instructorId);
