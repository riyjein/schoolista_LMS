import { useMemo } from 'react';
import type { InstructorSummary } from '../../types/evaluation';
import { evalRecords } from '../../data/evaluation/eval-records';
import { evalCategories } from '../../data/evaluation/eval-settings';
import { evalQuestions } from '../../data/evaluation/eval-questions';
import { classOfferings } from '../../data/attendance/class-offerings';
import { subjects } from '../../data/enrollment/subjects';
import { instructors } from '../../data/attendance/instructors';

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 100) / 100;
}

export function useEvaluationAggregation(): InstructorSummary[] {
  return useMemo(() => {
    const submittedEvals = evalRecords.filter((r) => r.status === 'submitted');

    // Group by instructorId
    const byInstructor = new Map<string, typeof submittedEvals>();
    for (const ev of submittedEvals) {
      if (!byInstructor.has(ev.instructorId)) byInstructor.set(ev.instructorId, []);
      byInstructor.get(ev.instructorId)!.push(ev);
    }

    const summaries: InstructorSummary[] = Array.from(byInstructor.entries()).map(
      ([instructorId, evals]) => {
        const instructor = instructors.find((i) => i.id === instructorId);

        const categoryScores = evalCategories.map((cat) => {
          const catQuestions = evalQuestions.filter(
            (q) => q.categoryId === cat.id && q.type === 'rating',
          );
          const ratings: number[] = evals.flatMap((ev) =>
            catQuestions.flatMap((q) => {
              const a = ev.answers.find((ans) => ans.questionId === q.id);
              return a?.rating !== undefined ? [a.rating] : [];
            }),
          );
          return {
            categoryId: cat.id, label: cat.label, weight: cat.weight, color: cat.color,
            average: avg(ratings), count: ratings.length,
          };
        });

        let weightedSum = 0;
        let totalWeight = 0;
        for (const cs of categoryScores) {
          if (cs.average !== null) { weightedSum += cs.average * cs.weight; totalWeight += cs.weight; }
        }
        const overallRating = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : null;

        const byClass = new Map<string, typeof evals>();
        for (const ev of evals) {
          if (!byClass.has(ev.classId)) byClass.set(ev.classId, []);
          byClass.get(ev.classId)!.push(ev);
        }

        const classStats = Array.from(byClass.entries()).map(([classId, classEvals]) => {
          const offering = classOfferings.find((o) => o.id === classId);
          const subject = subjects.find((s) => s.id === offering?.subjectId);
          const allRatings = classEvals.flatMap((ev) =>
            ev.answers.filter((a) => a.rating !== undefined).map((a) => a.rating!),
          );
          return {
            classId, subjectCode: subject?.code ?? classId, subjectTitle: subject?.title ?? classId,
            sectionCode: offering?.sectionCode ?? '', evaluationCount: classEvals.length,
            averageRating: avg(allRatings),
          };
        });

        return {
          instructorId,
          instructorName: instructor?.name ?? instructorId,
          department: instructor?.department ?? '',
          totalEvaluations: evals.length,
          overallRating,
          categoryScores,
          classStats,
        };
      },
    );

    return summaries.sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0));
  }, []);
}
