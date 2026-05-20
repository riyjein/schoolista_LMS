import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Maria Santos',
    email: 'maria.santos@school.edu',
    role: 'student',
    avatarInitials: 'MS',
    studentId: '2021-00123',
    department: 'College of Engineering',
    program: 'BS Computer Engineering',
    yearLevel: 3,
  },
  {
    id: 'u2',
    name: 'Prof. Juan dela Cruz',
    email: 'juan.delacruz@school.edu',
    role: 'faculty',
    avatarInitials: 'JD',
    employeeId: 'EMP-001',
    department: 'College of Engineering',
  },
  {
    id: 'u3',
    name: 'Dr. Ana Reyes',
    email: 'ana.reyes@school.edu',
    role: 'program-chair',
    avatarInitials: 'AR',
    employeeId: 'EMP-010',
    department: 'College of Computer Studies',
  },
  {
    id: 'u4',
    name: 'Engr. Roberto Lim',
    email: 'roberto.lim@board.school.edu',
    role: 'stakeholder',
    avatarInitials: 'RL',
    department: 'Board of Trustees',
  },
  {
    id: 'u5',
    name: 'System Administrator',
    email: 'admin@school.edu',
    role: 'admin',
    avatarInitials: 'SA',
    employeeId: 'ADM-001',
    department: 'IT Department',
  },
];

export const getMockUserByRole = (role: User['role']): User =>
  mockUsers.find((u) => u.role === role) ?? mockUsers[0];
