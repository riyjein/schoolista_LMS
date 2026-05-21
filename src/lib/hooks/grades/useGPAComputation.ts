import { useMemo } from 'react';
import type { GPAResult } from '../../types/grades';
import { gradeRecords as fallbackGradeRecords } from '../../data/grades/grades';
import { subjects as fallbackSubjects } from '../../data/enrollment/subjects';
import { computeOverallGrade } from './useGradeComputation';
import { gradeSettings } from '../../data/grades/grade-settings';
import { useSupabaseTable } from '../../supabase/useSupabaseTable';

export function useGPAComputation(studentId: string, onlyFinalized = true): GPAResult {
  const { data: gradeRecords } = useSupabaseTable({
    table: 'grade_records',
    fallback: fallbackGradeRecords,
    orderBy: 'id',
  });
  const { data: subjects } = useSupabaseTable({
    table: 'subjects',
    fallback: fallbackSubjects,
    orderBy: 'code',
  });

  return useMemo(() => {
    const records = gradeRecords.filter((r) => r.studentId === studentId);
    const eligible = onlyFinalized ? records.filter((r) => r.status === 'finalized') : records;

    let totalWeighted = 0;
    let totalUnits = 0;
    const items: GPAResult['items'] = [];

    for (const r of eligible) {
      const computed = computeOverallGrade(r.prelimGrade, r.midtermGrade, r.finalGrade, gradeSettings);
      if (computed.gradePoint === null) continue;

      const subject = subjects.find((s) => s.id === r.subjectId);
      const units = subject?.units ?? 0;

      totalWeighted += computed.gradePoint * units;
      totalUnits += units;

      items.push({
        classId: r.classId,
        subjectCode: subject?.code ?? r.subjectId,
        subjectTitle: subject?.title ?? r.subjectId,
        gradePoint: computed.gradePoint,
        units,
      });
    }

    const finalizedUnits = eligible.reduce((sum, r) => {
      const sub = subjects.find((s) => s.id === r.subjectId);
      return sum + (sub?.units ?? 0);
    }, 0);
    const totalEnrolledUnits = records.reduce((sum, r) => {
      const sub = subjects.find((s) => s.id === r.subjectId);
      return sum + (sub?.units ?? 0);
    }, 0);

    const gpa = totalUnits > 0 ? Math.round((totalWeighted / totalUnits) * 1000) / 1000 : null;

    return { gpa, totalUnits: totalEnrolledUnits, finalizedUnits, items };
  }, [studentId, onlyFinalized, gradeRecords, subjects]);
}
