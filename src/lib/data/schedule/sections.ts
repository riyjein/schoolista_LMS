export interface Section {
  id: string;
  code: string;
  courseId: string;
  yearLevel: number;
  schoolYear: string;
  semester: string;
  maxStudents: number;
}

export const sections: Section[] = [
  {
    id: 'sec-1',
    code: 'BSCS-2A',
    courseId: 'bscs',
    yearLevel: 2,
    schoolYear: '2024-2025',
    semester: '1st',
    maxStudents: 40,
  },
  {
    id: 'sec-2',
    code: 'BSCS-2B',
    courseId: 'bscs',
    yearLevel: 2,
    schoolYear: '2024-2025',
    semester: '1st',
    maxStudents: 40,
  },
  {
    id: 'sec-3',
    code: 'PE-2024-A',
    courseId: 'all',
    yearLevel: 2,
    schoolYear: '2024-2025',
    semester: '1st',
    maxStudents: 50,
  },
];

export const getSectionByCode = (code: string): Section | undefined =>
  sections.find((s) => s.code === code);

export const getSectionById = (id: string): Section | undefined =>
  sections.find((s) => s.id === id);

export const getSectionsByCourse = (courseId: string): Section[] =>
  sections.filter((s) => s.courseId === courseId || s.courseId === 'all');
