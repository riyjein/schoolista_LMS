import { useMemo } from 'react';
import { classOfferings as fallbackClassOfferings } from '../../data/attendance/class-offerings';
import { classSchedules as fallbackClassSchedules } from '../../data/attendance/schedules';
import { subjects as fallbackSubjects } from '../../data/enrollment/subjects';
import { facultyLoads as fallbackFacultyLoads } from '../../data/grading/faculty-loads';
import { useSupabaseTable } from '../../supabase/useSupabaseTable';

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
  const { data: facultyLoads } = useSupabaseTable({
    table: 'faculty_loads',
    fallback: fallbackFacultyLoads,
    orderBy: 'id',
  });

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
  }, [instructorId, classOfferings, classSchedules, subjects, facultyLoads]);

  return {
    schedule,
    isLoading: false,
  };
};
