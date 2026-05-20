export type SubjectType = 'major' | 'minor' | 'GE' | 'elective' | 'PE' | 'NSTP';
export type SubjectStatus = 'available' | 'locked' | 'completed' | 'failed' | 'enrolled' | 'duplicate';
export type Semester = '1st' | '2nd' | 'Summer';
export type YearLevel = 1 | 2 | 3 | 4;
export type EnrollmentStrategy = 'major-priority' | 'minor-priority' | 'balanced';
export type EnrollmentStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  totalUnits: number;
  years: number;
}

export interface Subject {
  id: string;
  code: string;
  title: string;
  units: number;
  lecUnits: number;
  labUnits: number;
  type: SubjectType;
  department: string;
  description: string;
}

export interface CurriculumEntry {
  id: string;
  courseId: string;
  subjectId: string;
  yearLevel: YearLevel;
  semester: Semester;
  isRequired: boolean;
}

export interface Prerequisite {
  subjectId: string;
  requiresSubjectId: string;
}

export interface CompletedSubjectRecord {
  studentId: string;
  subjectId: string;
  grade: number;
  yearLevel: YearLevel;
  semester: Semester;
  schoolYear: string;
  passed: boolean;
}

export interface MiscFee {
  name: string;
  amount: number;
}

export interface TuitionRate {
  courseId: string;
  perLecUnit: number;
  perLabUnit: number;
  miscFees: MiscFee[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  studentNumber: string;
  courseId: string;
  yearLevel: YearLevel;
  currentSemester: Semester;
  schoolYear: string;
  status: 'regular' | 'irregular' | 'loa' | 'graduated';
}

export interface EnrollmentRecord {
  id: string;
  referenceNumber: string;
  studentId: string;
  courseId: string;
  yearLevel: YearLevel;
  semester: Semester;
  schoolYear: string;
  subjectIds: string[];
  totalUnits: number;
  status: EnrollmentStatus;
  submittedAt: string;
  receiptId?: string;
}

export interface ReceiptRecord {
  id: string;
  studentId: string;
  enrollmentId: string;
  filename: string;
  fileSize: number;
  uploadedAt: string;
  amount: number;
  referenceNumber: string;
  status: 'pending' | 'verified' | 'rejected';
  previewUrl?: string;
}

// UI enriched types

export interface EnrichedSubject extends Subject {
  status: SubjectStatus;
  prerequisites: Subject[];
  unmetPrerequisites: Subject[];
  yearLevel: YearLevel;
  semester: Semester;
  isRecommended: boolean;
  lockReason?: string;
}

export interface TuitionBreakdown {
  lecUnits: number;
  labUnits: number;
  totalUnits: number;
  lectureFee: number;
  laboratoryFee: number;
  miscFees: MiscFee[];
  miscTotal: number;
  grandTotal: number;
}

export interface EnrollmentFlowState {
  currentStep: number;
  courseId: string;
  yearLevel: YearLevel;
  semester: Semester;
  schoolYear: string;
  completedSubjectIds: string[];
  selectedSubjectIds: string[];
  strategy: EnrollmentStrategy;
  receiptFile: File | null;
  receiptPreview: string | null;
  receiptAmount: string;
  receiptReference: string;
  enrollmentRecord: EnrollmentRecord | null;
}

export const MIN_UNITS = 15;
export const MAX_UNITS = 24;
export const OVERLOAD_THRESHOLD = 21;
