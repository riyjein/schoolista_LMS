import { studentProfiles } from '../enrollment/students';
import { gradeRecords } from '../grades/grades';
import { enrollmentHistory } from '../enrollment/enrollment-history';
import { courses } from '../enrollment/courses';
import { subjects } from '../enrollment/subjects';
import { dlRules } from '../grades/dl-rules';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DLStatus = 'summa-cum-laude' | 'magna-cum-laude' | 'cum-laude' | 'not-qualified';

export interface DLCandidate {
  studentId: string;
  studentNumber: string;
  name: string;
  courseId: string;
  courseName: string;
  yearLevel: number;
  semester: string;
  schoolYear: string;
  gpa: number;
  unitLoad: number;
  hasFailing: boolean;
  hasIncomplete: boolean;
  dlStatus: DLStatus;
  qualified: boolean;
  disqualifiers: string[];
}

export interface DLSummary {
  courseId: string;
  courseName: string;
  totalStudents: number;
  summaCumLaude: number;
  magnaCumLaude: number;
  cumLaude: number;
  qualified: number;
  notQualified: number;
  qualificationRate: number;
}

export interface DLTrend {
  semester: string;
  schoolYear: string;
  totalQualified: number;
  summaCumLaude: number;
  magnaCumLaude: number;
  cumLaude: number;
  byCourse: Record<string, number>;
}

// ─── Compute DL Eligibility ───────────────────────────────────────────────────

function computeDLEligibility(studentId: string): DLCandidate | null {
  const student = studentProfiles.find((s) => s.id === studentId);
  if (!student) return null;

  const course = courses.find((c) => c.id === student.courseId);

  // Get current enrollment
  const currentEnrollment = enrollmentHistory.find(
    (e) =>
      e.studentId === studentId &&
      e.schoolYear === '2024-2025' &&
      e.semester === '1st' &&
      e.status === 'approved',
  );

  if (!currentEnrollment) return null;

  // Get finalized grades
  const studentGrades = gradeRecords.filter(
    (g) =>
      g.studentId === studentId &&
      g.status === 'finalized' &&
      g.prelimGrade !== null &&
      g.midtermGrade !== null &&
      g.finalGrade !== null,
  );

  if (studentGrades.length === 0) {
    return {
      studentId,
      studentNumber: student.studentNumber,
      name: student.name,
      courseId: student.courseId,
      courseName: course?.name || 'Unknown',
      yearLevel: student.yearLevel,
      semester: '1st',
      schoolYear: '2024-2025',
      gpa: 0,
      unitLoad: currentEnrollment.totalUnits,
      hasFailing: false,
      hasIncomplete: true,
      dlStatus: 'not-qualified',
      qualified: false,
      disqualifiers: ['No finalized grades'],
    };
  }

  // Compute GPA
  const totalGPA = studentGrades.reduce((sum, g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return sum + avg;
  }, 0);

  const gpa = totalGPA / studentGrades.length;

  // Check for failing grades
  const hasFailing = studentGrades.some((g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return avg < 75;
  });

  // Check for incomplete
  const hasIncomplete = gradeRecords.some(
    (g) =>
      g.studentId === studentId &&
      (g.status === 'draft' || g.prelimGrade === null || g.midtermGrade === null || g.finalGrade === null),
  );

  // Determine DL status and qualification
  const disqualifiers: string[] = [];
  let dlStatus: DLStatus = 'not-qualified';
  let qualified = false;

  if (hasFailing) {
    disqualifiers.push('Has failing grade(s)');
  }

  if (hasIncomplete) {
    disqualifiers.push('Has incomplete grade(s)');
  }

  if (currentEnrollment.totalUnits < dlRules.minUnits) {
    disqualifiers.push(`Unit load below minimum (${dlRules.minUnits} units required)`);
  }

  // GPA thresholds (lower is better in PH grading scale)
  if (disqualifiers.length === 0) {
    if (gpa >= dlRules.summaMaxGPA) {
      dlStatus = 'summa-cum-laude';
      qualified = true;
    } else if (gpa >= dlRules.magnaMaxGPA) {
      dlStatus = 'magna-cum-laude';
      qualified = true;
    } else if (gpa >= dlRules.cumLaudeMaxGPA) {
      dlStatus = 'cum-laude';
      qualified = true;
    } else {
      disqualifiers.push(`GPA below threshold (minimum ${dlRules.cumLaudeMaxGPA} required)`);
    }
  }

  return {
    studentId,
    studentNumber: student.studentNumber,
    name: student.name,
    courseId: student.courseId,
    courseName: course?.name || 'Unknown',
    yearLevel: student.yearLevel,
    semester: '1st',
    schoolYear: '2024-2025',
    gpa,
    unitLoad: currentEnrollment.totalUnits,
    hasFailing,
    hasIncomplete,
    dlStatus,
    qualified,
    disqualifiers,
  };
}

