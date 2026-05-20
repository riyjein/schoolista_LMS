import { instructors } from '../attendance/instructors';
import { facultyLoads } from '../grading/faculty-loads';
import { gradeRecords } from '../grades/grades';
import { evalRecords } from '../evaluation/eval-records';
import { attendanceSessions } from '../attendance/attendance-sessions';
import { subjects } from '../enrollment/subjects';
import { classOfferings } from '../attendance/class-offerings';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoadStatus = 'normal' | 'overloaded' | 'underloaded';

export interface FacultyPerformance {
  instructorId: string;
  name: string;
  employeeId: string;
  department: string;
  assignedSubjects: string[];
  totalClasses: number;
  totalStudents: number;
  averageClassGPA: number | null;
  averageEvaluationRating: number | null;
  attendanceComplianceRate: number;
  gradingCompletionRate: number;
  loadStatus: LoadStatus;
  performanceScore: number | null;
}

export interface SubjectLoad {
  subjectId: string;
  subjectCode: string;
  subjectTitle: string;
  sectionCode: string;
  enrolledStudents: number;
  units: number;
}

export interface FacultyDetail extends FacultyPerformance {
  subjectLoads: SubjectLoad[];
  evaluationCount: number;
  pendingGrades: number;
  completedGrades: number;
  totalGradingTasks: number;
}

