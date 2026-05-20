import { gradeRecords } from '../grades/grades';
import { attendanceRecords } from '../attendance/attendance-records';
import { evalRecords } from '../evaluation/eval-records';
import { enrollmentHistory } from '../enrollment/enrollment-history';
import { studentProfiles } from '../enrollment/students';
import { courses } from '../enrollment/courses';
import { dlCandidates } from '../program-chair/deans-lister';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProgramPerformance {
  courseId: string;
  courseName: string;
  averageGPA: number | null;
  passRate: number;
  failRate: number;
  attendanceRate: number;
  evaluationAverage: number | null;
  dlCount: number;
  totalStudents: number;
  performanceScore: number | null;
  rank: number;
}

export interface PerformancePeriod {
  semester: string;
  schoolYear: string;
  averageGPA: number | null;
  passRate: number;
  failRate: number;
  attendanceRate: number;
  evaluationAverage: number | null;
  dlCount: number;
}

export interface AttendanceTrend {
  semester: string;
  schoolYear: string;
  attendanceRate: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  totalSessions: number;
}

export type RiskLevel = 'low-risk' | 'moderate-risk' | 'high-risk';

export interface AtRiskProgram {
  courseId: string;
  courseName: string;
  riskLevel: RiskLevel;
  riskFactors: string[];
  averageGPA: number | null;
  failRate: number;
  attendanceRate: number;
}

export interface SchoolPerformance {
  programPerformance: ProgramPerformance[];
  performanceTrend: PerformancePeriod[];
  attendanceTrend: AttendanceTrend[];
  topPerformingPrograms: ProgramPerformance[];
  atRiskPrograms: AtRiskProgram[];
  overallAverageGPA: number | null;
  overallPassRate: number;
  overallAttendanceRate: number;
  overallEvaluationAverage: number | null;
  totalDLStudents: number;
  academicImprovementRate: number;
}

// ─── Compute Program Performance ──────────────────────────────────────────────

