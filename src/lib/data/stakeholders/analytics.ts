import { studentProfiles } from '../enrollment/students';
import { instructors } from '../attendance/instructors';
import { facultyLoads } from '../grading/faculty-loads';
import { enrollmentTrends } from './enrollment-trends';
import { financialTrends } from './financial-trends';
import { schoolPerformance } from './school-performance';
import { dlCandidates } from '../program-chair/deans-lister';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExecutiveKPI {
  label: string;
  value: number | string;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  status?: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface DashboardMetrics {
  enrollment: {
    totalStudents: number;
    currentEnrollment: number;
    enrollmentGrowth: number;
    retentionRate: number;
  };
  financial: {
    totalRevenue: number;
    totalBilled: number;
    collectionRate: number;
    outstandingBalance: number;
  };
  academic: {
    averageGPA: number | null;
    passRate: number;
    attendanceRate: number;
    dlStudents: number;
  };
  faculty: {
    totalFaculty: number;
    activeClasses: number;
    averageEvaluation: number | null;
    studentFacultyRatio: number;
  };
}

export interface TrendIndicator {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  direction: 'up' | 'down' | 'stable';
  interpretation: 'positive' | 'negative' | 'neutral';
}

export interface StakeholderAnalytics {
  executiveKPIs: ExecutiveKPI[];
  dashboardMetrics: DashboardMetrics;
  trendIndicators: TrendIndicator[];
  institutionalHealth: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    strengths: string[];
    weaknesses: string[];
  };
}

// ─── Compute Executive KPIs ───────────────────────────────────────────────────

