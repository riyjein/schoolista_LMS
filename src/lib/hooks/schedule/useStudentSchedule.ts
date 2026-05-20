import { useMemo } from 'react';
import { classOfferings } from '../../data/attendance/class-offerings';
import { classSchedules } from '../../data/attendance/schedules';
import { subjects } from '../../data/enrollment/subjects';
import { instructors } from '../../data/attendance/instructors';
import { enrollmentHistory } from '../../data/enrollment/enrollment-history';

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
  }, [studentId]);

  return {
    schedule,
    isLoading: false,
  };
};
