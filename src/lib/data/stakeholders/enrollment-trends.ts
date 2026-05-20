import { enrollmentHistory } from '../enrollment/enrollment-history';
import { studentProfiles } from '../enrollment/students';
import { courses } from '../enrollment/courses';
import { subjects } from '../enrollment/subjects';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnrollmentPeriod {
  semester: string;
  schoolYear: string;
  totalEnrolled: number;
  newEnrollments: number;
  reEnrollments: number;
  growthRate: number; // percentage change from previous period
  dropoutCount: number;
  retentionRate: number;
}

export interface CoursePopularity {
  courseId: string;
  courseName: string;
  totalEnrolled: number;
  growthRate: number;
  rank: number;
}

export interface YearLevelDistribution {
  yearLevel: number;
  count: number;
  percentage: number;
}

export interface SubjectDemand {
  subjectId: string;
  subjectCode: string;
  subjectTitle: string;
  enrollmentCount: number;
  popularity: 'high' | 'medium' | 'low';
}

export interface EnrollmentTrends {
  periods: EnrollmentPeriod[];
  currentPeriod: EnrollmentPeriod;
  coursePopularity: CoursePopularity[];
  yearLevelDistribution: YearLevelDistribution[];
  subjectDemand: SubjectDemand[];
  overallGrowthRate: number;
  totalDropouts: number;
  averageRetentionRate: number;
}

// ─── Compute Enrollment Periods ───────────────────────────────────────────────

function computeEnrollmentPeriods(): EnrollmentPeriod[] {
  // Group enrollments by semester and school year
  const periodMap = new Map<string, typeof enrollmentHistory>();

  enrollmentHistory.forEach((enrollment) => {
    const key = `${enrollment.schoolYear}-${enrollment.semester}`;
    if (!periodMap.has(key)) {
      periodMap.set(key, []);
    }
    periodMap.get(key)!.push(enrollment);
  });

  // Sort periods chronologically
  const sortedPeriods = Array.from(periodMap.entries()).sort((a, b) => {
    const [yearA, semA] = a[0].split('-');
    const [yearB, semB] = b[0].split('-');

    if (yearA !== yearB) return yearA.localeCompare(yearB);

    const semOrder = { '1st': 1, '2nd': 2, 'Summer': 3 };
    return semOrder[semA as keyof typeof semOrder] - semOrder[semB as keyof typeof semOrder];
  });

  const periods: EnrollmentPeriod[] = [];
  let previousTotal = 0;

  sortedPeriods.forEach(([key, enrollments], index) => {
    const [schoolYear, semester] = key.split('-');
    const approvedEnrollments = enrollments.filter((e) => e.status === 'approved');

    // Count new vs re-enrollments
    const studentIds = approvedEnrollments.map((e) => e.studentId);
    const uniqueStudents = new Set(studentIds);

    let newEnrollments = 0;
    let reEnrollments = 0;

    uniqueStudents.forEach((studentId) => {
      const priorEnrollments = enrollmentHistory.filter(
        (e) =>
          e.studentId === studentId &&
          e.status === 'approved' &&
          (e.schoolYear < schoolYear ||
            (e.schoolYear === schoolYear && e.semester < semester)),
      );

      if (priorEnrollments.length === 0) {
        newEnrollments++;
      } else {
        reEnrollments++;
      }
    });

    const totalEnrolled = uniqueStudents.size;

    // Compute growth rate
    const growthRate =
      previousTotal > 0 ? ((totalEnrolled - previousTotal) / previousTotal) * 100 : 0;

    // Compute dropout count (students who were enrolled previously but not in current period)
    let dropoutCount = 0;
    if (index > 0) {
      const previousPeriodStudents = new Set(
        sortedPeriods[index - 1][1]
          .filter((e) => e.status === 'approved')
          .map((e) => e.studentId),
      );

      previousPeriodStudents.forEach((prevStudentId) => {
        if (!studentIds.includes(prevStudentId)) {
          dropoutCount++;
        }
      });
    }

    const retentionRate =
      previousTotal > 0 ? ((totalEnrolled - newEnrollments) / previousTotal) * 100 : 100;

    periods.push({
      semester,
      schoolYear,
      totalEnrolled,
      newEnrollments,
      reEnrollments,
      growthRate,
      dropoutCount,
      retentionRate,
    });

    previousTotal = totalEnrolled;
  });

  return periods;
}

// ─── Compute Course Popularity ────────────────────────────────────────────────

