import { useMemo } from "react";
import type {
  CategoryScore,
  ClassStat,
  InstructorSummary,
} from "../../types/evaluation";
import { evalCategories as fallbackEvalCategories } from "../../data/evaluation/eval-settings";
import { evalQuestions as fallbackEvalQuestions } from "../../data/evaluation/eval-questions";
import { evalRecords as fallbackEvalRecords } from "../../data/evaluation/eval-records";
import { classOfferings as fallbackClassOfferings } from "../../data/attendance/class-offerings";
import { subjects as fallbackSubjects } from "../../data/enrollment/subjects";
import { instructors as fallbackInstructors } from "../../data/attendance/instructors";
import { useSupabaseTable } from "../../supabase/useSupabaseTable";

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return (
    Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 100) / 100
  );
}

export function useFacultyRatings(instructorId: string): InstructorSummary {
  const { data: evalRecords } = useSupabaseTable({
    table: "evaluation_records",
    fallback: fallbackEvalRecords,
    orderBy: "submitted_at",
  });
  const { data: evalCategories } = useSupabaseTable({
    table: "evaluation_categories",
    fallback: fallbackEvalCategories,
    orderBy: "id",
  });
  const { data: evalQuestions } = useSupabaseTable({
    table: "evaluation_questions",
    fallback: fallbackEvalQuestions,
    orderBy: "sort_order",
  });
  const { data: classOfferings } = useSupabaseTable({
    table: "class_offerings",
    fallback: fallbackClassOfferings,
    orderBy: "id",
  });
  const { data: subjects } = useSupabaseTable({
    table: "subjects",
    fallback: fallbackSubjects,
    orderBy: "code",
  });
  const { data: instructors } = useSupabaseTable({
    table: "instructors",
    fallback: fallbackInstructors,
    orderBy: "name",
  });

  return useMemo(() => {
    const evals = evalRecords.filter(
      (r) => r.instructorId === instructorId && r.status === "submitted",
    );
    const instructor = instructors.find((i) => i.id === instructorId);

    // Category scores
    const categoryScores: CategoryScore[] = evalCategories.map((cat) => {
      const catQuestions = evalQuestions.filter(
        (q) => q.categoryId === cat.id && q.type === "rating",
      );
      const ratings: number[] = [];

      for (const ev of evals) {
        for (const q of catQuestions) {
          const answer = ev.answers.find((a) => a.questionId === q.id);
          if (answer?.rating !== undefined) ratings.push(answer.rating);
        }
      }

      return {
        categoryId: cat.id,
        label: cat.label,
        weight: cat.weight,
        color: cat.color,
        average: avg(ratings),
        count: ratings.length,
      };
    });

    // Weighted overall rating
    let weightedSum = 0;
    let totalWeight = 0;
    for (const cs of categoryScores) {
      if (cs.average !== null) {
        weightedSum += cs.average * cs.weight;
        totalWeight += cs.weight;
      }
    }
    const overallRating =
      totalWeight > 0
        ? Math.round((weightedSum / totalWeight) * 100) / 100
        : null;

    // Per-class stats
    const byClass = new Map<string, typeof evals>();
    for (const ev of evals) {
      if (!byClass.has(ev.classId)) byClass.set(ev.classId, []);
      byClass.get(ev.classId)!.push(ev);
    }

    const classStats: ClassStat[] = Array.from(byClass.entries()).map(
      ([classId, classEvals]) => {
        const offering = classOfferings.find((o) => o.id === classId);
        const subject = subjects.find((s) => s.id === offering?.subjectId);

        const allRatings: number[] = classEvals.flatMap((ev) =>
          ev.answers
            .filter((a) => a.rating !== undefined)
            .map((a) => a.rating!),
        );

        return {
          classId,
          subjectCode: subject?.code ?? classId,
          subjectTitle: subject?.title ?? classId,
          sectionCode: offering?.sectionCode ?? "",
          evaluationCount: classEvals.length,
          averageRating: avg(allRatings),
        };
      },
    );

    return {
      instructorId,
      instructorName: instructor?.name ?? instructorId,
      department: instructor?.department ?? "",
      totalEvaluations: evals.length,
      overallRating,
      categoryScores,
      classStats,
    };
  }, [
    instructorId,
    evalRecords,
    evalCategories,
    evalQuestions,
    classOfferings,
    subjects,
    instructors,
  ]);
}