function computeProgramPerformance(): ProgramPerformance[] {
  const performance: ProgramPerformance[] = [];

  courses.forEach((course) => {
    const courseStudents = studentProfiles.filter((s) => s.courseId === course.id);
    const studentIds = courseStudents.map((s) => s.id);

    // Compute average GPA
    const studentGrades = gradeRecords.filter(
      (g) =>
        studentIds.includes(g.studentId) &&
        g.status === 'finalized' &&
        g.prelimGrade !== null &&
        g.midtermGrade !== null &&
        g.finalGrade !== null,
    );

    let averageGPA: number | null = null;
    if (studentGrades.length > 0) {
      const totalGPA = studentGrades.reduce((sum, g) => {
        const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
        return sum + avg;
      }, 0);
      averageGPA = totalGPA / studentGrades.length;
    }

    // Compute pass/fail rates
    const passCount = studentGrades.filter((g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return avg >= 75;
    }).length;

    const failCount = studentGrades.filter((g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return avg < 75;
    }).length;

    const passRate = studentGrades.length > 0 ? (passCount / studentGrades.length) * 100 : 0;
    const failRate = studentGrades.length > 0 ? (failCount / studentGrades.length) * 100 : 0;

    // Compute attendance rate
    const courseAttendance = attendanceRecords.filter((a) => studentIds.includes(a.studentId));
    const presentOrLate = courseAttendance.filter(
      (a) => a.status === 'present' || a.status === 'late',
    ).length;
    const attendanceRate =
      courseAttendance.length > 0 ? (presentOrLate / courseAttendance.length) * 100 : 0;

    // Compute evaluation average
    const courseEvals = evalRecords.filter(
      (e) => e.status === 'submitted' && studentIds.includes(e.studentId),
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

    // Get DL count
    const dlCount = dlCandidates.filter((c) => c.courseId === course.id && c.qualified).length;

    // Compute overall performance score (0-100)
    let performanceScore: number | null = null;
    if (averageGPA !== null && evaluationAverage !== null) {
      const gpaScore = (averageGPA / 100) * 40; // 40% weight
      const passRateScore = (passRate / 100) * 30; // 30% weight
      const attendanceScore = (attendanceRate / 100) * 20; // 20% weight
      const evalScore = (evaluationAverage / 5) * 10; // 10% weight

      performanceScore = gpaScore + passRateScore + attendanceScore + evalScore;
    }

    performance.push({
      courseId: course.id,
      courseName: course.name,
      averageGPA,
      passRate,
      failRate,
      attendanceRate,
      evaluationAverage,
      dlCount,
      totalStudents: courseStudents.length,
      performanceScore,
      rank: 0, // Will be set after sorting
    });
  });

  // Sort by performance score and assign ranks
  performance.sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
  performance.forEach((p, index) => {
    p.rank = index + 1;
  });

  return performance;
}

// ─── Compute Performance Trend ────────────────────────────────────────────────

function computePerformanceTrend(): PerformancePeriod[] {
  // For now we only have current semester data
  // In a real system, this would aggregate historical data

  const currentSemester = '1st';
  const currentSchoolYear = '2024-2025';

  const currentGrades = gradeRecords.filter(
    (g) =>
      g.schoolYear === currentSchoolYear &&
      g.semester === currentSemester &&
      g.status === 'finalized' &&
      g.prelimGrade !== null &&
      g.midtermGrade !== null &&
      g.finalGrade !== null,
  );

  const currentTotalGPA = currentGrades.reduce((sum, g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return sum + avg;
  }, 0);

  const currentAverageGPA =
    currentGrades.length > 0 ? currentTotalGPA / currentGrades.length : null;

  const currentPassCount = currentGrades.filter((g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return avg >= 75;
  }).length;

  const currentPassRate =
    currentGrades.length > 0 ? (currentPassCount / currentGrades.length) * 100 : 0;
  const currentFailRate = 100 - currentPassRate;

  const currentAttendance = attendanceRecords;
  const currentPresentOrLate = currentAttendance.filter(
    (a) => a.status === 'present' || a.status === 'late',
  ).length;
  const currentAttendanceRate =
    currentAttendance.length > 0 ? (currentPresentOrLate / currentAttendance.length) * 100 : 0;

  const currentEvals = evalRecords.filter((e) => e.status === 'submitted');
  const currentEvalTotal = currentEvals.reduce((sum, e) => {
    const ratings = e.answers.filter((a) => a.rating !== undefined).map((a) => a.rating!);
    if (ratings.length === 0) return sum;
    const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
    return sum + avg;
  }, 0);

  const currentEvaluationAverage =
    currentEvals.length > 0 ? currentEvalTotal / currentEvals.length : null;

  const currentDLCount = dlCandidates.filter((c) => c.qualified).length;

  const currentPeriod: PerformancePeriod = {
    semester: currentSemester,
    schoolYear: currentSchoolYear,
    averageGPA: currentAverageGPA,
    passRate: currentPassRate,
    failRate: currentFailRate,
    attendanceRate: currentAttendanceRate,
    evaluationAverage: currentEvaluationAverage,
    dlCount: currentDLCount,
  };

  // Simulate previous period for trend
  const previousPeriod: PerformancePeriod = {
    semester: '2nd',
    schoolYear: '2023-2024',
    averageGPA: currentAverageGPA ? currentAverageGPA - 2 : null,
    passRate: currentPassRate - 3,
    failRate: currentFailRate + 3,
    attendanceRate: currentAttendanceRate - 1.5,
    evaluationAverage: currentEvaluationAverage ? currentEvaluationAverage - 0.2 : null,
    dlCount: Math.floor(currentDLCount * 0.85),
  };

  return [previousPeriod, currentPeriod];
}

// ─── Compute Attendance Trend ─────────────────────────────────────────────────

function computeAttendanceTrend(): AttendanceTrend[] {
  const currentSemester = '1st';
  const currentSchoolYear = '2024-2025';

  const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
  const lateCount = attendanceRecords.filter((a) => a.status === 'late').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'absent').length;
  const totalSessions = attendanceRecords.length;

  const attendanceRate =
    totalSessions > 0 ? ((presentCount + lateCount) / totalSessions) * 100 : 0;

  const currentTrend: AttendanceTrend = {
    semester: currentSemester,
    schoolYear: currentSchoolYear,
    attendanceRate,
    presentCount,
    lateCount,
    absentCount,
    totalSessions,
  };

  // Simulate previous period
  const previousTrend: AttendanceTrend = {
    semester: '2nd',
    schoolYear: '2023-2024',
    attendanceRate: attendanceRate - 2,
    presentCount: Math.floor(presentCount * 0.95),
    lateCount: Math.floor(lateCount * 1.1),
    absentCount: Math.floor(absentCount * 1.15),
    totalSessions: Math.floor(totalSessions * 0.98),
  };

  return [previousTrend, currentTrend];
}

