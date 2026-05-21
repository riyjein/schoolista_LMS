import { useMemo } from 'react';
import { instructors as fallbackInstructors } from '../../data/attendance/instructors';
import { facultyLoads as fallbackFacultyLoads } from '../../data/grading/faculty-loads';
import { classOfferings as fallbackClassOfferings } from '../../data/attendance/class-offerings';
import { classSchedules as fallbackClassSchedules } from '../../data/attendance/schedules';
import { subjects as fallbackSubjects } from '../../data/enrollment/subjects';
import { gradeRecords as fallbackGradeRecords } from '../../data/grades/grades';
import { attendanceSessions as fallbackAttendanceSessions } from '../../data/attendance/attendance-sessions';
import { evalRecords as fallbackEvalRecords } from '../../data/evaluation/eval-records';
import { useSupabaseTable } from '../../supabase/useSupabaseTable';

export interface HandledSubject {
  code: string;
  title: string;
  section: string;
  enrolledCount: number;
  room: string;
}

export interface TodayClass {
  subjectCode: string;
  subjectName: string;
  section: string;
  room: string;
  startTime: string;
  endTime: string;
  enrolledCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface PendingGrade {
  subjectCode: string;
  subjectName: string;
  section: string;
  pendingCount: number;
  totalStudents: number;
}

export interface RecentSession {
  id: string;
  subjectCode: string;
  date: string;
  status: 'upcoming' | 'open' | 'closed';
}

export interface EvaluationSummary {
  totalEvaluations: number;
  averageRating: number;
  subjectCount: number;
}

export const useFacultyDashboard = (instructorId: string) => {
  const { data: instructors, loading: instructorsLoading } = useSupabaseTable({
    table: 'instructors',
    fallback: fallbackInstructors,
    orderBy: 'name',
  });
  const { data: facultyLoads, loading: facultyLoadsLoading } = useSupabaseTable({
    table: 'faculty_loads',
    fallback: fallbackFacultyLoads,
    orderBy: 'id',
  });
  const { data: classOfferings, loading: classOfferingsLoading } = useSupabaseTable({
    table: 'class_offerings_view',
    fallback: fallbackClassOfferings,
    orderBy: 'id',
  });
  const { data: classSchedules, loading: classSchedulesLoading } = useSupabaseTable({
    table: 'class_schedules_view',
    fallback: fallbackClassSchedules,
    orderBy: 'id',
  });
  const { data: subjects, loading: subjectsLoading } = useSupabaseTable({
    table: 'subjects',
    fallback: fallbackSubjects,
    orderBy: 'code',
  });
  const { data: gradeRecords, loading: gradeRecordsLoading } = useSupabaseTable({
    table: 'grade_records',
    fallback: fallbackGradeRecords,
    orderBy: 'id',
  });
  const { data: attendanceSessions, loading: attendanceSessionsLoading } = useSupabaseTable({
    table: 'attendance_sessions_view',
    fallback: fallbackAttendanceSessions,
    orderBy: 'date',
  });
  const { data: evalRecords, loading: evalRecordsLoading } = useSupabaseTable({
    table: 'evaluation_records_view',
    fallback: fallbackEvalRecords,
    orderBy: 'submitted_at',
  });

  const profile = useMemo(() => {
    return instructors.find((i) => i.id === instructorId);
  }, [instructorId, instructors]);

  const loads = useMemo(() => {
    return facultyLoads.filter((l) => l.instructorId === instructorId);
  }, [instructorId, facultyLoads]);

  const handledSubjects = useMemo(() => {
    return loads.map((load) => {
      const classOffering = classOfferings.find((c) => c.id === load.classId);
      const subject = subjects.find((s) => s.id === load.subjectId);

      if (!classOffering || !subject) return null;

      return {
        code: subject.code,
        title: subject.title,
        section: load.sectionCode,
        enrolledCount: classOffering.enrolledStudentIds.length,
        room: load.room,
      } as HandledSubject;
    }).filter((s): s is HandledSubject => s !== null);
  }, [loads, classOfferings, subjects]);

  const todaySchedule = useMemo(() => {
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[today.getDay()];

    const todayClasses: TodayClass[] = [];

    loads.forEach((load) => {
      const schedule = classSchedules.find(
        (s) => s.classId === load.classId && s.days.includes(todayName as any),
      );

      if (schedule) {
        const subject = subjects.find((s) => s.id === load.subjectId);
        const classOffering = classOfferings.find((c) => c.id === load.classId);

        if (subject && classOffering) {
          const now = today.getHours() * 60 + today.getMinutes();
          const [startHour, startMin] = schedule.startTime.split(':').map(Number);
          const [endHour, endMin] = schedule.endTime.split(':').map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
          if (now >= startMinutes && now < endMinutes) {
            status = 'ongoing';
          } else if (now >= endMinutes) {
            status = 'completed';
          }

          todayClasses.push({
            subjectCode: subject.code,
            subjectName: subject.title,
            section: load.sectionCode,
            room: load.room,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            enrolledCount: classOffering.enrolledStudentIds.length,
            status,
          });
        }
      }
    });

    return todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [loads, classSchedules, classOfferings, subjects]);

  const totalEnrolledStudents = useMemo(() => {
    const studentIds = new Set<string>();

    loads.forEach((load) => {
      const classOffering = classOfferings.find((c) => c.id === load.classId);
      if (classOffering) {
        classOffering.enrolledStudentIds.forEach((id) => studentIds.add(id));
      }
    });

    return studentIds.size;
  }, [loads, classOfferings]);

  const pendingGrades = useMemo(() => {
    const pending: PendingGrade[] = [];

    loads.forEach((load) => {
      const classOffering = classOfferings.find((c) => c.id === load.classId);
      const subject = subjects.find((s) => s.id === load.subjectId);

      if (!classOffering || !subject) return;

      const totalStudents = classOffering.enrolledStudentIds.length;
      const grades = gradeRecords.filter(
        (g) => g.instructorId === instructorId && g.subjectId === load.subjectId,
      );

      const pendingCount = grades.filter(
        (g) => g.status === 'draft' || g.prelimGrade === null || g.midtermGrade === null || g.finalGrade === null,
      ).length;

      if (pendingCount > 0) {
        pending.push({
          subjectCode: subject.code,
          subjectName: subject.title,
          section: load.sectionCode,
          pendingCount,
          totalStudents,
        });
      }
    });

    return pending;
  }, [loads, instructorId, gradeRecords]);

  const recentSessions = useMemo(() => {
    const instructorClasses = loads.map((l) => l.classId);
    const sessions = attendanceSessions
      .filter((s) => instructorClasses.includes(s.classId))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    return sessions.map((session) => {
      const classOffering = classOfferings.find((c) => c.id === session.classId);
      const subject = subjects.find((s) => s.id === classOffering?.subjectId);

      return {
        id: session.id,
        subjectCode: subject?.code || 'N/A',
        date: session.date,
        status: session.status,
      } as RecentSession;
    });
  }, [loads, attendanceSessions, classOfferings, subjects]);

  const evaluationSummary = useMemo(() => {
    const evals = evalRecords.filter((e) => e.instructorId === instructorId && e.status === 'submitted');

    if (evals.length === 0) {
      return {
        totalEvaluations: 0,
        averageRating: 0,
        subjectCount: 0,
      };
    }

    const totalRatings = evals.reduce((sum, e) => {
      const ratings = e.answers
        .filter((a) => a.rating !== undefined)
        .map((a) => a.rating!);

      if (ratings.length === 0) return sum;

      const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
      return sum + avg;
    }, 0);

    const subjectIds = new Set(evals.map((e) => e.subjectId));

    return {
      totalEvaluations: evals.length,
      averageRating: totalRatings / evals.length,
      subjectCount: subjectIds.size,
    } as EvaluationSummary;
  }, [instructorId, evalRecords]);

  return {
    profile,
    handledSubjects,
    todaySchedule,
    totalEnrolledStudents,
    pendingGrades,
    recentSessions,
    evaluationSummary,
    isLoading:
      instructorsLoading ||
      facultyLoadsLoading ||
      classOfferingsLoading ||
      classSchedulesLoading ||
      subjectsLoading ||
      gradeRecordsLoading ||
      attendanceSessionsLoading ||
      evalRecordsLoading,
  };
};
