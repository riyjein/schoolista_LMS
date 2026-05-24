import type {
  CurriculumEntry,
  YearLevel,
  Semester,
} from "../../types/enrollment";

export const curriculum: CurriculumEntry[] = [];

export const getCurriculumForCourse = (
  courseId: string,
  yearLevel?: YearLevel,
  semester?: Semester,
): CurriculumEntry[] =>
  curriculum.filter(
    (c) =>
      c.courseId === courseId &&
      (yearLevel === undefined || c.yearLevel === yearLevel) &&
      (semester === undefined || c.semester === semester),
  );

export const getPreviousCurriculumEntries = (
  courseId: string,
  upToYear: YearLevel,
  upToSemester: Semester,
): CurriculumEntry[] => {
  const semesterOrder: Record<Semester, number> = {
    "1st": 1,
    "2nd": 2,
    Summer: 3,
  };
  return curriculum.filter((c) => {
    if (c.courseId !== courseId) return false;
    if (c.yearLevel < upToYear) return true;
    if (
      c.yearLevel === upToYear &&
      semesterOrder[c.semester] < semesterOrder[upToSemester]
    )
      return true;
    return false;
  });
};
