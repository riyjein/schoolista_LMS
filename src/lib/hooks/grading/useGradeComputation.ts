import { useMemo } from 'react';
import type { GradeRemark } from '../../types/grades';
import { gradeSettings } from '../../data/grades/grade-settings';

export interface GradeWeights {
  prelimWeight: number;
  midtermWeight: number;
  finalWeight: number;
  passingGrade: number;
}

export interface GradeComputationResult {
  overall: number | null;
  gradePoint: number | null;
  remarks: GradeRemark;
  isPassing: boolean;
  isComplete: boolean;
}

export function computeOverall(
  prelim: number | null,
  midterm: number | null,
  final: number | null,
  weights: GradeWeights = gradeSettings,
): number | null {
  if (prelim === null || midterm === null || final === null) return null;
  return Math.round(
    (prelim * weights.prelimWeight + midterm * weights.midtermWeight + final * weights.finalWeight) * 100,
  ) / 100;
}

export function toGradePoint(overall: number, passingGrade: number): number {
  if (overall < passingGrade) return 5.0;
  if (overall >= 97) return 1.0;
  if (overall >= 94) return 1.25;
  if (overall >= 91) return 1.5;
  if (overall >= 88) return 1.75;
  if (overall >= 85) return 2.0;
  if (overall >= 82) return 2.25;
  if (overall >= 79) return 2.5;
  if (overall >= 76) return 2.75;
  return 3.0;
}

export function deriveRemark(
  prelim: number | null,
  midterm: number | null,
  final: number | null,
  overall: number | null,
  passingGrade: number,
): GradeRemark {
  if (prelim === null && midterm === null && final === null) return 'No Grade';
  if (final === null) return 'Incomplete';
  if (overall === null) return 'No Grade';
  return overall >= passingGrade ? 'Passed' : 'Failed';
}

export function computeGrade(
  prelim: number | null,
  midterm: number | null,
  final: number | null,
  weights: GradeWeights = gradeSettings,
): GradeComputationResult {
  const overall = computeOverall(prelim, midterm, final, weights);
  const remarks = deriveRemark(prelim, midterm, final, overall, weights.passingGrade);
  const gradePoint = overall !== null && final !== null ? toGradePoint(overall, weights.passingGrade) : null;
  const isComplete = prelim !== null && midterm !== null && final !== null;

  return {
    overall,
    gradePoint,
    remarks,
    isPassing: overall !== null && overall >= weights.passingGrade,
    isComplete,
  };
}

export function useGradeComputation(
  prelim: number | null,
  midterm: number | null,
  final: number | null,
  weights: GradeWeights = gradeSettings,
): GradeComputationResult {
  return useMemo(
    () => computeGrade(prelim, midterm, final, weights),
    [prelim, midterm, final, weights],
  );
}
