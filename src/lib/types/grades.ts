export type GradeStatus = 'draft' | 'submitted' | 'finalized';
export type GradeRemark = 'Passed' | 'Failed' | 'Incomplete' | 'No Grade' | 'Dropped';
export type DLBadge = 'summa' | 'magna' | 'cum-laude' | 'none';

export interface GradeRecord {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  instructorId: string;
  sectionCode: string;
  schoolYear: string;
  semester: string;
  yearLevel: number;
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  status: GradeStatus;
}

export interface GradeSettings {
  prelimWeight: number;   // e.g. 0.30
  midtermWeight: number;  // e.g. 0.30
  finalWeight: number;    // e.g. 0.40
  passingGrade: number;   // e.g. 75
}

export interface DLRules {
  maxGPA: number;          // GPA must be ≤ this (lower = better in PH scale)
  cumLaudeMaxGPA: number;  // ≤ 1.75
  magnaMaxGPA: number;     // ≤ 1.5
  summaMaxGPA: number;     // ≤ 1.25
  minUnits: number;
  allowFailing: boolean;
  allowIncomplete: boolean;
}

export interface GradingPeriod {
  id: string;
  label: string;
  shortLabel: string;
  field: 'prelimGrade' | 'midtermGrade' | 'finalGrade';
  weight: number;
}

export interface ComputedGrade {
  overall: number | null;
  gradePoint: number | null;
  remarks: GradeRemark;
  isPassing: boolean;
}

export interface EnrichedGradeRecord extends GradeRecord {
  studentName: string;
  studentNumber: string;
  subjectCode: string;
  subjectTitle: string;
  subjectUnits: number;
  instructorName: string;
  computed: ComputedGrade;
}

export interface GPAResult {
  gpa: number | null;
  totalUnits: number;
  finalizedUnits: number;
  items: {
    classId: string;
    subjectCode: string;
    subjectTitle: string;
    gradePoint: number;
    units: number;
  }[];
}

export interface DLQualification {
  qualified: boolean;
  badge: DLBadge;
  gpa: number | null;
  disqualifiers: string[];
}

export interface GradeStudent {
  id: string;
  name: string;
  studentNumber: string;
}
