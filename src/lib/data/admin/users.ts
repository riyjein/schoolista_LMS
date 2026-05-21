import { studentProfiles } from '../enrollment/students';
import { instructors } from '../attendance/instructors';
import { enrollmentHistory } from '../enrollment/enrollment-history';
import { facultyLoads } from '../grading/faculty-loads';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'faculty' | 'program-chair' | 'stakeholder' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarInitials?: string;
  createdAt: string;
  lastLogin: string | null;
  // Role-specific identifiers
  studentNumber?: string;
  employeeId?: string;
  // Additional info
  department?: string;
  courseId?: string;
  yearLevel?: number;
}

export interface UserStatistics {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
}

// ─── Generate Users from Existing Data ───────────────────────────────────────

function generateUsers(): User[] {
  const users: User[] = [];

  // Add students
  studentProfiles.forEach((student) => {
    const enrollments = enrollmentHistory.filter((e) => e.studentId === student.id);
    const lastEnrollment = enrollments.length > 0
      ? enrollments.sort((a, b) => {
          if (!a.enrollmentDate || !b.enrollmentDate) return 0;
          return b.enrollmentDate.localeCompare(a.enrollmentDate);
        })[0]
      : null;

    users.push({
      id: student.userId,
      name: student.name,
      email: `${student.studentNumber.toLowerCase().replace('-', '')}@university.edu`,
      role: 'student',
      status: student.status === 'dropped' ? 'inactive' : 'active',
      createdAt: '2023-06-15',
      lastLogin: lastEnrollment ? lastEnrollment.enrollmentDate : '2024-08-20',
      studentNumber: student.studentNumber,
      department: undefined,
      courseId: student.courseId,
      yearLevel: student.yearLevel,
    });
  });

  // Add faculty
  instructors.forEach((instructor) => {
    const loads = facultyLoads.filter((l) => l.instructorId === instructor.id);

    users.push({
      id: instructor.userId,
      name: instructor.name,
      email: `${instructor.employeeId.toLowerCase().replace('-', '')}@university.edu`,
      role: 'faculty',
      status: 'active',
      createdAt: '2020-01-15',
      lastLogin: loads.length > 0 ? '2024-11-18' : '2024-10-15',
      employeeId: instructor.employeeId,
      department: instructor.department,
    });
  });

  // Add admin users
  users.push({
    id: 'u4',
    name: 'Dr. Roberto Mendez',
    email: 'rmendez@university.edu',
    role: 'program-chair',
    status: 'active',
    createdAt: '2019-03-01',
    lastLogin: '2024-11-19',
    employeeId: 'EMP-004',
    department: 'College of Computer Studies',
  });

  users.push({
    id: 'u5',
    name: 'Maria Clara Santos',
    email: 'mcsantos@university.edu',
    role: 'stakeholder',
    status: 'active',
    createdAt: '2018-07-12',
    lastLogin: '2024-11-19',
    employeeId: 'EMP-005',
    department: 'Office of the President',
  });

  users.push({
    id: 'admin-1',
    name: 'System Administrator',
    email: 'admin@university.edu',
    role: 'admin',
    status: 'active',
    createdAt: '2018-01-01',
    lastLogin: '2024-11-19',
    employeeId: 'ADMIN-001',
    department: 'IT Services',
  });

  return users;
}

// ─── Compute Statistics ───────────────────────────────────────────────────────

export function computeUserStatistics(users: User[]): UserStatistics {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newUsersThisMonth = users.filter((u) => {
    const createdDate = new Date(u.createdAt);
    return createdDate >= thirtyDaysAgo;
  }).length;

  return {
    totalUsers: users.length,
    totalStudents: users.filter((u) => u.role === 'student').length,
    totalFaculty: users.filter((u) => u.role === 'faculty').length,
    totalAdmins: users.filter((u) =>
      u.role === 'admin' || u.role === 'program-chair' || u.role === 'stakeholder'
    ).length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    inactiveUsers: users.filter((u) => u.status === 'inactive').length,
    newUsersThisMonth,
  };
}

// ─── Export Users Data ────────────────────────────────────────────────────────

export const users: User[] = generateUsers();

export const userStatistics: UserStatistics = computeUserStatistics(users);

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getUserById = (id: string): User | undefined =>
  users.find((u) => u.id === id);

export const getUsersByRole = (role: UserRole): User[] =>
  users.filter((u) => u.role === role);

export const getUsersByStatus = (status: UserStatus): User[] =>
  users.filter((u) => u.status === status);

export const getUsersByDepartment = (department: string): User[] =>
  users.filter((u) => u.department === department);
