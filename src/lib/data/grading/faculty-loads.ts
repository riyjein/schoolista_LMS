export interface FacultyLoad {
  id: string;
  instructorId: string;
  classId: string;
  subjectId: string;
  sectionCode: string;
  schoolYear: string;
  semester: string;
  room: string;
  maxStudents: number;
}

export const facultyLoads: FacultyLoad[] = [];

export const getLoadsByInstructor = (instructorId: string): FacultyLoad[] =>
  facultyLoads.filter((l) => l.instructorId === instructorId);

export const getLoadByClassId = (classId: string): FacultyLoad | undefined =>
  facultyLoads.find((l) => l.classId === classId);
