import { useMemo } from 'react';
import { classOfferings } from '../../data/attendance/class-offerings';
import { classSchedules } from '../../data/attendance/schedules';
import { subjects } from '../../data/enrollment/subjects';
import { facultyLoads } from '../../data/grading/faculty-loads';

export interface FacultyScheduleEntry {
  id: string;
  subjectCode: string;
  subjectName: string;
  section: string;
  room: string;
  days: string[];
  startTime: string;
  endTime: string;
  enrolledCount: number;
  maxStudents: number;
  status: 'active' | 'upcoming' | 'completed';
}

export const useFacultySchedule = (instructorId: string) => {
  const schedule = useMemo(() => {
    // Get faculty loads for this instructor
    const loads = facultyLoads.filter((l) => l.instructorId === instructorId);

    // Build schedule entries
    const scheduleEntries: FacultyScheduleEntry[] = loads
      .map((load) => {
        const classOffering = classOfferings.find((c) => c.id === load.classId);
        const subject = subjects.find((s) => s.id === load.subjectId);
        const schedule = classSchedules.find((s) => s.classId === load.classId);

        if (!classOffering || !subject || !schedule) {
          return null;
        }

        return {
          id: load.id,
          subjectCode: subject.code,
          subjectName: subject.title,
          section: load.sectionCode,
          room: load.room,
          days: schedule.days,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          enrolledCount: classOffering.enrolledStudentIds.length,
          maxStudents: load.maxStudents,
          status: 'active',
        } as FacultyScheduleEntry;
      })
      .filter((entry): entry is FacultyScheduleEntry => entry !== null);

    return scheduleEntries;
  }, [instructorId]);

  return {
    schedule,
    isLoading: false,
  };
};
