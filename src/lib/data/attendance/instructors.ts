import type { Instructor } from "../../types/attendance";

export const instructors: Instructor[] = [];

export const getInstructorById = (id: string): Instructor | undefined =>
  instructors.find((i) => i.id === id);

export const getInstructorByUserId = (userId: string): Instructor | undefined =>
  instructors.find((i) => i.userId === userId);
