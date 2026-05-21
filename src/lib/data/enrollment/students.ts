import type { StudentProfile } from "../../types/enrollment";

export const studentProfiles: StudentProfile[] = [];

export const getStudentProfileByUserId = (
  userId: string,
): StudentProfile | undefined =>
  studentProfiles.find((s) => s.userId === userId);

export const getStudentProfileById = (id: string): StudentProfile | undefined =>
  studentProfiles.find((s) => s.id === id);

// Fallback profile for demo mode when no match found
export const defaultStudentProfile: StudentProfile = {
  id: "student-1",
  userId: "u1",
  name: "Maria Santos",
  studentNumber: "2023-00142",
  courseId: "bscs",
  yearLevel: 2,
  currentSemester: "1st",
  schoolYear: "2024-2025",
  status: "irregular",
};
