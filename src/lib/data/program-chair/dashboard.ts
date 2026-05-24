import { studentProfiles } from '../enrollment/students';
import { instructors } from '../attendance/instructors';
import { courses } from '../enrollment/courses';
import { facultyLoads } from '../grading/faculty-loads';
import { enrollmentHistory } from '../enrollment/enrollment-history';
import { gradeRecords } from '../grades/grades';
import { attendanceRecords } from '../attendance/attendance-records';
import { evalRecords } from '../evaluation/eval-records';
import { subjects } from '../enrollment/subjects';

// ─── Program-Level Metrics ────────────────────────────────────────────────────

export interface ProgramMetrics {
  courseId: string;
  courseName: string;
  totalStudents: number;
  enrolledStudents: number;
  averageGPA: number | null;
  passRate: number;
  attendanceRate: number;
  evaluationAverage: number | null;
}

export interface DepartmentMetrics {
  department: string;
  totalFaculty: number;
  totalClasses: number;
  totalStudents: number;
  averageEvaluation: number | null;
}

export interface EnrollmentMetrics {
  semester: string;
  schoolYear: string;
  totalEnrolled: number;
  byCourse: Record<string, number>;
  byYearLevel: Record<number, number>;
}

export interface GradeDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface DashboardSummary {
  totalStudents: number;
  totalFaculty: number;
  totalActiveClasses: number;
  totalEnrolledThisSemester: number;
  programMetrics: ProgramMetrics[];
  departmentMetrics: DepartmentMetrics[];
  currentEnrollment: EnrollmentMetrics;
  gradeDistribution: GradeDistribution[];
  overallPassRate: number;
  overallAttendanceRate: number;
  overallEvaluationAverage: number | null;
}

// ─── Compute Program Metrics ──────────────────────────────────────────────────

function computeProgramMetrics(): ProgramMetrics[] {
  const metrics: ProgramMetrics[] = [];

  courses.forEach((course) => {
    const courseStudents = studentProfiles.filter((s) => s.courseId === course.id);
    const enrolledStudents = enrollmentHistory.filter(
      (e) => e.courseId === course.id && e.status === 'approved',
    );

    // Compute average GPA
    const studentGrades = gradeRecords.filter((g) =>
      courseStudents.some((s) => s.id === g.studentId),
    );

    const finalizedGrades = studentGrades.filter(
      (g) =>
        g.status === 'finalized' &&
        g.prelimGrade !== null &&
        g.midtermGrade !== null &&
        g.finalGrade !== null,
    );

    let averageGPA: number | null = null;
    if (finalizedGrades.length > 0) {
      const totalGPA = finalizedGrades.reduce((sum, g) => {
        const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
        return sum + avg;
      }, 0);
      averageGPA = totalGPA / finalizedGrades.length;
    }

    // Compute pass rate
    const passCount = finalizedGrades.filter((g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return avg >= 75;
    }).length;
    const passRate = finalizedGrades.length > 0 ? (passCount / finalizedGrades.length) * 100 : 0;

    // Compute attendance rate
    const studentIds = courseStudents.map((s) => s.id);
    const courseAttendance = attendanceRecords.filter((a) => studentIds.includes(a.studentId));
    const presentOrLate = courseAttendance.filter(
      (a) => a.status === 'present' || a.status === 'late',
    ).length;
    const attendanceRate =
      courseAttendance.length > 0 ? (presentOrLate / courseAttendance.length) * 100 : 0;

    // Compute evaluation average
    const courseEvals = evalRecords.filter(
      (e) => e.status === 'submitted' && courseStudents.some((s) => s.id === e.studentId),
    );

    let evaluationAverage: number | null = null;
    if (courseEvals.length > 0) {
      const totalRating = courseEvals.reduce((sum, e) => {
        const ratings = e.answers.filter((a) => a.rating !== undefined).map((a) => a.rating!);
        if (ratings.length === 0) return sum;
        const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
        return sum + avg;
      }, 0);
      evaluationAverage = totalRating / courseEvals.length;
    }

    metrics.push({
      courseId: course.id,
      courseName: course.name,
      totalStudents: courseStudents.length,
      enrolledStudents: enrolledStudents.length,
      averageGPA,
      passRate,
      attendanceRate,
      evaluationAverage,
    });
  });

  return metrics;
}

// ─── Compute Department Metrics ───────────────────────────────────────────────