function computeCoursePopularity(): CoursePopularity[] {
  const currentEnrollments = enrollmentHistory.filter(
    (e) => e.schoolYear === '2024-2025' && e.semester === '1st' && e.status === 'approved',
  );

  const previousEnrollments = enrollmentHistory.filter(
    (e) => e.schoolYear === '2023-2024' && e.semester === '2nd' && e.status === 'approved',
  );

  const courseCounts = new Map<string, number>();
  const previousCourseCounts = new Map<string, number>();

  currentEnrollments.forEach((enrollment) => {
    courseCounts.set(enrollment.courseId, (courseCounts.get(enrollment.courseId) || 0) + 1);
  });

  previousEnrollments.forEach((enrollment) => {
    previousCourseCounts.set(
      enrollment.courseId,
      (previousCourseCounts.get(enrollment.courseId) || 0) + 1,
    );
  });

  const popularity: CoursePopularity[] = courses.map((course) => {
    const current = courseCounts.get(course.id) || 0;
    const previous = previousCourseCounts.get(course.id) || 0;
    const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return {
      courseId: course.id,
      courseName: course.name,
      totalEnrolled: current,
      growthRate,
      rank: 0, // Will be set after sorting
    };
  });

  // Sort by total enrolled and assign ranks
  popularity.sort((a, b) => b.totalEnrolled - a.totalEnrolled);
  popularity.forEach((item, index) => {
    item.rank = index + 1;
  });

  return popularity;
}

// ─── Compute Year Level Distribution ──────────────────────────────────────────

function computeYearLevelDistribution(): YearLevelDistribution[] {
  const currentEnrollments = enrollmentHistory.filter(
    (e) => e.schoolYear === '2024-2025' && e.semester === '1st' && e.status === 'approved',
  );

  const yearLevelCounts = new Map<number, number>();

  currentEnrollments.forEach((enrollment) => {
    yearLevelCounts.set(
      enrollment.yearLevel,
      (yearLevelCounts.get(enrollment.yearLevel) || 0) + 1,
    );
  });

  const total = currentEnrollments.length;
  const distribution: YearLevelDistribution[] = [];

  [1, 2, 3, 4].forEach((yearLevel) => {
    const count = yearLevelCounts.get(yearLevel) || 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;

    distribution.push({
      yearLevel,
      count,
      percentage,
    });
  });

  return distribution;
}

// ─── Compute Subject Demand ───────────────────────────────────────────────────

function computeSubjectDemand(): SubjectDemand[] {
  const currentEnrollments = enrollmentHistory.filter(
    (e) => e.schoolYear === '2024-2025' && e.semester === '1st' && e.status === 'approved',
  );

  const subjectCounts = new Map<string, number>();

  currentEnrollments.forEach((enrollment) => {
    enrollment.subjectIds.forEach((subjectId) => {
      subjectCounts.set(subjectId, (subjectCounts.get(subjectId) || 0) + 1);
    });
  });

  const demand: SubjectDemand[] = subjects.map((subject) => {
    const count = subjectCounts.get(subject.id) || 0;

    let popularity: 'high' | 'medium' | 'low';
    if (count >= 3) {
      popularity = 'high';
    } else if (count >= 2) {
      popularity = 'medium';
    } else {
      popularity = 'low';
    }

    return {
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectTitle: subject.title,
      enrollmentCount: count,
      popularity,
    };
  });

  // Sort by enrollment count
  demand.sort((a, b) => b.enrollmentCount - a.enrollmentCount);

  return demand;
}

// ─── Generate Enrollment Trends ───────────────────────────────────────────────

function generateEnrollmentTrends(): EnrollmentTrends {
  const periods = computeEnrollmentPeriods();
  const currentPeriod = periods[periods.length - 1];

  const totalDropouts = periods.reduce((sum, p) => sum + p.dropoutCount, 0);
  const averageRetentionRate =
    periods.length > 0
      ? periods.reduce((sum, p) => sum + p.retentionRate, 0) / periods.length
      : 0;

  const overallGrowthRate =
    periods.length > 1
      ? ((currentPeriod.totalEnrolled - periods[0].totalEnrolled) / periods[0].totalEnrolled) *
        100
      : 0;

  return {
    periods,
    currentPeriod,
    coursePopularity: computeCoursePopularity(),
    yearLevelDistribution: computeYearLevelDistribution(),
    subjectDemand: computeSubjectDemand(),
    overallGrowthRate,
    totalDropouts,
    averageRetentionRate,
  };
}

// ─── Export Enrollment Trends ─────────────────────────────────────────────────

export const enrollmentTrends: EnrollmentTrends = generateEnrollmentTrends();

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getPeriodData = (schoolYear: string, semester: string): EnrollmentPeriod | undefined =>
  enrollmentTrends.periods.find((p) => p.schoolYear === schoolYear && p.semester === semester);

export const getCoursePopularity = (courseId: string): CoursePopularity | undefined =>
  enrollmentTrends.coursePopularity.find((c) => c.courseId === courseId);

export const getHighDemandSubjects = (): SubjectDemand[] =>
  enrollmentTrends.subjectDemand.filter((s) => s.popularity === 'high');

export const getEnrollmentGrowthTrend = (): number[] =>
  enrollmentTrends.periods.map((p) => p.growthRate);
