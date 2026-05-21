import { useMemo } from 'react';
import { classOfferings as fallbackClassOfferings } from '../../data/attendance/class-offerings';
import { classSchedules as fallbackClassSchedules } from '../../data/attendance/schedules';
import { subjects as fallbackSubjects } from '../../data/enrollment/subjects';
import { instructors as fallbackInstructors } from '../../data/attendance/instructors';
import { enrollmentHistory as fallbackEnrollmentHistory } from '../../data/enrollment/enrollment-history';
import { useSupabaseTable } from '../../supabase/useSupabaseTable';

export interface StudentScheduleEntry {
  id: string;
  subjectCode: string;
  subjectName: string;
  instructor: string;
  section: string;
  room: string;
  days: string[];
  startTime: string;
  endTime: string;
  units: number;
  status: 'enrolled' | 'active';
}

export const useStudentSchedule = (studentId: string) => {
  const { data: classOfferings } = useSupabaseTable({
    table: 'class_offerings_view',
    fallback: fallbackClassOfferings,
    orderBy: 'id',
  });
  const { data: classSchedules } = useSupabaseTable({
    table: 'class_schedules_view',
    fallback: fallbackClassSchedules,
    orderBy: 'id',
  });
  const { data: subjects } = useSupabaseTable({
    table: 'subjects',
    fallback: fallbackSubjects,
    orderBy: 'code',
  });
  const { data: instructors } = useSupabaseTable({
    table: 'instructors',
    fallback: fallbackInstructors,
    orderBy: 'name',
  });
  const { data: enrollmentHistory } = useSupabaseTable({
    table: 'enrollment_records_view',
    fallback: fallbackEnrollmentHistory,
    orderBy: 'submitted_at',
  });

  const schedule = useMemo(() => {
    // Get current enrollment for this student
    const currentEnrollment = enrollmentHistory.find(
      (e) => e.studentId === studentId && e.status === 'approved',
    );

    if (!currentEnrollment) {
      return [];
    }

    const enrolledSubjectIds = currentEnrollment.subjectIds;

    // Find all class offerings that include this student
    const studentClasses = classOfferings.filter((c) =>
      c.enrolledStudentIds.includes(studentId),
    );

    // Build schedule entries
    const scheduleEntries: StudentScheduleEntry[] = studentClasses
      .map((classOffering) => {
        const subject = subjects.find((s) => s.id === classOffering.subjectId);
        const instructor = instructors.find((i) => i.id === classOffering.instructorId);
        const schedule = classSchedules.find((s) => s.classId === classOffering.id);

        if (!subject || !instructor || !schedule) {
          return null;
        }

        return {
          id: classOffering.id,
          subjectCode: subject.code,
          subjectName: subject.title,
          instructor: instructor.name,
          section: classOffering.sectionCode,
          room: classOffering.room,
          days: schedule.days,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          units: subject.units,
          status: enrolledSubjectIds.includes(subject.id) ? 'enrolled' : 'active',
        } as StudentScheduleEntry;
      })
      .filter((entry): entry is StudentScheduleEntry => entry !== null);

    return scheduleEntries;
  }, [studentId, classOfferings, classSchedules, subjects, instructors, enrollmentHistory]);

  return {
    schedule,
    isLoading: false,
  };
};