function computeDepartmentMetrics(): DepartmentMetrics[] {
  const departments = [...new Set(instructors.map((i) => i.department))];
  const metrics: DepartmentMetrics[] = [];

  departments.forEach((department) => {
    const deptFaculty = instructors.filter((i) => i.department === department);
    const facultyIds = deptFaculty.map((f) => f.id);
    const deptLoads = facultyLoads.filter((l) => facultyIds.includes(l.instructorId));

    // Get unique students across all classes
    const studentIds = new Set<string>();
    deptLoads.forEach((load) => {
      const studentGrades = gradeRecords.filter(
        (g) => g.instructorId === load.instructorId && g.subjectId === load.subjectId,
      );
      studentGrades.forEach((g) => studentIds.add(g.studentId));
    });

    // Compute average evaluation
    const deptEvals = evalRecords.filter(
      (e) => e.status === 'submitted' && facultyIds.includes(e.instructorId),
    );

    let averageEvaluation: number | null = null;
    if (deptEvals.length > 0) {
      const totalRating = deptEvals.reduce((sum, e) => {
        const ratings = e.answers.filter((a) => a.rating !== undefined).map((a) => a.rating!);
        if (ratings.length === 0) return sum;
        const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
        return sum + avg;
      }, 0);
      averageEvaluation = totalRating / deptEvals.length;
    }

    metrics.push({
      department,
      totalFaculty: deptFaculty.length,
      totalClasses: deptLoads.length,
      totalStudents: studentIds.size,
      averageEvaluation,
    });
  });

  return metrics;
}

// ─── Compute Current Enrollment Metrics ───────────────────────────────────────

function computeCurrentEnrollmentMetrics(): EnrollmentMetrics {
  const currentEnrollments = enrollmentHistory.filter(
    (e) => e.schoolYear === '2024-2025' && e.semester === '1st' && e.status === 'approved',
  );

  const byCourse: Record<string, number> = {};
  const byYearLevel: Record<number, number> = {};

  currentEnrollments.forEach((enrollment) => {
    byCourse[enrollment.courseId] = (byCourse[enrollment.courseId] || 0) + 1;
    byYearLevel[enrollment.yearLevel] = (byYearLevel[enrollment.yearLevel] || 0) + 1;
  });

  return {
    semester: '1st',
    schoolYear: '2024-2025',
    totalEnrolled: currentEnrollments.length,
    byCourse,
    byYearLevel,
  };
}

// ─── Compute Grade Distribution ──────────────────────────────────────────────

function computeGradeDistribution(): GradeDistribution[] {
  const finalizedGrades = gradeRecords.filter(
    (g) =>
      g.status === 'finalized' &&
      g.prelimGrade !== null &&
      g.midtermGrade !== null &&
      g.finalGrade !== null,
  );

  const ranges = [
    { range: '90-100', min: 90, max: 100 },
    { range: '80-89', min: 80, max: 89 },
    { range: '75-79', min: 75, max: 79 },
    { range: '70-74', min: 70, max: 74 },
    { range: 'Below 70', min: 0, max: 69 },
  ];

  const distribution: GradeDistribution[] = ranges.map((r) => {
    const count = finalizedGrades.filter((g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return avg >= r.min && avg <= r.max;
    }).length;

    const percentage = finalizedGrades.length > 0 ? (count / finalizedGrades.length) * 100 : 0;

    return {
      range: r.range,
      count,
      percentage,
    };
  });

  return distribution;
}

// ─── Compute Overall Metrics ──────────────────────────────────────────────────

function computeOverallPassRate(): number {
  const finalizedGrades = gradeRecords.filter(
    (g) =>
      g.status === 'finalized' &&
      g.prelimGrade !== null &&
      g.midtermGrade !== null &&
      g.finalGrade !== null,
  );

  const passCount = finalizedGrades.filter((g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return avg >= 75;
  }).length;

  return finalizedGrades.length > 0 ? (passCount / finalizedGrades.length) * 100 : 0;
}

function computeOverallAttendanceRate(): number {
  const presentOrLate = attendanceRecords.filter(
    (a) => a.status === 'present' || a.status === 'late',
  ).length;

  return attendanceRecords.length > 0
    ? (presentOrLate / attendanceRecords.length) * 100
    : 0;
}

function computeOverallEvaluationAverage(): number | null {
  const submittedEvals = evalRecords.filter((e) => e.status === 'submitted');

  if (submittedEvals.length === 0) return null;

  const totalRating = submittedEvals.reduce((sum, e) => {
    const ratings = e.answers.filter((a) => a.rating !== undefined).map((a) => a.rating!);
    if (ratings.length === 0) return sum;
    const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
    return sum + avg;
  }, 0);

  return totalRating / submittedEvals.length;
}

// ─── Export Dashboard Summary ─────────────────────────────────────────────────

export const dashboardSummary: DashboardSummary = {
  totalStudents: studentProfiles.length,
  totalFaculty: instructors.length,
  totalActiveClasses: facultyLoads.length,
  totalEnrolledThisSemester: enrollmentHistory.filter(
    (e) => e.schoolYear === '2024-2025' && e.semester === '1st' && e.status === 'approved',
  ).length,
  programMetrics: computeProgramMetrics(),
  departmentMetrics: computeDepartmentMetrics(),
  currentEnrollment: computeCurrentEnrollmentMetrics(),
  gradeDistribution: computeGradeDistribution(),
  overallPassRate: computeOverallPassRate(),
  overallAttendanceRate: computeOverallAttendanceRate(),
  overallEvaluationAverage: computeOverallEvaluationAverage(),
};
