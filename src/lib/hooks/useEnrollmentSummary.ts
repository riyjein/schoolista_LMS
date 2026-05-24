import { useMemo } from 'react';
import type { TuitionBreakdown } from '../types/enrollment';
import { getSubjectsByIds } from '../data/enrollment/subjects';
import { getTuitionRateForCourse } from '../data/enrollment/tuition-rates';

export function useEnrollmentSummary(courseId: string, selectedSubjectIds: string[]) {
  const tuitionBreakdown: TuitionBreakdown = useMemo(() => {
    const rate = getTuitionRateForCourse(courseId);
    const selected = getSubjectsByIds(selectedSubjectIds);

    const lecUnits = selected.reduce((sum, s) => sum + s.lecUnits, 0);
    const labUnits = selected.reduce((sum, s) => sum + s.labUnits, 0);
    const totalUnits = lecUnits + labUnits;

    const lectureFee = lecUnits * (rate?.perLecUnit ?? 850);
    const laboratoryFee = labUnits * (rate?.perLabUnit ?? 1200);

    const miscFees = rate?.miscFees ?? [];
    const miscTotal = miscFees.reduce((sum, f) => sum + f.amount, 0);

    const grandTotal = lectureFee + laboratoryFee + miscTotal;

    return {
      lecUnits,
      labUnits,
      totalUnits,
      lectureFee,
      laboratoryFee,
      miscFees,
      miscTotal,
      grandTotal,
    };
  }, [courseId, selectedSubjectIds]);

  const selectedSubjects = useMemo(
    () => getSubjectsByIds(selectedSubjectIds),
    [selectedSubjectIds],
  );

  return { tuitionBreakdown, selectedSubjects };
}
