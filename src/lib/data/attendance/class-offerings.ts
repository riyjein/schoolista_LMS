import type { ClassOffering } from "../../types/attendance";

export const classOfferings: ClassOffering[] = [];

export const getClassById = (id: string): ClassOffering | undefined =>
  classOfferings.find((c) => c.id === id);

export const getClassesForStudent = (studentId: string): ClassOffering[] =>
  classOfferings.filter((c) => c.enrolledStudentIds.includes(studentId));

export const getClassesForInstructor = (
  instructorId: string,
): ClassOffering[] =>
  classOfferings.filter((c) => c.instructorId === instructorId);
