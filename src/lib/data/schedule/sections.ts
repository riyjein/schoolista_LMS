export interface Section {
  id: string;
  code: string;
  courseId: string;
  yearLevel: number;
  schoolYear: string;
  semester: string;
  maxStudents: number;
}

export const sections: Section[] = [];

export const getSectionByCode = (code: string): Section | undefined =>
  sections.find((s) => s.code === code);

export const getSectionById = (id: string): Section | undefined =>
  sections.find((s) => s.id === id);

export const getSectionsByCourse = (courseId: string): Section[] =>
  sections.filter((s) => s.courseId === courseId || s.courseId === "all");