// ─── Identify At-Risk Programs ────────────────────────────────────────────────

function identifyAtRiskPrograms(): AtRiskProgram[] {
  const programPerformance = computeProgramPerformance();
  const atRisk: AtRiskProgram[] = [];

  programPerformance.forEach((program) => {
    const riskFactors: string[] = [];
    let riskLevel: RiskLevel = 'low-risk';

    if (program.averageGPA !== null && program.averageGPA < 75) {
      riskFactors.push('Low average GPA (below 75)');
    }

    if (program.failRate > 20) {
      riskFactors.push(`High failure rate (${program.failRate.toFixed(1)}%)`);
    }

    if (program.attendanceRate < 80) {
      riskFactors.push(`Low attendance rate (${program.attendanceRate.toFixed(1)}%)`);
    }

    if (program.evaluationAverage !== null && program.evaluationAverage < 3.0) {
      riskFactors.push('Low faculty evaluation ratings');
    }

    if (riskFactors.length >= 3) {
      riskLevel = 'high-risk';
    } else if (riskFactors.length >= 2) {
      riskLevel = 'moderate-risk';
    } else if (riskFactors.length >= 1) {
      riskLevel = 'low-risk';
    }

    if (riskFactors.length > 0) {
      atRisk.push({
        courseId: program.courseId,
        courseName: program.courseName,
        riskLevel,
        riskFactors,
        averageGPA: program.averageGPA,
        failRate: program.failRate,
        attendanceRate: program.attendanceRate,
      });
    }
  });

  // Sort by risk level (high first)
  const riskOrder = { 'high-risk': 1, 'moderate-risk': 2, 'low-risk': 3 };
  atRisk.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

  return atRisk;
}

// ─── Generate School Performance ──────────────────────────────────────────────

function generateSchoolPerformance(): SchoolPerformance {
  const programPerformance = computeProgramPerformance();
  const performanceTrend = computePerformanceTrend();
  const currentPeriod = performanceTrend[performanceTrend.length - 1];
  const previousPeriod = performanceTrend[0];

  const topPerformingPrograms = programPerformance.slice(0, 3);

  const academicImprovementRate =
    currentPeriod.averageGPA !== null && previousPeriod.averageGPA !== null
      ? ((currentPeriod.averageGPA - previousPeriod.averageGPA) / previousPeriod.averageGPA) * 100
      : 0;

  return {
    programPerformance,
    performanceTrend,
    attendanceTrend: computeAttendanceTrend(),
    topPerformingPrograms,
    atRiskPrograms: identifyAtRiskPrograms(),
    overallAverageGPA: currentPeriod.averageGPA,
    overallPassRate: currentPeriod.passRate,
    overallAttendanceRate: currentPeriod.attendanceRate,
    overallEvaluationAverage: currentPeriod.evaluationAverage,
    totalDLStudents: currentPeriod.dlCount,
    academicImprovementRate,
  };
}

// ─── Export School Performance ────────────────────────────────────────────────

export const schoolPerformance: SchoolPerformance = generateSchoolPerformance();

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getProgramPerformance = (courseId: string): ProgramPerformance | undefined =>
  schoolPerformance.programPerformance.find((p) => p.courseId === courseId);

export const getTopPerformers = (limit: number = 5): ProgramPerformance[] =>
  schoolPerformance.programPerformance.slice(0, limit);

export const getBottomPerformers = (limit: number = 5): ProgramPerformance[] =>
  schoolPerformance.programPerformance.slice(-limit).reverse();

export const getHighRiskPrograms = (): AtRiskProgram[] =>
  schoolPerformance.atRiskPrograms.filter((p) => p.riskLevel === 'high-risk');

export const getGPATrend = (): (number | null)[] =>
  schoolPerformance.performanceTrend.map((p) => p.averageGPA);

export const getPassRateTrend = (): number[] =>
  schoolPerformance.performanceTrend.map((p) => p.passRate);
