import { useMemo } from 'react';
import type { DLQualification, DLBadge } from '../../types/grades';
import { dlRules } from '../../data/grades/dl-rules';
import { gradeRecords as fallbackGradeRecords } from '../../data/grades/grades';
import { subjects as fallbackSubjects } from '../../data/enrollment/subjects';
import { computeOverallGrade } from './useGradeComputation';
import { gradeSettings } from '../../data/grades/grade-settings';
import { useGPAComputation } from './useGPAComputation';
import { useSupabaseTable } from '../../supabase/useSupabaseTable';

export function useDLQualification(studentId: string): DLQualification {
  const gpaResult = useGPAComputation(studentId, true);
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
    const disqualifiers: string[] = [];
    const records = gradeRecords.filter((r) => r.studentId === studentId);

    // Must have minimum units finalized
    if (gpaResult.finalizedUnits < dlRules.minUnits) {
      disqualifiers.push(
        `Insufficient finalized units (${gpaResult.finalizedUnits} of ${dlRules.minUnits} required)`,
      );
    }

    // Check for failing or incomplete grades among ALL enrolled subjects
    for (const r of records) {
      const computed = computeOverallGrade(r.prelimGrade, r.midtermGrade, r.finalGrade, gradeSettings);
      const sub = subjects.find((s) => s.id === r.subjectId);
      const label = sub?.code ?? r.subjectId;

      if (!dlRules.allowFailing && computed.remarks === 'Failed') {
        disqualifiers.push(`Failing grade in ${label}`);
      }
      if (!dlRules.allowIncomplete && computed.remarks === 'Incomplete') {
        disqualifiers.push(`Incomplete grade in ${label}`);
      }
      if (!dlRules.allowIncomplete && computed.remarks === 'No Grade' && r.status !== 'finalized') {
        // non-finalized = incomplete situation for DL purposes
        disqualifiers.push(`Grade not yet finalized for ${label}`);
      }
    }

    // GPA check
    const { gpa } = gpaResult;
    if (gpa === null) {
      disqualifiers.push('GPA could not be computed — no finalized grades');
    } else if (gpa > dlRules.maxGPA) {
      disqualifiers.push(`GPA ${gpa.toFixed(3)} exceeds maximum ${dlRules.maxGPA}`);
    }

    const qualified = disqualifiers.length === 0 && gpa !== null;

    let badge: DLBadge = 'none';
    if (qualified && gpa !== null) {
      if (gpa <= dlRules.summaMaxGPA) badge = 'summa';
      else if (gpa <= dlRules.magnaMaxGPA) badge = 'magna';
      else badge = 'cum-laude';
    }

    return { qualified, badge, gpa, disqualifiers };
  }, [studentId, gpaResult, gradeRecords, subjects]);
}
