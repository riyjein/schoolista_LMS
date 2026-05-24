import { useMemo, useState } from "react";
import { classOfferings as fallbackClassOfferings } from "../../data/attendance/class-offerings";
import { studentProfiles as fallbackStudentProfiles } from "../../data/enrollment/students";
import { enrollmentHistory as fallbackEnrollmentHistory } from "../../data/enrollment/enrollment-history";
import { subjects as fallbackSubjects } from "../../data/enrollment/subjects";
import { facultyLoads as fallbackFacultyLoads } from "../../data/grading/faculty-loads";
import { courses as fallbackCourses } from "../../data/enrollment/courses";
import { useSupabaseTable } from "../../supabase/useSupabaseTable";

export interface FacultyStudentEntry {
  id: string;
  studentId: string;
  studentNumber: string;
  fullName: string;
  course: string;
  yearLevel: number;
  section: string;
  enrollmentStatus: string;
  subjectId: string;
}

export const useFacultyStudents = (instructorId: string) => {
  const { data: classOfferings } = useSupabaseTable({
    table: "class_offerings",
    fallback: fallbackClassOfferings,
    orderBy: "id",
  });
  const { data: studentProfiles } = useSupabaseTable({
    table: "student_profiles",
    fallback: fallbackStudentProfiles,
    orderBy: "student_number",
  });
  const { data: enrollmentHistory } = useSupabaseTable({
    table: "enrollment_records",
    fallback: fallbackEnrollmentHistory,
    orderBy: "submitted_at",
  });
  const { data: subjects } = useSupabaseTable({
    table: "subjects",
    fallback: fallbackSubjects,
    orderBy: "code",
  });
  const { data: facultyLoads } = useSupabaseTable({
    table: "faculty_loads",
    fallback: fallbackFacultyLoads,
    orderBy: "id",
  });
  const { data: courses } = useSupabaseTable({
    table: "courses",
    fallback: fallbackCourses,
    orderBy: "code",
  });

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");

  // Get all classes taught by this instructor
  const instructorClasses = useMemo(() => {
    return classOfferings.filter((c) => c.instructorId === instructorId);
  }, [instructorId, classOfferings]);

  // Get unique subjects taught
  const taughtSubjects = useMemo(() => {
    const subjectIds = [...new Set(instructorClasses.map((c) => c.subjectId))];
    return subjects.filter((s) => subjectIds.includes(s.id));
  }, [instructorClasses, subjects]);

  // Get unique sections taught
  const taughtSections = useMemo(() => {
    const sectionCodes = [
      ...new Set(instructorClasses.map((c) => c.sectionCode)),
    ];
    return sectionCodes;
  }, [instructorClasses]);

  // Get all students enrolled in instructor's classes
  const students = useMemo(() => {
    let filteredClasses = instructorClasses;

    // Apply subject filter
    if (selectedSubject !== "all") {
      filteredClasses = filteredClasses.filter(
        (c) => c.subjectId === selectedSubject,
      );
    }

    // Apply section filter
    if (selectedSection !== "all") {
      filteredClasses = filteredClasses.filter(
        (c) => c.sectionCode === selectedSection,
      );
    }

    // Collect all student IDs from filtered classes
    const studentIds = new Set<string>();
    const studentSubjectMap = new Map<string, string[]>();

    filteredClasses.forEach((classOffering) => {
      classOffering.enrolledStudentIds.forEach((studentId) => {
        studentIds.add(studentId);
        if (!studentSubjectMap.has(studentId)) {
          studentSubjectMap.set(studentId, []);
        }
        studentSubjectMap.get(studentId)!.push(classOffering.subjectId);
      });
    });

    // Build student entries
    const studentEntries: FacultyStudentEntry[] = [];

    studentIds.forEach((studentId) => {
      const profile = studentProfiles.find((p) => p.id === studentId);
      const enrollment = enrollmentHistory.find(
        (e) => e.studentId === studentId && e.status === "approved",
      );
      const course = profile
        ? courses.find((c) => c.id === profile.courseId)
        : undefined;

      // For each subject this student is taking with this instructor
      const studentSubjects = studentSubjectMap.get(studentId) || [];

      studentSubjects.forEach((subjectId) => {
        const classOffering = filteredClasses.find(
          (c) =>
            c.subjectId === subjectId &&
            c.enrolledStudentIds.includes(studentId),
        );

        if (profile && enrollment && classOffering) {
          studentEntries.push({
            id: `${studentId}-${subjectId}`,
            studentId,
            studentNumber: profile.studentNumber,
            fullName: profile.name,
            course: course?.code || "N/A",
            yearLevel: profile.yearLevel,
            section: classOffering.sectionCode,
            enrollmentStatus: enrollment.status,
            subjectId,
          });
        }
      });
    });

    return studentEntries;
  }, [
    instructorClasses,
    selectedSubject,
    selectedSection,
    classOfferings,
    studentProfiles,
    enrollmentHistory,
    subjects,
    facultyLoads,
    courses,
  ]);

  return {
    students,
    taughtSubjects,
    taughtSections,
    selectedSubject,
    selectedSection,
    setSelectedSubject,
    setSelectedSection,
    isLoading: false,
  };
};
