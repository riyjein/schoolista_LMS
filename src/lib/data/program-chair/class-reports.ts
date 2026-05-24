import { classOfferings } from '../attendance/class-offerings';
import { subjects } from '../enrollment/subjects';
import { instructors } from '../attendance/instructors';
import { gradeRecords } from '../grades/grades';
import { attendanceRecords } from '../attendance/attendance-records';
import { enrollmentHistory } from '../enrollment/enrollment-history';
import { studentProfiles } from '../enrollment/students';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClassReport {
  classId: string;
  subjectId: string;
  subjectCode: string;
  subjectTitle: string;
  subjectUnits: number;
  sectionCode: string;
  instructorId: string;
  instructorName: string;
  room: string;
  schoolYear: string;
  semester: string;
  enrolledStudents: number;
  maxStudents: number;
  enrollmentRate: number;
  averageGrade: number | null;
  passRate: number;
  failRate: number;
  attendanceRate: number;
  dropoutCount: number;
  completionRate: number;
  performanceRank: number;
  difficultyIndicator: 'easy' | 'moderate' | 'hard' | 'very-hard';
}

export interface PerformanceRanking {
  classId: string;
  subjectCode: string;
  sectionCode: string;
  averageGrade: number;
  rank: number;
}

export interface ClassComparison {
  hardestClasses: ClassReport[];
  easiestClasses: ClassReport[];
  highestAttendance: ClassReport[];
  lowestAttendance: ClassReport[];
}

// ─── Compute Class Reports ───────────────────────────────────────────────────

function computeClassReport(classId: string): ClassReport {
  const classOffering = classOfferings.find((c) => c.id === classId);
  if (!classOffering) {
    throw new Error(`Class offering not found: ${classId}`);
  }

  const subject = subjects.find((s) => s.id === classOffering.subjectId);
  const instructor = instructors.find((i) => i.id === classOffering.instructorId);

  // Get grades for this class
  const classGrades = gradeRecords.filter((g) => g.classId === classId);
  const finalizedGrades = classGrades.filter(
    (g) =>
      g.status === 'finalized' &&
      g.prelimGrade !== null &&
      g.midtermGrade !== null &&
      g.finalGrade !== null,
  );

  // Compute average grade
  let averageGrade: number | null = null;
  if (finalizedGrades.length > 0) {
    const total = finalizedGrades.reduce((sum, g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return sum + avg;
    }, 0);
    averageGrade = total / finalizedGrades.length;
  }

  // Compute pass/fail rates
  const passCount = finalizedGrades.filter((g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return avg >= 75;
  }).length;

  const failCount = finalizedGrades.filter((g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return avg < 75;
  }).length;

  const passRate = finalizedGrades.length > 0 ? (passCount / finalizedGrades.length) * 100 : 0;
  const failRate = finalizedGrades.length > 0 ? (failCount / finalizedGrades.length) * 100 : 0;

  // Compute attendance rate
  const classAttendance = attendanceRecords.filter((a) => a.classId === classId);
  const presentOrLate = classAttendance.filter(
    (a) => a.status === 'present' || a.status === 'late',
  ).length;
  const attendanceRate =
    classAttendance.length > 0 ? (presentOrLate / classAttendance.length) * 100 : 0;

  // Compute dropout count (students who were enrolled but have no finalized grades)
  const enrolledStudentIds = classOffering.enrolledStudentIds;
  const dropoutCount = enrolledStudentIds.filter((studentId) => {
    const studentGrade = gradeRecords.find(
      (g) => g.classId === classId && g.studentId === studentId && g.status === 'finalized',
    );
    return !studentGrade;
  }).length;

  const completionRate =
    enrolledStudentIds.length > 0
      ? ((enrolledStudentIds.length - dropoutCount) / enrolledStudentIds.length) * 100
      : 0;

  // Enrollment rate
  const enrollmentRate = (enrolledStudentIds.length / classOffering.maxStudents) * 100;

  // Difficulty indicator based on average grade and fail rate
  let difficultyIndicator: 'easy' | 'moderate' | 'hard' | 'very-hard';
  if (averageGrade === null) {
    difficultyIndicator = 'moderate';
  } else if (averageGrade >= 85 && failRate < 10) {
    difficultyIndicator = 'easy';
  } else if (averageGrade >= 80 && failRate < 20) {
    difficultyIndicator = 'moderate';
  } else if (averageGrade >= 75 && failRate < 30) {
    difficultyIndicator = 'hard';
  } else {
    difficultyIndicator = 'very-hard';
  }

  return {
    classId,
    subjectId: classOffering.subjectId,
    subjectCode: subject?.code || 'N/A',
    subjectTitle: subject?.title || 'Unknown',
    subjectUnits: subject?.units || 0,
    sectionCode: classOffering.sectionCode,
    instructorId: classOffering.instructorId,
    instructorName: instructor?.name || 'Unknown',
    room: classOffering.room,
    schoolYear: classOffering.schoolYear,
    semester: classOffering.semester,
    enrolledStudents: enrolledStudentIds.length,
    maxStudents: classOffering.maxStudents,
    enrollmentRate,
    averageGrade,
    passRate,
    failRate,
    attendanceRate,
    dropoutCount,
    completionRate,
    performanceRank: 0, // Will be computed separately
    difficultyIndicator,
  };
}

