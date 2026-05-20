import type { Course } from '../../types/enrollment';

export const courses: Course[] = [
  {
    id: 'bscs',
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    department: 'College of Computer Studies',
    totalUnits: 142,
    years: 4,
  },
  {
    id: 'bsit',
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    department: 'College of Computer Studies',
    totalUnits: 138,
    years: 4,
  },
  {
    id: 'bsis',
    code: 'BSIS',
    name: 'Bachelor of Science in Information Systems',
    department: 'College of Computer Studies',
    totalUnits: 136,
    years: 4,
  },
  {
    id: 'bsme',
    code: 'BSME',
    name: 'Bachelor of Science in Mechanical Engineering',
    department: 'College of Engineering',
    totalUnits: 152,
    years: 4,
  },
  {
    id: 'bsce',
    code: 'BSCE',
    name: 'Bachelor of Science in Civil Engineering',
    department: 'College of Engineering',
    totalUnits: 156,
    years: 4,
  },
];

export const getCourseById = (id: string): Course | undefined =>
  courses.find((c) => c.id === id);
