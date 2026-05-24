import { enrollmentHistory } from '../enrollment/enrollment-history';
import { studentProfiles } from '../enrollment/students';
import { tuitionRates } from '../enrollment/tuition-rates';
import { subjects } from '../enrollment/subjects';
import { receipts } from '../enrollment/receipts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentType = 'full' | 'partial';
export type PaymentStatus = 'paid-in-full' | 'partially-paid' | 'unpaid' | 'overdue';

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  method: 'cash' | 'bank-transfer' | 'credit-card' | 'online';
  referenceNumber: string;
  receiptId?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  enrollmentId: string;
  totalTuition: number;
  amountPaid: number;
  remainingBalance: number;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  paymentHistory: PaymentTransaction[];
  dueDate: string;
  lastPaymentDate?: string;
  installmentPlan?: {
    totalInstallments: number;
    amountPerInstallment: number;
    paidInstallments: number;
    nextDueDate: string;
  };
}

export interface PaymentSummary {
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  fullPaymentCount: number;
  partialPaymentCount: number;
  unpaidCount: number;
  overdueCount: number;
  paymentCompletionRate: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MINIMUM_INSTALLMENT = 5000; // Minimum amount per installment
const MAX_INSTALLMENTS = 4; // Maximum number of installments allowed

// ─── Compute Total Tuition ────────────────────────────────────────────────────

function computeTotalTuition(enrollmentId: string): number {
  const enrollment = enrollmentHistory.find((e) => e.id === enrollmentId);
  if (!enrollment) return 0;

  const student = studentProfiles.find((s) => s.id === enrollment.studentId);
  if (!student) return 0;

  const rate = tuitionRates.find((r) => r.courseId === student.courseId);
  if (!rate) return 0;

  const enrolledSubjects = subjects.filter((s) => enrollment.subjectIds.includes(s.id));

  const lecUnits = enrolledSubjects.reduce((sum, s) => sum + s.lecUnits, 0);
  const labUnits = enrolledSubjects.reduce((sum, s) => sum + s.labUnits, 0);

  const lecFee = lecUnits * rate.perLecUnit;
  const labFee = labUnits * rate.perLabUnit;
  const miscTotal = rate.miscFees.reduce((sum, f) => sum + f.amount, 0);

  return lecFee + labFee + miscTotal;
}

// ─── Generate Payment Records ─────────────────────────────────────────────────

function generatePaymentRecords(): PaymentRecord[] {
  const records: PaymentRecord[] = [];

  // Current semester enrollments
  const currentEnrollments = enrollmentHistory.filter(
    (e) => e.schoolYear === '2024-2025' && e.semester === '1st' && e.status === 'approved',
  );

  currentEnrollments.forEach((enrollment, index) => {
    const totalTuition = computeTotalTuition(enrollment.id);
    const receipt = receipts.find((r) => r.enrollmentId === enrollment.id);

    // Determine payment scenario
    const paymentScenario = index % 3; // Distribute: 0=full, 1=partial, 2=unpaid

    let paymentType: PaymentType;
    let amountPaid: number;
    let paymentHistory: PaymentTransaction[] = [];
    let paymentStatus: PaymentStatus;
    let lastPaymentDate: string | undefined;
    let installmentPlan: PaymentRecord['installmentPlan'];

    const dueDate = '2024-07-31'; // Enrollment due date

    if (paymentScenario === 0) {
      // Full payment
      paymentType = 'full';
      amountPaid = totalTuition;
      paymentStatus = 'paid-in-full';
      lastPaymentDate = '2024-06-20';

      paymentHistory.push({
        id: `txn-${enrollment.id}-1`,
        date: '2024-06-20',
        amount: totalTuition,
        method: 'bank-transfer',
        referenceNumber: `REF-${enrollment.studentId.toUpperCase()}-FULL`,
        receiptId: receipt?.id,
      });
    } else if (paymentScenario === 1) {
      // Partial payment (installments)
      paymentType = 'partial';
      const installmentCount = 3;
      const amountPerInstallment = Math.ceil(totalTuition / installmentCount);
      const paidInstallments = 2;

      amountPaid = amountPerInstallment * paidInstallments;
      paymentStatus = 'partially-paid';
      lastPaymentDate = '2024-07-15';

      // First installment
      paymentHistory.push({
        id: `txn-${enrollment.id}-1`,
        date: '2024-06-15',
        amount: amountPerInstallment,
        method: 'cash',
        referenceNumber: `REF-${enrollment.studentId.toUpperCase()}-INST1`,
      });

      // Second installment
      paymentHistory.push({
        id: `txn-${enrollment.id}-2`,
        date: '2024-07-15',
        amount: amountPerInstallment,
        method: 'online',
        referenceNumber: `REF-${enrollment.studentId.toUpperCase()}-INST2`,
        receiptId: receipt?.id,
      });

      installmentPlan = {
        totalInstallments: installmentCount,
        amountPerInstallment,
        paidInstallments,
        nextDueDate: '2024-08-15',
      };
    } else {
      // Unpaid / Overdue
      paymentType = 'partial';
      amountPaid = 0;
      paymentStatus = 'overdue';
    }

    const remainingBalance = totalTuition - amountPaid;

    records.push({
      id: `payment-${enrollment.id}`,
      studentId: enrollment.studentId,
      enrollmentId: enrollment.id,
      totalTuition,
      amountPaid,
      remainingBalance,
      paymentType,
      paymentStatus,
      paymentHistory,
      dueDate,
      lastPaymentDate,
      installmentPlan,
    });
  });

  return records;
}

// ─── Compute Payment Summary ──────────────────────────────────────────────────

function computePaymentSummary(): PaymentSummary {
  const totalBilled = paymentRecords.reduce((sum, p) => sum + p.totalTuition, 0);
  const totalPaid = paymentRecords.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOutstanding = paymentRecords.reduce((sum, p) => sum + p.remainingBalance, 0);

  const fullPaymentCount = paymentRecords.filter((p) => p.paymentStatus === 'paid-in-full').length;
  const partialPaymentCount = paymentRecords.filter(
    (p) => p.paymentStatus === 'partially-paid',
  ).length;
  const unpaidCount = paymentRecords.filter((p) => p.paymentStatus === 'unpaid').length;
  const overdueCount = paymentRecords.filter((p) => p.paymentStatus === 'overdue').length;

  const paymentCompletionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

  return {
    totalBilled,
    totalPaid,
    totalOutstanding,
    fullPaymentCount,
    partialPaymentCount,
    unpaidCount,
    overdueCount,
    paymentCompletionRate,
  };
}

// ─── Export Payment Data ──────────────────────────────────────────────────────

export const paymentRecords: PaymentRecord[] = generatePaymentRecords();

export const paymentSummary: PaymentSummary = computePaymentSummary();

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getPaymentRecord = (enrollmentId: string): PaymentRecord | undefined =>
  paymentRecords.find((p) => p.enrollmentId === enrollmentId);

export const getStudentPayments = (studentId: string): PaymentRecord[] =>
  paymentRecords.filter((p) => p.studentId === studentId);

export const getOverduePayments = (): PaymentRecord[] =>
  paymentRecords.filter((p) => p.paymentStatus === 'overdue');

export const getPartialPayments = (): PaymentRecord[] =>
  paymentRecords.filter((p) => p.paymentStatus === 'partially-paid');

export const getFullPayments = (): PaymentRecord[] =>
  paymentRecords.filter((p) => p.paymentStatus === 'paid-in-full');

export const getTotalOutstanding = (): number =>
  paymentRecords.reduce((sum, p) => sum + p.remainingBalance, 0);

export const getPaymentsByStatus = (status: PaymentStatus): PaymentRecord[] =>
  paymentRecords.filter((p) => p.paymentStatus === status);

// ─── Payment Actions (Frontend-only mutations) ────────────────────────────────

export function addPaymentTransaction(
  enrollmentId: string,
  amount: number,
  method: PaymentTransaction['method'],
): boolean {
  const record = paymentRecords.find((p) => p.enrollmentId === enrollmentId);
  if (!record) return false;

  if (amount > record.remainingBalance) return false;
  if (amount < MINIMUM_INSTALLMENT && amount < record.remainingBalance) return false;

  const transaction: PaymentTransaction = {
    id: `txn-${enrollmentId}-${record.paymentHistory.length + 1}`,
    date: new Date().toISOString(),
    amount,
    method,
    referenceNumber: `REF-${Date.now()}`,
  };

  record.paymentHistory.push(transaction);
  record.amountPaid += amount;
  record.remainingBalance -= amount;
  record.lastPaymentDate = transaction.date;

  if (record.remainingBalance === 0) {
    record.paymentStatus = 'paid-in-full';
  } else {
    record.paymentStatus = 'partially-paid';
  }

  if (record.installmentPlan) {
    record.installmentPlan.paidInstallments += 1;
  }

  return true;
}