// ─── Generate All Class Reports ──────────────────────────────────────────────

function generateAllClassReports(): ClassReport[] {
  const reports = classOfferings.map((c) => computeClassReport(c.id));

  // Compute performance rankings
  const sortedByGrade = [...reports]
    .filter((r) => r.averageGrade !== null)
    .sort((a, b) => b.averageGrade! - a.averageGrade!);

  sortedByGrade.forEach((report, index) => {
    const original = reports.find((r) => r.classId === report.classId);
    if (original) {
      original.performanceRank = index + 1;
    }
  });

  return reports;
}

// ─── Compute Performance Rankings ─────────────────────────────────────────────

function computePerformanceRankings(): PerformanceRanking[] {
  const reports = classReports.filter((r) => r.averageGrade !== null);

  return reports
    .sort((a, b) => b.averageGrade! - a.averageGrade!)
    .map((report, index) => ({
      classId: report.classId,
      subjectCode: report.subjectCode,
      sectionCode: report.sectionCode,
      averageGrade: report.averageGrade!,
      rank: index + 1,
    }));
}

// ─── Compute Class Comparisons ────────────────────────────────────────────────

function computeClassComparison(): ClassComparison {
  const validReports = classReports.filter((r) => r.averageGrade !== null);

  const sortedByGrade = [...validReports].sort((a, b) => b.averageGrade! - a.averageGrade!);
  const sortedByAttendance = [...classReports].sort(
    (a, b) => b.attendanceRate - a.attendanceRate,
  );

  return {
    hardestClasses: sortedByGrade.slice(-3).reverse(),
    easiestClasses: sortedByGrade.slice(0, 3),
    highestAttendance: sortedByAttendance.slice(0, 3),
    lowestAttendance: sortedByAttendance.slice(-3).reverse(),
  };
}

// ─── Export Class Reports ─────────────────────────────────────────────────────

export const classReports: ClassReport[] = generateAllClassReports();

export const performanceRankings: PerformanceRanking[] = computePerformanceRankings();

export const classComparison: ClassComparison = computeClassComparison();

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getClassReport = (classId: string): ClassReport | undefined =>
  classReports.find((r) => r.classId === classId);

export const getClassReportsBySubject = (subjectId: string): ClassReport[] =>
  classReports.filter((r) => r.subjectId === subjectId);

export const getClassReportsByInstructor = (instructorId: string): ClassReport[] =>
  classReports.filter((r) => r.instructorId === instructorId);

export const getClassReportsBySection = (sectionCode: string): ClassReport[] =>
  classReports.filter((r) => r.sectionCode === sectionCode);

export const getClassReportsByDifficulty = (
  difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard',
): ClassReport[] => classReports.filter((r) => r.difficultyIndicator === difficulty);

export const getTopPerformingClasses = (limit: number = 5): ClassReport[] =>
  classReports
    .filter((r) => r.averageGrade !== null)
    .sort((a, b) => b.averageGrade! - a.averageGrade!)
    .slice(0, limit);

export const getBottomPerformingClasses = (limit: number = 5): ClassReport[] =>
  classReports
    .filter((r) => r.averageGrade !== null)
    .sort((a, b) => a.averageGrade! - b.averageGrade!)
    .slice(0, limit);
