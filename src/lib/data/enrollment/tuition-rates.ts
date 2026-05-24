import type { TuitionRate } from "../../types/enrollment";

export const tuitionRates: TuitionRate[] = [];

export const getTuitionRateForCourse = (
  courseId: string,
): TuitionRate | undefined => tuitionRates.find((r) => r.courseId === courseId);
