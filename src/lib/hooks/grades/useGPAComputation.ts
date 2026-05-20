import { useMemo } from 'react';
import type { GPAResult } from '../../types/grades';
import { getGradesForStudent } from '../../data/grades/grades';
import { classOfferings } from '../../data/attendance/class-offerings';
import { subjects } from '../../data/enrollment/subjects';
import { computeOverallGrade } from './useGradeComputation';
import { gradeSettings } from '../../data/grades/grade-settings';

export function useGPAComputation(studentId: string, onlyFinalized = true): GPAResult {
  return useMemo(() => {
    const records = getGradesForStudent(studentId);
    const eligible = onlyFinalized ? records.filter((r) => r.status === 'finalized') : records;

    let totalWeighted = 0;
    let totalUnits = 0;
    const items: GPAResult['items'] = [];

    for (const r of eligible) {
      const computed = computeOverallGrade(r.prelimGrade, r.midtermGrade, r.finalGrade, gradeSettings);
      if (computed.gradePoint === null) continue;

      const offering = classOfferings.find((o) => o.id === r.classId);
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

    const allRecords = getGradesForStudent(studentId);
    const finalizedUnits = eligible.reduce((sum, r) => {
      const sub = subjects.find((s) => s.id === r.subjectId);
      return sum + (sub?.units ?? 0);
    }, 0);
    const totalEnrolledUnits = allRecords.reduce((sum, r) => {
      const sub = subjects.find((s) => s.id === r.subjectId);
      return sum + (sub?.units ?? 0);
    }, 0);

    const gpa = totalUnits > 0 ? Math.round((totalWeighted / totalUnits) * 1000) / 1000 : null;

    return { gpa, totalUnits: totalEnrolledUnits, finalizedUnits, items };
  }, [studentId, onlyFinalized]);
}
