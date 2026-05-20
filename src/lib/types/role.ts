export type UserRole = 'student' | 'faculty' | 'program-chair' | 'stakeholder' | 'admin';

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  'program-chair': 'Program Chair',
  stakeholder: 'Stakeholder',
  admin: 'Admin',
};

export const ALL_ROLES: UserRole[] = ['student', 'faculty', 'program-chair', 'stakeholder', 'admin'];
