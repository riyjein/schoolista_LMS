import type { Instructor } from '../../types/attendance';

export const instructors: Instructor[] = [
  {
    id: 'inst-1',
    userId: 'u2',
    name: 'Prof. Juan dela Cruz',
    employeeId: 'EMP-001',
    department: 'College of Computer Studies',
  },
  {
    id: 'inst-2',
    userId: 'u3',
    name: 'Dr. Ana Reyes',
    employeeId: 'EMP-010',
    department: 'College of Computer Studies',
  },
  {
    id: 'inst-3',
    userId: 'u6',
    name: 'Prof. Carlos Mendoza',
    employeeId: 'EMP-022',
    department: 'College of Computer Studies',
  },
  {
    id: 'inst-4',
    userId: 'u7',
    name: 'Coach Maricel Bautista',
    employeeId: 'EMP-033',
    department: 'Department of Physical Education',
  },
];

export const getInstructorById = (id: string): Instructor | undefined =>
  instructors.find((i) => i.id === id);

export const getInstructorByUserId = (userId: string): Instructor | undefined =>
  instructors.find((i) => i.userId === userId);