// ─── Generate DL Candidates ───────────────────────────────────────────────────

function generateDLCandidates(): DLCandidate[] {
  const candidates: DLCandidate[] = [];

  studentProfiles.forEach((student) => {
    const candidate = computeDLEligibility(student.id);
    if (candidate) {
      candidates.push(candidate);
    }
  });

  return candidates;
}

// ─── Compute DL Summary by Course ─────────────────────────────────────────────

function computeDLSummaryByCourse(): DLSummary[] {
  const summaries: DLSummary[] = [];

  courses.forEach((course) => {
    const courseCandidates = dlCandidates.filter((c) => c.courseId === course.id);

    const summaCumLaude = courseCandidates.filter((c) => c.dlStatus === 'summa-cum-laude').length;
    const magnaCumLaude = courseCandidates.filter((c) => c.dlStatus === 'magna-cum-laude').length;
    const cumLaude = courseCandidates.filter((c) => c.dlStatus === 'cum-laude').length;
    const qualified = summaCumLaude + magnaCumLaude + cumLaude;
    const notQualified = courseCandidates.filter((c) => !c.qualified).length;

    const qualificationRate =
      courseCandidates.length > 0 ? (qualified / courseCandidates.length) * 100 : 0;

    summaries.push({
      courseId: course.id,
      courseName: course.name,
      totalStudents: courseCandidates.length,
      summaCumLaude,
      magnaCumLaude,
      cumLaude,
      qualified,
      notQualified,
      qualificationRate,
    });
  });

  return summaries;
}

// ─── Compute DL Trend ─────────────────────────────────────────────────────────

function computeDLTrend(): DLTrend[] {
  // For now, we only have data for one semester
  // In a real system, this would aggregate historical data
  const currentSemester = '1st';
  const currentSchoolYear = '2024-2025';

  const summaCumLaude = dlCandidates.filter((c) => c.dlStatus === 'summa-cum-laude').length;
  const magnaCumLaude = dlCandidates.filter((c) => c.dlStatus === 'magna-cum-laude').length;
  const cumLaude = dlCandidates.filter((c) => c.dlStatus === 'cum-laude').length;
  const totalQualified = summaCumLaude + magnaCumLaude + cumLaude;

  const byCourse: Record<string, number> = {};
  courses.forEach((course) => {
    byCourse[course.id] = dlCandidates.filter(
      (c) => c.courseId === course.id && c.qualified,
    ).length;
  });

  return [
    {
      semester: currentSemester,
      schoolYear: currentSchoolYear,
      totalQualified,
      summaCumLaude,
      magnaCumLaude,
      cumLaude,
      byCourse,
    },
  ];
}

// ─── Export Dean's Lister Data ────────────────────────────────────────────────

export const dlCandidates: DLCandidate[] = generateDLCandidates();

export const dlSummaryByCourse: DLSummary[] = computeDLSummaryByCourse();

export const dlTrend: DLTrend[] = computeDLTrend();

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getDLCandidatesByStatus = (status: DLStatus): DLCandidate[] =>
  dlCandidates.filter((c) => c.dlStatus === status);

export const getQualifiedCandidates = (): DLCandidate[] =>
  dlCandidates.filter((c) => c.qualified);

export const getDisqualifiedCandidates = (): DLCandidate[] =>
  dlCandidates.filter((c) => !c.qualified);

export const getDLCandidatesByCourse = (courseId: string): DLCandidate[] =>
  dlCandidates.filter((c) => c.courseId === courseId);

export const getTopPerformers = (limit: number = 10): DLCandidate[] =>
  dlCandidates
    .filter((c) => c.qualified)
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, limit);

export const getDLSummary = (courseId: string): DLSummary | undefined =>
  dlSummaryByCourse.find((s) => s.courseId === courseId);

// ─── Overall Statistics ───────────────────────────────────────────────────────

export const dlOverallStats = {
  totalCandidates: dlCandidates.length,
  totalQualified: dlCandidates.filter((c) => c.qualified).length,
  totalDisqualified: dlCandidates.filter((c) => !c.qualified).length,
  summaCumLaude: dlCandidates.filter((c) => c.dlStatus === 'summa-cum-laude').length,
  magnaCumLaude: dlCandidates.filter((c) => c.dlStatus === 'magna-cum-laude').length,
  cumLaude: dlCandidates.filter((c) => c.dlStatus === 'cum-laude').length,
  qualificationRate:
    dlCandidates.length > 0
      ? (dlCandidates.filter((c) => c.qualified).length / dlCandidates.length) * 100
      : 0,
  averageGPA:
    dlCandidates.length > 0
      ? dlCandidates.reduce((sum, c) => sum + c.gpa, 0) / dlCandidates.length
      : 0,
};
