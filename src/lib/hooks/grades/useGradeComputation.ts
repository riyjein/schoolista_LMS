import { useCallback } from 'react';
import type { ComputedGrade, GradeRemark, GradeSettings } from '../../types/grades';
import { gradeSettings } from '../../data/grades/grade-settings';

export function numericToGradePoint(grade: number, passingGrade: number): number {
  if (grade < passingGrade) return 5.0;
  if (grade >= 97) return 1.0;
  if (grade >= 94) return 1.25;
  if (grade >= 91) return 1.5;
  if (grade >= 88) return 1.75;
  if (grade >= 85) return 2.0;
  if (grade >= 82) return 2.25;
  if (grade >= 79) return 2.5;
  if (grade >= 76) return 2.75;
  return 3.0; // 75–75.9
}

export function computeOverallGrade(
  prelim: number | null,
  midterm: number | null,
  finalGrade: number | null,
  settings: GradeSettings = gradeSettings,
): ComputedGrade {
  const hasAny = prelim !== null || midterm !== null || finalGrade !== null;

  if (finalGrade === null) {
    if (!hasAny) return { overall: null, gradePoint: null, remarks: 'No Grade', isPassing: false };
    return { overall: null, gradePoint: null, remarks: 'Incomplete', isPassing: false };
  }

  const raw =
    (prelim ?? 0) * settings.prelimWeight +
    (midterm ?? 0) * settings.midtermWeight +
    finalGrade * settings.finalWeight;

  const overall = Math.round(raw * 10) / 10;
  const isPassing = overall >= settings.passingGrade;
  const gradePoint = numericToGradePoint(overall, settings.passingGrade);
  const remarks: GradeRemark = isPassing ? 'Passed' : 'Failed';

  return { overall, gradePoint, remarks, isPassing };
}

export function useGradeComputation(settings: GradeSettings = gradeSettings) {
  const compute = useCallback(
    (prelim: number | null, midterm: number | null, finalGrade: number | null): ComputedGrade =>
      computeOverallGrade(prelim, midterm, finalGrade, settings),
    [settings],
  );

  const getGradePointLabel = useCallback((gp: number | null): string => {
    if (gp === null) return '—';
    return gp.toFixed(2);
  }, []);

  const getGradeColor = useCallback((gp: number | null): string => {
    if (gp === null) return 'text-muted-foreground';
    if (gp === 5.0) return 'text-red-600';
    if (gp <= 1.5) return 'text-green-600';
    if (gp <= 2.0) return 'text-blue-600';
    if (gp <= 2.75) return 'text-foreground';
    return 'text-orange-600';
  }, []);

  return { compute, getGradePointLabel, getGradeColor };
}
