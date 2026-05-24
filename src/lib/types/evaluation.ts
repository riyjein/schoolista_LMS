export type EvalStatus = "draft" | "submitted";
export type QuestionType = "rating" | "textarea";

export interface EvalCategory {
  id: string;
  label: string;
  description: string;
  weight: number; // sum of all weights = 1.0
  color: string; // tailwind bg color class
}

export interface EvalQuestion {
  id: string;
  categoryId: string;
  text: string;
  type: QuestionType;
  required: boolean;
  order: number;
}

export interface EvalAnswer {
  questionId: string;
  rating?: number; // 1–5 for rating questions
  comment?: string; // text for textarea questions
}

export interface EvalRecord {
  id: string;
  studentId: string;
  classId: string;
  instructorId: string;
  subjectId: string;
  sectionCode: string;
  semester: string;
  schoolYear: string;
  status: EvalStatus;
  answers: EvalAnswer[];
  submittedAt?: string;
}

export interface EvalSettings {
  ratingScale: number;
  ratingLabels: Record<number, string>;
  minLabel: string;
  maxLabel: string;
}

export interface CategoryScore {
  categoryId: string;
  label: string;
  weight: number;
  color: string;
  average: number | null;
  count: number;
}

export interface ClassStat {
  classId: string;
  subjectCode: string;
  subjectTitle: string;
  sectionCode: string;
  evaluationCount: number;
  averageRating: number | null;
}

export interface InstructorSummary {
  instructorId: string;
  instructorName: string;
  department: string;
  totalEvaluations: number;
  overallRating: number | null;
  categoryScores: CategoryScore[];
  classStats: ClassStat[];
}
