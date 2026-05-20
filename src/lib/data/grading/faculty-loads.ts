export interface FacultyLoad {
  id: string;
  instructorId: string;
  classId: string;
  subjectId: string;
  sectionCode: string;
  schoolYear: string;
  semester: string;
  room: string;
  maxStudents: number;
}

export const facultyLoads: FacultyLoad[] = [
  {
    id: 'load-1',
    instructorId: 'inst-1',
    classId: 'class-1',
    subjectId: 'cs211',
    sectionCode: 'BSCS-2A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'CS Lab 1',
    maxStudents: 35,
  },
  {
    id: 'load-2',
    instructorId: 'inst-2',
    classId: 'class-2',
    subjectId: 'cs221',
    sectionCode: 'BSCS-2A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'Room 302',
    maxStudents: 40,
  },
  {
    id: 'load-3',
    instructorId: 'inst-2',
    classId: 'class-5',
    subjectId: 'eng211',
    sectionCode: 'BSCS-2A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'Room 201',
    maxStudents: 40,
  },
  {
    id: 'load-4',
    instructorId: 'inst-3',
    classId: 'class-3',
    subjectId: 'cs231',
    sectionCode: 'BSCS-2A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'CS Lab 2',
    maxStudents: 35,
  },
  {
    id: 'load-5',
    instructorId: 'inst-4',
    classId: 'class-4',
    subjectId: 'pe201',
    sectionCode: 'PE-2024-A',
    schoolYear: '2024-2025',
    semester: '1st',
    room: 'Gymnasium',
    maxStudents: 45,
  },
];

export const getLoadsByInstructor = (instructorId: string): FacultyLoad[] =>
  facultyLoads.filter((l) => l.instructorId === instructorId);

export const getLoadByClassId = (classId: string): FacultyLoad | undefined =>
  facultyLoads.find((l) => l.classId === classId);
