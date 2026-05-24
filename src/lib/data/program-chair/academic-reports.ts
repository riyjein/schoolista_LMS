import { gradeRecords } from '../grades/grades';
import { enrollmentHistory } from '../enrollment/enrollment-history';
import { subjects } from '../enrollment/subjects';
import { studentProfiles } from '../enrollment/students';
import { courses } from '../enrollment/courses';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GPADistribution {
  range: string;
  minGPA: number;
  maxGPA: number;
  count: number;
  percentage: number;
}

export interface GradeDistributionBySubject {
  subjectId: string;
  subjectCode: string;
  subjectTitle: string;
  totalStudents: number;
  gradeRanges: {
    range: string;
    count: number;
    percentage: number;
  }[];
  averageGrade: number | null;
  passRate: number;
}

export interface PassFailRate {
  subjectId: string;
  subjectCode: string;
  subjectTitle: string;
  totalStudents: number;
  passed: number;
  failed: number;
  incomplete: number;
  passRate: number;
  failRate: number;
}

export interface UnitLoadDistribution {
  range: string;
  minUnits: number;
  maxUnits: number;
  count: number;
  percentage: number;
}

export type AcademicStanding = 'good-standing' | 'probation' | 'failed';

export interface AcademicStandingBreakdown {
  standing: AcademicStanding;
  count: number;
  percentage: number;
  students: {
    studentId: string;
    studentNumber: string;
    name: string;
    gpa: number | null;
    failedSubjects: number;
  }[];
}

export interface CourseReport {
  courseId: string;
  courseName: string;
  yearLevel?: number;
  semester?: string;
  schoolYear?: string;
  gpaDistribution: GPADistribution[];
  gradesBySubject: GradeDistributionBySubject[];
  passFailRates: PassFailRate[];
  unitLoadDistribution: UnitLoadDistribution[];
  academicStandingBreakdown: AcademicStandingBreakdown[];
  averageGPA: number | null;
  totalStudents: number;
}

// ─── Compute GPA Distribution ─────────────────────────────────────────────────

function computeGPADistribution(studentIds: string[]): GPADistribution[] {
  const studentGPAs: number[] = [];

  studentIds.forEach((studentId) => {
    const studentGrades = gradeRecords.filter(
      (g) =>
        g.studentId === studentId &&
        g.status === 'finalized' &&
        g.prelimGrade !== null &&
        g.midtermGrade !== null &&
        g.finalGrade !== null,
    );

    if (studentGrades.length === 0) return;

    const totalGPA = studentGrades.reduce((sum, g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return sum + avg;
    }, 0);

    const gpa = totalGPA / studentGrades.length;
    studentGPAs.push(gpa);
  });

  const ranges = [
    { range: '90-100 (1.00-1.25)', minGPA: 90, maxGPA: 100 },
    { range: '85-89 (1.50-1.75)', minGPA: 85, maxGPA: 89 },
    { range: '80-84 (2.00-2.25)', minGPA: 80, maxGPA: 84 },
    { range: '75-79 (2.50-3.00)', minGPA: 75, maxGPA: 79 },
    { range: 'Below 75 (Failed)', minGPA: 0, maxGPA: 74 },
  ];

  const distribution: GPADistribution[] = ranges.map((r) => {
    const count = studentGPAs.filter((gpa) => gpa >= r.minGPA && gpa <= r.maxGPA).length;
    const percentage = studentGPAs.length > 0 ? (count / studentGPAs.length) * 100 : 0;

    return {
      range: r.range,
      minGPA: r.minGPA,
      maxGPA: r.maxGPA,
      count,
      percentage,
    };
  });

  return distribution;
}

// ─── Compute Grade Distribution by Subject ───────────────────────────────────