function computeExecutiveKPIs(): ExecutiveKPI[] {
  const kpis: ExecutiveKPI[] = [];

  // Total Students KPI
  kpis.push({
    label: 'Total Students',
    value: studentProfiles.length,
    trend: {
      direction: enrollmentTrends.overallGrowthRate > 0 ? 'up' : enrollmentTrends.overallGrowthRate < 0 ? 'down' : 'stable',
      percentage: Math.abs(enrollmentTrends.overallGrowthRate),
    },
    status: studentProfiles.length > 0 ? 'good' : 'warning',
  });

  // Total Revenue KPI
  kpis.push({
    label: 'Total Revenue',
    value: `₱${financialTrends.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    trend: {
      direction: 'up',
      percentage: 5.2, // Simulated growth
    },
    status: 'excellent',
  });

  // Average GPA KPI
  if (schoolPerformance.overallAverageGPA !== null) {
    kpis.push({
      label: 'Average GPA',
      value: schoolPerformance.overallAverageGPA.toFixed(2),
      trend: {
        direction: schoolPerformance.academicImprovementRate > 0 ? 'up' : schoolPerformance.academicImprovementRate < 0 ? 'down' : 'stable',
        percentage: Math.abs(schoolPerformance.academicImprovementRate),
      },
      status: schoolPerformance.overallAverageGPA >= 85 ? 'excellent' : schoolPerformance.overallAverageGPA >= 75 ? 'good' : 'warning',
    });
  }

  // Pass Rate KPI
  kpis.push({
    label: 'Pass Rate',
    value: schoolPerformance.overallPassRate.toFixed(1),
    unit: '%',
    status: schoolPerformance.overallPassRate >= 90 ? 'excellent' : schoolPerformance.overallPassRate >= 80 ? 'good' : schoolPerformance.overallPassRate >= 70 ? 'warning' : 'critical',
  });

  // Attendance Rate KPI
  kpis.push({
    label: 'Attendance Rate',
    value: schoolPerformance.overallAttendanceRate.toFixed(1),
    unit: '%',
    status: schoolPerformance.overallAttendanceRate >= 95 ? 'excellent' : schoolPerformance.overallAttendanceRate >= 85 ? 'good' : schoolPerformance.overallAttendanceRate >= 75 ? 'warning' : 'critical',
  });

  // Collection Rate KPI
  kpis.push({
    label: 'Collection Rate',
    value: financialTrends.collectionEfficiency.toFixed(1),
    unit: '%',
    status: financialTrends.collectionEfficiency >= 90 ? 'excellent' : financialTrends.collectionEfficiency >= 80 ? 'good' : financialTrends.collectionEfficiency >= 70 ? 'warning' : 'critical',
  });

  // Dean's Listers KPI
  kpis.push({
    label: "Dean's Listers",
    value: dlCandidates.filter((c) => c.qualified).length,
    status: dlCandidates.filter((c) => c.qualified).length > 0 ? 'excellent' : 'warning',
  });

  // Faculty Count KPI
  kpis.push({
    label: 'Total Faculty',
    value: instructors.length,
    status: 'good',
  });

  return kpis;
}

// ─── Compute Dashboard Metrics ────────────────────────────────────────────────

function computeDashboardMetrics(): DashboardMetrics {
  const currentPeriod = enrollmentTrends.currentPeriod;
  const previousPeriod = enrollmentTrends.periods[enrollmentTrends.periods.length - 2];

  const enrollmentGrowth = previousPeriod
    ? ((currentPeriod.totalEnrolled - previousPeriod.totalEnrolled) / previousPeriod.totalEnrolled) * 100
    : 0;

  const studentFacultyRatio = instructors.length > 0 ? studentProfiles.length / instructors.length : 0;

  return {
    enrollment: {
      totalStudents: studentProfiles.length,
      currentEnrollment: currentPeriod.totalEnrolled,
      enrollmentGrowth,
      retentionRate: currentPeriod.retentionRate,
    },
    financial: {
      totalRevenue: financialTrends.totalRevenue,
      totalBilled: financialTrends.currentPeriod.totalBilled,
      collectionRate: financialTrends.collectionEfficiency,
      outstandingBalance: financialTrends.totalOutstanding,
    },
    academic: {
      averageGPA: schoolPerformance.overallAverageGPA,
      passRate: schoolPerformance.overallPassRate,
      attendanceRate: schoolPerformance.overallAttendanceRate,
      dlStudents: schoolPerformance.totalDLStudents,
    },
    faculty: {
      totalFaculty: instructors.length,
      activeClasses: facultyLoads.length,
      averageEvaluation: schoolPerformance.overallEvaluationAverage,
      studentFacultyRatio,
    },
  };
}

// ─── Compute Trend Indicators ─────────────────────────────────────────────────

function computeTrendIndicators(): TrendIndicator[] {
  const indicators: TrendIndicator[] = [];

  // Enrollment Trend
  const enrollmentPeriods = enrollmentTrends.periods;
  if (enrollmentPeriods.length >= 2) {
    const current = enrollmentPeriods[enrollmentPeriods.length - 1].totalEnrolled;
    const previous = enrollmentPeriods[enrollmentPeriods.length - 2].totalEnrolled;
    const change = current - previous;
    const changePercentage = previous > 0 ? (change / previous) * 100 : 0;

    indicators.push({
      metric: 'Total Enrollment',
      current,
      previous,
      change,
      changePercentage,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      interpretation: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
    });
  }

  // Revenue Trend
  const financialPeriods = financialTrends.periods;
  if (financialPeriods.length >= 2) {
    const current = financialPeriods[financialPeriods.length - 1].totalCollected;
    const previous = financialPeriods[financialPeriods.length - 2].totalCollected;
    const change = current - previous;
    const changePercentage = previous > 0 ? (change / previous) * 100 : 0;

    indicators.push({
      metric: 'Revenue',
      current,
      previous,
      change,
      changePercentage,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      interpretation: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
    });
  }

  // GPA Trend
  const performancePeriods = schoolPerformance.performanceTrend;
  if (performancePeriods.length >= 2) {
    const currentGPA = performancePeriods[performancePeriods.length - 1].averageGPA || 0;
    const previousGPA = performancePeriods[performancePeriods.length - 2].averageGPA || 0;
    const change = currentGPA - previousGPA;
    const changePercentage = previousGPA > 0 ? (change / previousGPA) * 100 : 0;

    indicators.push({
      metric: 'Average GPA',
      current: currentGPA,
      previous: previousGPA,
      change,
      changePercentage,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      interpretation: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
    });
  }

  // Pass Rate Trend
  if (performancePeriods.length >= 2) {
    const current = performancePeriods[performancePeriods.length - 1].passRate;
    const previous = performancePeriods[performancePeriods.length - 2].passRate;
    const change = current - previous;
    const changePercentage = previous > 0 ? (change / previous) * 100 : 0;

    indicators.push({
      metric: 'Pass Rate',
      current,
      previous,
      change,
      changePercentage,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      interpretation: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
    });
  }

  // Attendance Trend
  const attendancePeriods = schoolPerformance.attendanceTrend;
  if (attendancePeriods.length >= 2) {
    const current = attendancePeriods[attendancePeriods.length - 1].attendanceRate;
    const previous = attendancePeriods[attendancePeriods.length - 2].attendanceRate;
    const change = current - previous;
    const changePercentage = previous > 0 ? (change / previous) * 100 : 0;

    indicators.push({
      metric: 'Attendance Rate',
      current,
      previous,
      change,
      changePercentage,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      interpretation: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
    });
  }

  return indicators;
}

// ─── Compute Institutional Health ─────────────────────────────────────────────

function computeInstitutionalHealth(): StakeholderAnalytics['institutionalHealth'] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Check GPA
  if (schoolPerformance.overallAverageGPA !== null && schoolPerformance.overallAverageGPA >= 85) {
    strengths.push('High average GPA across programs');
  } else if (schoolPerformance.overallAverageGPA !== null && schoolPerformance.overallAverageGPA < 75) {
    weaknesses.push('Low average GPA needs improvement');
  }

  // Check Pass Rate
  if (schoolPerformance.overallPassRate >= 90) {
    strengths.push('Excellent student pass rate');
  } else if (schoolPerformance.overallPassRate < 75) {
    weaknesses.push('Low pass rate indicates academic challenges');
  }

  // Check Attendance
  if (schoolPerformance.overallAttendanceRate >= 90) {
    strengths.push('Strong student attendance');
  } else if (schoolPerformance.overallAttendanceRate < 80) {
    weaknesses.push('Attendance rate below target');
  }

  // Check Collection Rate
  if (financialTrends.collectionEfficiency >= 85) {
    strengths.push('Effective financial collection system');
  } else if (financialTrends.collectionEfficiency < 70) {
    weaknesses.push('High outstanding balances need attention');
  }

  // Check Enrollment Growth
  if (enrollmentTrends.overallGrowthRate > 5) {
    strengths.push('Growing student enrollment');
  } else if (enrollmentTrends.overallGrowthRate < -5) {
    weaknesses.push('Declining enrollment trend');
  }

  // Check Retention
  if (enrollmentTrends.averageRetentionRate >= 90) {
    strengths.push('High student retention rate');
  } else if (enrollmentTrends.averageRetentionRate < 75) {
    weaknesses.push('Student retention needs improvement');
  }

  // Compute overall health score (0-100)
  const gpaScore = schoolPerformance.overallAverageGPA || 0;
  const passRateScore = schoolPerformance.overallPassRate;
  const attendanceScore = schoolPerformance.overallAttendanceRate;
  const collectionScore = financialTrends.collectionEfficiency;

  const score = (gpaScore * 0.3 + passRateScore * 0.3 + attendanceScore * 0.2 + collectionScore * 0.2);

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return {
    score,
    grade,
    strengths,
    weaknesses,
  };
}

// ─── Generate Stakeholder Analytics ───────────────────────────────────────────

function generateStakeholderAnalytics(): StakeholderAnalytics {
  return {
    executiveKPIs: computeExecutiveKPIs(),
    dashboardMetrics: computeDashboardMetrics(),
    trendIndicators: computeTrendIndicators(),
    institutionalHealth: computeInstitutionalHealth(),
  };
}

// ─── Export Stakeholder Analytics ─────────────────────────────────────────────

export const stakeholderAnalytics: StakeholderAnalytics = generateStakeholderAnalytics();

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getKPI = (label: string): ExecutiveKPI | undefined =>
  stakeholderAnalytics.executiveKPIs.find((k) => k.label === label);

export const getPositiveTrends = (): TrendIndicator[] =>
  stakeholderAnalytics.trendIndicators.filter((t) => t.interpretation === 'positive');

export const getNegativeTrends = (): TrendIndicator[] =>
  stakeholderAnalytics.trendIndicators.filter((t) => t.interpretation === 'negative');

export const getHealthGrade = (): string =>
  stakeholderAnalytics.institutionalHealth.grade;

export const getHealthScore = (): number =>
  stakeholderAnalytics.institutionalHealth.score;
