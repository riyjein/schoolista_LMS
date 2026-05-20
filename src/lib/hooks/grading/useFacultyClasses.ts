import { useMemo } from 'react';
import { getLoadsByInstructor, type FacultyLoad } from '../../data/grading/faculty-loads';
import { subjects } from '../../data/enrollment/subjects';
import { classOfferings } from '../../data/attendance/class-offerings';
import { gradeRecords } from '../../data/grades/grades';
import type { GradeStatus } from '../../types/grades';

export interface FacultyClassInfo extends FacultyLoad {
  subjectCode: string;
  subjectTitle: string;
  subjectUnits: number;
  enrolledCount: number;
  draftCount: number;
  submittedCount: number;
  finalizedCount: number;
  completionPercent: number;
}

export function useFacultyClasses(instructorId: string): FacultyClassInfo[] {
  return useMemo(() => {
    const loads = getLoadsByInstructor(instructorId);

    return loads.map((load) => {
      const subject = subjects.find((s) => s.id === load.subjectId);
      const offering = classOfferings.find((o) => o.id === load.classId);
      const classGrades = gradeRecords.filter((r) => r.classId === load.classId);

      const counts = classGrades.reduce(
        (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
        {} as Record<GradeStatus, number>,
      );

      const total = classGrades.length;
      const finalized = counts.finalized ?? 0;

      return {
        ...load,
        subjectCode: subject?.code ?? load.subjectId,
        subjectTitle: subject?.title ?? load.subjectId,
        subjectUnits: subject?.units ?? 0,
        enrolledCount: offering?.enrolledStudentIds.length ?? total,
        draftCount: counts.draft ?? 0,
        submittedCount: counts.submitted ?? 0,
        finalizedCount: finalized,
        completionPercent: total > 0 ? Math.round((finalized / total) * 100) : 0,
      };
    });
  }, [instructorId]);
}
