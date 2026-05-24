import { enrollmentHistory } from '../enrollment/enrollment-history';
import { paymentRecords, paymentSummary } from '../students/payment-options';
import { courses } from '../enrollment/courses';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FinancialPeriod {
  semester: string;
  schoolYear: string;
  totalBilled: number;
  totalCollected: number;
  outstandingBalance: number;
  paymentCompletionRate: number;
  fullPaymentCount: number;
  partialPaymentCount: number;
  unpaidCount: number;
  averagePaymentPerStudent: number;
}

export interface RevenueBreakdown {
  courseId: string;
  courseName: string;
  totalBilled: number;
  totalCollected: number;
  outstandingBalance: number;
  studentCount: number;
  averageRevenuePerStudent: number;
}

export interface PaymentMethodDistribution {
  method: 'cash' | 'bank-transfer' | 'credit-card' | 'online';
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface OverdueBreakdown {
  range: string;
  minAmount: number;
  maxAmount: number;
  count: number;
  totalAmount: number;
}

export interface FinancialTrends {
  periods: FinancialPeriod[];
  currentPeriod: FinancialPeriod;
  revenueByCountse: RevenueBreakdown[];
  paymentMethodDistribution: PaymentMethodDistribution[];
  overdueBreakdown: OverdueBreakdown[];
  totalRevenue: number;
  totalOutstanding: number;
  collectionEfficiency: number;
}

const EMPTY_FINANCIAL_PERIOD: FinancialPeriod = {
  semester: '1st',
  schoolYear: '2024-2025',
  totalBilled: 0,
  totalCollected: 0,
  outstandingBalance: 0,
  paymentCompletionRate: 0,
  fullPaymentCount: 0,
  partialPaymentCount: 0,
  unpaidCount: 0,
  averagePaymentPerStudent: 0,
};

// ─── Compute Financial Periods ────────────────────────────────────────────────

function computeFinancialPeriods(): FinancialPeriod[] {
  // For now we only have current semester data
  // In a real system, this would aggregate historical payment data

  const currentSemester = '1st';
  const currentSchoolYear = '2024-2025';

  const currentPeriod: FinancialPeriod = {
    semester: currentSemester,
    schoolYear: currentSchoolYear,
    totalBilled: paymentSummary.totalBilled,
    totalCollected: paymentSummary.totalPaid,
    outstandingBalance: paymentSummary.totalOutstanding,
    paymentCompletionRate: paymentSummary.paymentCompletionRate,
    fullPaymentCount: paymentSummary.fullPaymentCount,
    partialPaymentCount: paymentSummary.partialPaymentCount,
    unpaidCount: paymentSummary.unpaidCount + paymentSummary.overdueCount,
    averagePaymentPerStudent:
      paymentRecords.length > 0
        ? paymentSummary.totalPaid / paymentRecords.length
        : 0,
  };

  // Simulate previous period for trend comparison
  const previousPeriod: FinancialPeriod = {
    semester: '2nd',
    schoolYear: '2023-2024',
    totalBilled: paymentSummary.totalBilled * 0.95, // Slightly lower
    totalCollected: paymentSummary.totalPaid * 0.92,
    outstandingBalance: paymentSummary.totalOutstanding * 1.1,
    paymentCompletionRate: paymentSummary.paymentCompletionRate - 3,
    fullPaymentCount: Math.floor(paymentSummary.fullPaymentCount * 0.9),
    partialPaymentCount: Math.floor(paymentSummary.partialPaymentCount * 1.1),
    unpaidCount: Math.floor((paymentSummary.unpaidCount + paymentSummary.overdueCount) * 1.2),
    averagePaymentPerStudent:
      paymentRecords.length > 0
        ? (paymentSummary.totalPaid * 0.92) / paymentRecords.length
        : 0,
  };

  return [previousPeriod, currentPeriod];
}

// ─── Compute Revenue by Course ────────────────────────────────────────────────

function computeRevenueByCourse(): RevenueBreakdown[] {
  const revenueMap = new Map<
    string,
    {
      totalBilled: number;
      totalCollected: number;
      outstandingBalance: number;
      studentCount: number;
    }
  >();

  paymentRecords.forEach((payment) => {
    const enrollment = enrollmentHistory.find((e) => e.id === payment.enrollmentId);
    if (!enrollment) return;

    const courseId = enrollment.courseId;

    if (!revenueMap.has(courseId)) {
      revenueMap.set(courseId, {
        totalBilled: 0,
        totalCollected: 0,
        outstandingBalance: 0,
        studentCount: 0,
      });
    }

    const data = revenueMap.get(courseId)!;
    data.totalBilled += payment.totalTuition;
    data.totalCollected += payment.amountPaid;
    data.outstandingBalance += payment.remainingBalance;
    data.studentCount += 1;
  });

  const breakdown: RevenueBreakdown[] = [];

  courses.forEach((course) => {
    const data = revenueMap.get(course.id);
    if (!data) return;

    breakdown.push({
      courseId: course.id,
      courseName: course.name,
      totalBilled: data.totalBilled,
      totalCollected: data.totalCollected,
      outstandingBalance: data.outstandingBalance,
      studentCount: data.studentCount,
      averageRevenuePerStudent:
        data.studentCount > 0 ? data.totalCollected / data.studentCount : 0,
    });
  });

  // Sort by total collected
  breakdown.sort((a, b) => b.totalCollected - a.totalCollected);

  return breakdown;
}

// ─── Compute Payment Method Distribution ──────────────────────────────────────

function computePaymentMethodDistribution(): PaymentMethodDistribution[] {
  const methodMap = new Map<
    PaymentMethodDistribution['method'],
    { count: number; totalAmount: number }
  >();

  paymentRecords.forEach((payment) => {
    payment.paymentHistory.forEach((transaction) => {
      if (!methodMap.has(transaction.method)) {
        methodMap.set(transaction.method, { count: 0, totalAmount: 0 });
      }

      const data = methodMap.get(transaction.method)!;
      data.count += 1;
      data.totalAmount += transaction.amount;
    });
  });

  const totalTransactions = Array.from(methodMap.values()).reduce(
    (sum, d) => sum + d.count,
    0,
  );

  const distribution: PaymentMethodDistribution[] = [];

  (['cash', 'bank-transfer', 'credit-card', 'online'] as const).forEach((method) => {
    const data = methodMap.get(method) || { count: 0, totalAmount: 0 };
    const percentage = totalTransactions > 0 ? (data.count / totalTransactions) * 100 : 0;

    distribution.push({
      method,
      count: data.count,
      totalAmount: data.totalAmount,
      percentage,
    });
  });

  // Sort by count
  distribution.sort((a, b) => b.count - a.count);

  return distribution;
}

// ─── Compute Overdue Breakdown ────────────────────────────────────────────────

function computeOverdueBreakdown(): OverdueBreakdown[] {
  const overduePayments = paymentRecords.filter((p) => p.paymentStatus === 'overdue');

  const ranges = [
    { range: 'Below ₱10,000', minAmount: 0, maxAmount: 9999 },
    { range: '₱10,000 - ₱19,999', minAmount: 10000, maxAmount: 19999 },
    { range: '₱20,000 - ₱29,999', minAmount: 20000, maxAmount: 29999 },
    { range: '₱30,000+', minAmount: 30000, maxAmount: Infinity },
  ];

  const breakdown: OverdueBreakdown[] = ranges.map((r) => {
    const matchingPayments = overduePayments.filter(
      (p) => p.remainingBalance >= r.minAmount && p.remainingBalance <= r.maxAmount,
    );

    const totalAmount = matchingPayments.reduce((sum, p) => sum + p.remainingBalance, 0);

    return {
      range: r.range,
      minAmount: r.minAmount,
      maxAmount: r.maxAmount,
      count: matchingPayments.length,
      totalAmount,
    };
  });

  return breakdown;
}

// ─── Generate Financial Trends ────────────────────────────────────────────────

function generateFinancialTrends(): FinancialTrends {
  const periods = computeFinancialPeriods();
  const currentPeriod = periods[periods.length - 1] ?? EMPTY_FINANCIAL_PERIOD;

  const totalRevenue = periods.reduce((sum, p) => sum + p.totalCollected, 0);
  const totalBilledAllTime = periods.reduce((sum, p) => sum + p.totalBilled, 0);

  const collectionEfficiency = totalBilledAllTime > 0 ? (totalRevenue / totalBilledAllTime) * 100 : 0;

  return {
    periods,
    currentPeriod,
    revenueByCountse: computeRevenueByCourse(),
    paymentMethodDistribution: computePaymentMethodDistribution(),
    overdueBreakdown: computeOverdueBreakdown(),
    totalRevenue,
    totalOutstanding: paymentSummary.totalOutstanding,
    collectionEfficiency,
  };
}

// ─── Export Financial Trends ──────────────────────────────────────────────────

export const financialTrends: FinancialTrends = generateFinancialTrends();

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getFinancialPeriodData = (schoolYear: string, semester: string): FinancialPeriod | undefined =>
  financialTrends.periods.find((p) => p.schoolYear === schoolYear && p.semester === semester);

export const getCourseRevenue = (courseId: string): RevenueBreakdown | undefined =>
  financialTrends.revenueByCountse.find((r) => r.courseId === courseId);

export const getRevenueTrend = (): number[] =>
  financialTrends.periods.map((p) => p.totalCollected);

export const getCollectionRateTrend = (): number[] =>
  financialTrends.periods.map((p) => p.paymentCompletionRate);

export const getTotalOverdueAmount = (): number =>
  financialTrends.overdueBreakdown.reduce((sum, b) => sum + b.totalAmount, 0);
