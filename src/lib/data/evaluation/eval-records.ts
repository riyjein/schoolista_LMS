import type { EvalRecord, EvalAnswer } from '../../types/evaluation';

function ans(
  ratingMap: Record<string, number>,
  commentMap: Record<string, string> = {},
): EvalAnswer[] {
  return [
    ...Object.entries(ratingMap).map(([questionId, rating]) => ({ questionId, rating })),
    ...Object.entries(commentMap).map(([questionId, comment]) => ({ questionId, comment })),
  ];
}

// ── Pre-seeded submitted evaluations ────────────────────────────────────────
// student-2 (Jose Reyes): evaluated all 5 classes
// student-3 (Ana Dela Cruz): evaluated class-1 through class-4
// student-1 (Maria Santos): has a draft for class-1 only

export const evalRecords: EvalRecord[] = [];

export const getEvalRecord = (studentId: string, classId: string): EvalRecord | undefined =>
  evalRecords.find((r) => r.studentId === studentId && r.classId === classId);

export const getEvalsByInstructor = (instructorId: string): EvalRecord[] =>
  evalRecords.filter((r) => r.instructorId === instructorId && r.status === 'submitted');

export const getEvalsByStudent = (studentId: string): EvalRecord[] =>
  evalRecords.filter((r) => r.studentId === studentId);

export const addEvalRecord = (record: EvalRecord): void => {
  evalRecords.push(record);
};

export const updateEvalRecord = (id: string, updates: Partial<EvalRecord>): void => {
  const idx = evalRecords.findIndex((r) => r.id === id);
  if (idx !== -1) Object.assign(evalRecords[idx], updates);
};