export interface DepartmentSummary {
  department: string;
  totalFaculty: number;
  averageLoad: number;
  averagePerformance: number | null;
  overloadedCount: number;
  underloadedCount: number;
  topPerformer: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NORMAL_LOAD_MIN = 3;
const NORMAL_LOAD_MAX = 5;
const OVERLOAD_THRESHOLD = 6;
const UNDERLOAD_THRESHOLD = 2;

// ─── Compute Faculty Performance ──────────────────────────────────────────────

function computeFacultyPerformance(instructorId: string): FacultyPerformance {
  const instructor = instructors.find((i) => i.id === instructorId);
  if (!instructor) {
    throw new Error(`Instructor not found: ${instructorId}`);
  }

  const loads = facultyLoads.filter((l) => l.instructorId === instructorId);

  // Get assigned subjects
  const assignedSubjects = [...new Set(loads.map((l) => l.subjectId))];

  // Get total students
  const studentIds = new Set<string>();
  loads.forEach((load) => {
    const classOffering = classOfferings.find((c) => c.id === load.classId);
    if (classOffering) {
      classOffering.enrolledStudentIds.forEach((id) => studentIds.add(id));
    }
  });

  // Compute average class GPA
  const classGPAs: number[] = [];
  loads.forEach((load) => {
    const classGrades = gradeRecords.filter(
      (g) =>
        g.classId === load.classId &&
        g.status === 'finalized' &&
        g.prelimGrade !== null &&
        g.midtermGrade !== null &&
        g.finalGrade !== null,
    );

    if (classGrades.length > 0) {
      const total = classGrades.reduce((sum, g) => {
        const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
        return sum + avg;
      }, 0);
      classGPAs.push(total / classGrades.length);
    }
  });

  const averageClassGPA =
    classGPAs.length > 0 ? classGPAs.reduce((sum, gpa) => sum + gpa, 0) / classGPAs.length : null;

  // Compute average evaluation rating
  const evals = evalRecords.filter((e) => e.instructorId === instructorId && e.status === 'submitted');

  let averageEvaluationRating: number | null = null;
  if (evals.length > 0) {
    const totalRating = evals.reduce((sum, e) => {
      const ratings = e.answers.filter((a) => a.rating !== undefined).map((a) => a.rating!);
      if (ratings.length === 0) return sum;
      const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
      return sum + avg;
    }, 0);
    averageEvaluationRating = totalRating / evals.length;
  }

  // Compute attendance compliance rate
  const instructorClasses = loads.map((l) => l.classId);
  const totalSessions = attendanceSessions.filter((s) => instructorClasses.includes(s.classId))
    .length;
  const closedSessions = attendanceSessions.filter(
    (s) => instructorClasses.includes(s.classId) && s.status === 'closed',
  ).length;

  const attendanceComplianceRate = totalSessions > 0 ? (closedSessions / totalSessions) * 100 : 0;

  // Compute grading completion rate
  const instructorGrades = gradeRecords.filter((g) => g.instructorId === instructorId);
  const completedGrades = instructorGrades.filter((g) => g.status === 'finalized').length;
  const gradingCompletionRate =
    instructorGrades.length > 0 ? (completedGrades / instructorGrades.length) * 100 : 0;

  // Determine load status
  let loadStatus: LoadStatus;
  if (loads.length >= OVERLOAD_THRESHOLD) {
    loadStatus = 'overloaded';
  } else if (loads.length <= UNDERLOAD_THRESHOLD) {
    loadStatus = 'underloaded';
  } else {
    loadStatus = 'normal';
  }

  // Compute overall performance score (0-100)
  let performanceScore: number | null = null;
  if (averageClassGPA !== null && averageEvaluationRating !== null) {
    const gradeScore = (averageClassGPA / 100) * 40; // 40% weight
    const evalScore = (averageEvaluationRating / 5) * 30; // 30% weight
    const attendanceScore = (attendanceComplianceRate / 100) * 15; // 15% weight
    const gradingScore = (gradingCompletionRate / 100) * 15; // 15% weight

    performanceScore = gradeScore + evalScore + attendanceScore + gradingScore;
  }

  return {
    instructorId,
    name: instructor.name,
    employeeId: instructor.employeeId,
    department: instructor.department,
    assignedSubjects,
    totalClasses: loads.length,
    totalStudents: studentIds.size,
    averageClassGPA,
    averageEvaluationRating,
    attendanceComplianceRate,
    gradingCompletionRate,
    loadStatus,
    performanceScore,
  };
}

// ─── Compute Faculty Detail ───────────────────────────────────────────────────

function computeFacultyDetail(instructorId: string): FacultyDetail {
  const performance = computeFacultyPerformance(instructorId);
  const loads = facultyLoads.filter((l) => l.instructorId === instructorId);

  // Get subject loads
  const subjectLoads: SubjectLoad[] = loads.map((load) => {
    const subject = subjects.find((s) => s.id === load.subjectId);
    const classOffering = classOfferings.find((c) => c.id === load.classId);

    return {
      subjectId: load.subjectId,
      subjectCode: subject?.code || 'N/A',
      subjectTitle: subject?.title || 'Unknown',
      sectionCode: load.sectionCode,
      enrolledStudents: classOffering?.enrolledStudentIds.length || 0,
      units: subject?.units || 0,
    };
  });

  // Get grading stats
  const instructorGrades = gradeRecords.filter((g) => g.instructorId === instructorId);
  const completedGrades = instructorGrades.filter((g) => g.status === 'finalized').length;
  const pendingGrades = instructorGrades.filter(
    (g) =>
      g.status === 'draft' ||
      g.prelimGrade === null ||
      g.midtermGrade === null ||
      g.finalGrade === null,
  ).length;

  // Get evaluation count
  const evaluationCount = evalRecords.filter(
    (e) => e.instructorId === instructorId && e.status === 'submitted',
  ).length;

  return {
    ...performance,
    subjectLoads,
    evaluationCount,
    pendingGrades,
    completedGrades,
    totalGradingTasks: instructorGrades.length,
  };
}

// ─── Generate All Faculty Performance ─────────────────────────────────────────

function generateAllFacultyPerformance(): FacultyPerformance[] {
  return instructors.map((instructor) => computeFacultyPerformance(instructor.id));
}

// ─── Compute Department Summary ───────────────────────────────────────────────

function computeDepartmentSummaries(): DepartmentSummary[] {
  const departments = [...new Set(instructors.map((i) => i.department))];

  return departments.map((department) => {
    const deptFaculty = facultyPerformances.filter((f) => f.department === department);

    const totalLoad = deptFaculty.reduce((sum, f) => sum + f.totalClasses, 0);
    const averageLoad = deptFaculty.length > 0 ? totalLoad / deptFaculty.length : 0;

    const validPerformances = deptFaculty.filter((f) => f.performanceScore !== null);
    const averagePerformance =
      validPerformances.length > 0
        ? validPerformances.reduce((sum, f) => sum + f.performanceScore!, 0) /
          validPerformances.length
        : null;

    const overloadedCount = deptFaculty.filter((f) => f.loadStatus === 'overloaded').length;
    const underloadedCount = deptFaculty.filter((f) => f.loadStatus === 'underloaded').length;

    const topPerformerData = validPerformances.sort(
      (a, b) => b.performanceScore! - a.performanceScore!,
    )[0];

    return {
      department,
      totalFaculty: deptFaculty.length,
      averageLoad,
      averagePerformance,
      overloadedCount,
      underloadedCount,
      topPerformer: topPerformerData?.name || null,
    };
  });
}

// ─── Export Faculty Overview Data ─────────────────────────────────────────────

export const facultyPerformances: FacultyPerformance[] = generateAllFacultyPerformance();

export const departmentSummaries: DepartmentSummary[] = computeDepartmentSummaries();

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getFacultyPerformance = (instructorId: string): FacultyPerformance | undefined =>
  facultyPerformances.find((f) => f.instructorId === instructorId);

export const getFacultyDetail = (instructorId: string): FacultyDetail =>
  computeFacultyDetail(instructorId);

export const getFacultyByDepartment = (department: string): FacultyPerformance[] =>
  facultyPerformances.filter((f) => f.department === department);

export const getOverloadedFaculty = (): FacultyPerformance[] =>
  facultyPerformances.filter((f) => f.loadStatus === 'overloaded');

export const getUnderloadedFaculty = (): FacultyPerformance[] =>
  facultyPerformances.filter((f) => f.loadStatus === 'underloaded');

export const getTopPerformers = (limit: number = 10): FacultyPerformance[] =>
  facultyPerformances
    .filter((f) => f.performanceScore !== null)
    .sort((a, b) => b.performanceScore! - a.performanceScore!)
    .slice(0, limit);

export const getBottomPerformers = (limit: number = 10): FacultyPerformance[] =>
  facultyPerformances
    .filter((f) => f.performanceScore !== null)
    .sort((a, b) => a.performanceScore! - b.performanceScore!)
    .slice(0, limit);

export const getDepartmentSummary = (department: string): DepartmentSummary | undefined =>
  departmentSummaries.find((s) => s.department === department);

// ─── Overall Statistics ───────────────────────────────────────────────────────

export const facultyOverallStats = {
  totalFaculty: facultyPerformances.length,
  averageLoad:
    facultyPerformances.length > 0
      ? facultyPerformances.reduce((sum, f) => sum + f.totalClasses, 0) /
        facultyPerformances.length
      : 0,
  averagePerformance:
    facultyPerformances.filter((f) => f.performanceScore !== null).length > 0
      ? facultyPerformances
          .filter((f) => f.performanceScore !== null)
          .reduce((sum, f) => sum + f.performanceScore!, 0) /
        facultyPerformances.filter((f) => f.performanceScore !== null).length
      : null,
  overloadedCount: facultyPerformances.filter((f) => f.loadStatus === 'overloaded').length,
  underloadedCount: facultyPerformances.filter((f) => f.loadStatus === 'underloaded').length,
  normalLoadCount: facultyPerformances.filter((f) => f.loadStatus === 'normal').length,
  averageEvaluationRating:
    facultyPerformances.filter((f) => f.averageEvaluationRating !== null).length > 0
      ? facultyPerformances
          .filter((f) => f.averageEvaluationRating !== null)
          .reduce((sum, f) => sum + f.averageEvaluationRating!, 0) /
        facultyPerformances.filter((f) => f.averageEvaluationRating !== null).length
      : null,
  averageGradingCompletion:
    facultyPerformances.length > 0
      ? facultyPerformances.reduce((sum, f) => sum + f.gradingCompletionRate, 0) /
        facultyPerformances.length
      : 0,
};
