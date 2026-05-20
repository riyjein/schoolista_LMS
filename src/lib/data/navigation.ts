import type { RoleNavMap } from '../types';

export const roleNavigation: RoleNavMap = {
  student: [
    { label: 'Dashboard', path: '/student', icon: 'LayoutDashboard' },
    { label: 'Enrollment', path: '/student/enrollment', icon: 'BookOpen' },
    { label: 'Attendance', path: '/student/attendance', icon: 'CalendarCheck' },
    { label: 'Grades', path: '/student/grades', icon: 'GraduationCap' },
    { label: 'Faculty Evaluation', path: '/student/evaluation', icon: 'Star' },
    { label: 'Balance', path: '/student/balance', icon: 'Wallet' },
    { label: 'Schedule', path: '/student/schedule', icon: 'Clock' },
  ],
  faculty: [
    { label: 'Dashboard', path: '/faculty', icon: 'LayoutDashboard' },
    { label: 'Reports', path: '/faculty/reports', icon: 'FileText' },
    { label: 'Grading', path: '/faculty/grading', icon: 'PenLine' },
    { label: 'Attendance', path: '/faculty/attendance', icon: 'CalendarCheck' },
    { label: 'Schedules', path: '/faculty/schedules', icon: 'Clock' },
    { label: 'Students', path: '/faculty/students', icon: 'Users' },
  ],
  'program-chair': [
    { label: 'Dashboard', path: '/program-chair', icon: 'LayoutDashboard' },
    { label: 'Academic Reports', path: '/program-chair/academic-reports', icon: 'FileText' },
    { label: 'Class Performance', path: '/program-chair/class-performance', icon: 'BarChart2' },
    { label: 'Attendance Reports', path: '/program-chair/attendance-reports', icon: 'CalendarCheck' },
    { label: "Dean's Lister", path: '/program-chair/deans-lister', icon: 'Award' },
    { label: 'Faculty Overview', path: '/program-chair/faculty-overview', icon: 'Users' },
  ],
  stakeholder: [
    { label: 'Dashboard', path: '/stakeholder', icon: 'LayoutDashboard' },
    { label: 'Enrollment Trends', path: '/stakeholder/enrollment-trends', icon: 'TrendingUp' },
    { label: 'Financial Summary', path: '/stakeholder/financial-summary', icon: 'DollarSign' },
    { label: 'School Performance', path: '/stakeholder/school-performance', icon: 'BarChart2' },
    { label: 'Analytics', path: '/stakeholder/analytics', icon: 'LineChart' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
    { label: 'Users', path: '/admin/users', icon: 'Users' },
    { label: 'Programs', path: '/admin/programs', icon: 'BookOpen' },
    { label: 'Subjects', path: '/admin/subjects', icon: 'Book' },
    { label: 'Sections', path: '/admin/sections', icon: 'Layers' },
    { label: 'Announcements', path: '/admin/announcements', icon: 'Bell' },
    { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
  ],
};

export const roleRootPath: Record<string, string> = {
  student: '/student',
  faculty: '/faculty',
  'program-chair': '/program-chair',
  stakeholder: '/stakeholder',
  admin: '/admin',
};
