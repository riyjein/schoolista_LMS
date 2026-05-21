import type { UserRole } from './role';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_initials: string;
  department?: string;
  studentId?: string;
  employeeId?: string;
  yearLevel?: number;
  program?: string;
}
