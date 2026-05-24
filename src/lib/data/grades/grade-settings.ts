import type { GradeSettings, GradingPeriod } from '../../types/grades';

export const gradeSettings: GradeSettings = {
  prelimWeight: 0.30,
  midtermWeight: 0.30,
  finalWeight: 0.40,
  passingGrade: 75,
};

export const gradingPeriods: GradingPeriod[] = [
  { id: 'prelim', label: 'Preliminary', shortLabel: 'Prelim', field: 'prelimGrade', weight: 0.30 },
  { id: 'midterm', label: 'Midterm', shortLabel: 'Midterm', field: 'midtermGrade', weight: 0.30 },
  { id: 'final', label: 'Final', shortLabel: 'Final', field: 'finalGrade', weight: 0.40 },
];