function computeGradeDistributionBySubject(subjectId: string): GradeDistributionBySubject {
  const subject = subjects.find((s) => s.id === subjectId);
  const subjectGrades = gradeRecords.filter(
    (g) =>
      g.subjectId === subjectId &&
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

  const gradeRanges = ranges.map((r) => {
    const count = subjectGrades.filter((g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return avg >= r.min && avg <= r.max;
    }).length;

    const percentage = subjectGrades.length > 0 ? (count / subjectGrades.length) * 100 : 0;

    return {
      range: r.range,
      count,
      percentage,
    };
  });

  let averageGrade: number | null = null;
  if (subjectGrades.length > 0) {
    const total = subjectGrades.reduce((sum, g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return sum + avg;
    }, 0);
    averageGrade = total / subjectGrades.length;
  }

  const passCount = subjectGrades.filter((g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return avg >= 75;
  }).length;

  const passRate = subjectGrades.length > 0 ? (passCount / subjectGrades.length) * 100 : 0;

  return {
    subjectId,
    subjectCode: subject?.code || 'N/A',
    subjectTitle: subject?.title || 'Unknown',
    totalStudents: subjectGrades.length,
    gradeRanges,
    averageGrade,
    passRate,
  };
}

// ─── Compute Pass/Fail Rates ──────────────────────────────────────────────────

function computePassFailRates(subjectId: string): PassFailRate {
  const subject = subjects.find((s) => s.id === subjectId);
  const subjectGrades = gradeRecords.filter((g) => g.subjectId === subjectId);

  const finalized = subjectGrades.filter(
    (g) =>
      g.status === 'finalized' &&
      g.prelimGrade !== null &&
      g.midtermGrade !== null &&
      g.finalGrade !== null,
  );

  const passed = finalized.filter((g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return avg >= 75;
  }).length;

  const failed = finalized.filter((g) => {
    const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
    return avg < 75;
  }).length;

  const incomplete = subjectGrades.filter(
    (g) =>
      g.status === 'draft' ||
      g.prelimGrade === null ||
      g.midtermGrade === null ||
      g.finalGrade === null,
  ).length;

  const passRate = finalized.length > 0 ? (passed / finalized.length) * 100 : 0;
  const failRate = finalized.length > 0 ? (failed / finalized.length) * 100 : 0;

  return {
    subjectId,
    subjectCode: subject?.code || 'N/A',
    subjectTitle: subject?.title || 'Unknown',
    totalStudents: subjectGrades.length,
    passed,
    failed,
    incomplete,
    passRate,
    failRate,
  };
}

// ─── Compute Unit Load Distribution ──────────────────────────────────────────

function computeUnitLoadDistribution(courseId: string): UnitLoadDistribution[] {
  const courseEnrollments = enrollmentHistory.filter(
    (e) => e.courseId === courseId && e.status === 'approved',
  );

  const ranges = [
    { range: '21+ units (Overload)', minUnits: 21, maxUnits: 30 },
    { range: '18-20 units', minUnits: 18, maxUnits: 20 },
    { range: '15-17 units', minUnits: 15, maxUnits: 17 },
    { range: 'Below 15 units (Underload)', minUnits: 0, maxUnits: 14 },
  ];

  const distribution: UnitLoadDistribution[] = ranges.map((r) => {
    const count = courseEnrollments.filter(
      (e) => e.totalUnits >= r.minUnits && e.totalUnits <= r.maxUnits,
    ).length;

    const percentage =
      courseEnrollments.length > 0 ? (count / courseEnrollments.length) * 100 : 0;

    return {
      range: r.range,
      minUnits: r.minUnits,
      maxUnits: r.maxUnits,
      count,
      percentage,
    };
  });

  return distribution;
}

// ─── Compute Academic Standing Breakdown ──────────────────────────────────────

function computeAcademicStandingBreakdown(courseId: string): AcademicStandingBreakdown[] {
  const courseStudents = studentProfiles.filter((s) => s.courseId === courseId);

  const standings: Record<AcademicStanding, AcademicStandingBreakdown> = {
    'good-standing': { standing: 'good-standing', count: 0, percentage: 0, students: [] },
    probation: { standing: 'probation', count: 0, percentage: 0, students: [] },
    failed: { standing: 'failed', count: 0, percentage: 0, students: [] },
  };

  courseStudents.forEach((student) => {
    const studentGrades = gradeRecords.filter(
      (g) =>
        g.studentId === student.id &&
        g.status === 'finalized' &&
        g.prelimGrade !== null &&
        g.midtermGrade !== null &&
        g.finalGrade !== null,
    );

    if (studentGrades.length === 0) return;

    const totalGPA = studentGrades.reduce((sum, g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return sum + avg;
    }, 0);

    const gpa = totalGPA / studentGrades.length;

    const failedSubjects = studentGrades.filter((g) => {
      const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
      return avg < 75;
    }).length;

    let standing: AcademicStanding;
    if (failedSubjects > 0) {
      standing = 'failed';
    } else if (gpa < 80) {
      standing = 'probation';
    } else {
      standing = 'good-standing';
    }

    standings[standing].count += 1;
    standings[standing].students.push({
      studentId: student.id,
      studentNumber: student.studentNumber,
      name: student.name,
      gpa,
      failedSubjects,
    });
  });

  const total = courseStudents.length;

  return Object.values(standings).map((s) => ({
    ...s,
    percentage: total > 0 ? (s.count / total) * 100 : 0,
  }));
}

// ─── Generate Course Reports ──────────────────────────────────────────────────

function generateCourseReports(): CourseReport[] {
  const reports: CourseReport[] = [];

  courses.forEach((course) => {
    const courseStudents = studentProfiles.filter((s) => s.courseId === course.id);
    const studentIds = courseStudents.map((s) => s.id);

    // Get unique subjects taken by course students
    const subjectIds = new Set<string>();
    gradeRecords
      .filter((g) => studentIds.includes(g.studentId))
      .forEach((g) => subjectIds.add(g.subjectId));

    const gradesBySubject = Array.from(subjectIds).map((subjectId) =>
      computeGradeDistributionBySubject(subjectId),
    );

    const passFailRates = Array.from(subjectIds).map((subjectId) =>
      computePassFailRates(subjectId),
    );

    // Compute average GPA for course
    const studentGPAs: number[] = [];
    studentIds.forEach((studentId) => {
      const studentGrades = gradeRecords.filter(
        (g) =>
          g.studentId === studentId &&
          g.status === 'finalized' &&
          g.prelimGrade !== null &&
          g.midtermGrade !== null &&
          g.finalGrade !== null,
      );

      if (studentGrades.length === 0) return;

      const totalGPA = studentGrades.reduce((sum, g) => {
        const avg = (g.prelimGrade! + g.midtermGrade! + g.finalGrade!) / 3;
        return sum + avg;
      }, 0);

      studentGPAs.push(totalGPA / studentGrades.length);
    });

    const averageGPA =
      studentGPAs.length > 0
        ? studentGPAs.reduce((sum, gpa) => sum + gpa, 0) / studentGPAs.length
        : null;

    reports.push({
      courseId: course.id,
      courseName: course.name,
      gpaDistribution: computeGPADistribution(studentIds),
      gradesBySubject,
      passFailRates,
      unitLoadDistribution: computeUnitLoadDistribution(course.id),
      academicStandingBreakdown: computeAcademicStandingBreakdown(course.id),
      averageGPA,
      totalStudents: courseStudents.length,
    });
  });

  return reports;
}

// ─── Export Academic Reports ──────────────────────────────────────────────────

export const academicReports: CourseReport[] = generateCourseReports();

export const getReportByCourse = (courseId: string): CourseReport | undefined =>
  academicReports.find((r) => r.courseId === courseId);

export const getReportsByFilter = (filters: {
  courseId?: string;
  yearLevel?: number;
  semester?: string;
  schoolYear?: string;
}): CourseReport[] => {
  return academicReports.filter((report) => {
    if (filters.courseId && report.courseId !== filters.courseId) return false;
    if (filters.yearLevel && report.yearLevel !== filters.yearLevel) return false;
    if (filters.semester && report.semester !== filters.semester) return false;
    if (filters.schoolYear && report.schoolYear !== filters.schoolYear) return false;
    return true;
  });
};
