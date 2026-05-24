import type { Course } from "../../types/enrollment";

export const courses: Course[] = [];

export const getCourseById = (id: string): Course | undefined =>
  courses.find((c) => c.id === id);
