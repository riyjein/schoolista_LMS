import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout, RootRedirect } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { FacultyDashboard } from './components/dashboards/FacultyDashboard';
import { PlaceholderPage } from './components/shared/PlaceholderPage';
import EnrollmentPage from './components/enrollment/EnrollmentPage';
import AttendancePage from './components/attendance/AttendancePage';
import StudentGradesPage from './components/grades/student/StudentGradesPage';
import GradingManagementPage from './components/grading/GradingManagementPage';
import StudentEvaluationPage from './components/evaluation/student/StudentEvaluationPage';
import FacultyEvaluationPage from './components/evaluation/faculty/FacultyEvaluationPage';
import FacultyAttendancePage from './components/attendance/faculty/FacultyAttendancePage';
import AttendanceReportsPage from './components/attendance/program-chair/AttendanceReportsPage';
import StudentSchedulePage from './components/schedule/StudentSchedulePage';
import FacultySchedulePage from './components/schedule/FacultySchedulePage';
import FacultyStudentsPage from './components/schedule/FacultyStudentsPage';

// Program Chair pages
import { ProgramChairDashboard } from './components/program-chair/ProgramChairDashboard';
import AcademicReportsPage from './components/program-chair/AcademicReportsPage';
import ClassPerformancePage from './components/program-chair/ClassPerformancePage';
import DeansListerPage from './components/program-chair/DeansListerPage';
import FacultyOverviewPage from './components/program-chair/FacultyOverviewPage';

// Stakeholder pages
import StakeholderDashboard from './components/stakeholders/StakeholderDashboard';
import EnrollmentTrendsPage from './components/stakeholders/EnrollmentTrendsPage';
import FinancialSummaryPage from './components/stakeholders/FinancialSummaryPage';
import SchoolPerformancePage from './components/stakeholders/SchoolPerformancePage';

// Admin pages
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import UsersPage from './components/admin/UsersPage';
import ProgramsPage from './components/admin/ProgramsPage';
import SubjectsPage from './components/admin/SubjectsPage';
import SectionsPage from './components/admin/SectionsPage';
import AnnouncementsPage from './components/admin/AnnouncementsPage';
import SettingsPage from './components/admin/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/auth',
    Component: AuthLayout,
    children: [
      { index: true, Component: () => <Navigate to="/auth/login" replace /> },
      { path: 'login', Component: SignIn },
      { path: 'register', Component: SignUp },
    ]
  },
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: RootRedirect },

      // Student routes
      { path: 'student', Component: StudentDashboard },
      { path: 'student/enrollment', Component: EnrollmentPage },
      { path: 'student/attendance', Component: AttendancePage },
      { path: 'student/grades', Component: StudentGradesPage },
      { path: 'student/evaluation', Component: StudentEvaluationPage },
      { path: 'student/balance', Component: () => <PlaceholderPage title="Balance" description="View your outstanding fees and payment history." /> },
      { path: 'student/schedule', Component: StudentSchedulePage },

      // Faculty routes
      { path: 'faculty', Component: FacultyDashboard },
      { path: 'faculty/reports', Component: () => <PlaceholderPage title="Reports" description="Generate and view academic reports." /> },
      { path: 'faculty/grading', Component: GradingManagementPage },
      { path: 'faculty/evaluation', Component: FacultyEvaluationPage },
      { path: 'faculty/attendance', Component: FacultyAttendancePage },
      { path: 'faculty/schedules', Component: FacultySchedulePage },
      { path: 'faculty/students', Component: FacultyStudentsPage },

      // Program Chair routes
      { path: 'program-chair', Component: ProgramChairDashboard },
      { path: 'program-chair/academic-reports', Component: AcademicReportsPage },
      { path: 'program-chair/class-performance', Component: ClassPerformancePage },
      { path: 'program-chair/attendance-reports', Component: AttendanceReportsPage },
      { path: 'program-chair/deans-lister', Component: DeansListerPage },
      { path: 'program-chair/faculty-overview', Component: FacultyOverviewPage },

      // Stakeholder routes
      { path: 'stakeholder', Component: StakeholderDashboard },
      { path: 'stakeholder/enrollment-trends', Component: EnrollmentTrendsPage },
      { path: 'stakeholder/financial-summary', Component: FinancialSummaryPage },
      { path: 'stakeholder/school-performance', Component: SchoolPerformancePage },
      { path: 'stakeholder/analytics', Component: StakeholderDashboard },

      // Admin routes
      { path: 'admin', Component: AdminDashboardPage },
      { path: 'admin/users', Component: UsersPage },
      { path: 'admin/programs', Component: ProgramsPage },
      { path: 'admin/subjects', Component: SubjectsPage },
      { path: 'admin/sections', Component: SectionsPage },
      { path: 'admin/announcements', Component: AnnouncementsPage },
      { path: 'admin/settings', Component: SettingsPage },
    ],
  },
]);
