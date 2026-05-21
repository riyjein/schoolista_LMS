import { useMemo } from 'react';
import { studentProfiles as fallbackStudentProfiles } from '../../data/enrollment/students';
import { enrollmentHistory as fallbackEnrollmentHistory } from '../../data/enrollment/enrollment-history';
import { subjects as fallbackSubjects } from '../../data/enrollment/subjects';
import { classOfferings as fallbackClassOfferings } from '../../data/attendance/class-offerings';
import { classSchedules as fallbackClassSchedules } from '../../data/attendance/schedules';
import { instructors as fallbackInstructors } from '../../data/attendance/instructors';
import { attendanceRecords as fallbackAttendanceRecords } from '../../data/attendance/attendance-records';
import { gradeRecords as fallbackGradeRecords } from '../../data/grades/grades';
import { tuitionRates as fallbackTuitionRates } from '../../data/enrollment/tuition-rates';
import { useSupabaseTable } from '../../supabase/useSupabaseTable';

export interface TodayClass {
  subjectCode: string;
  subjectName: string;
  instructor: string;
  room: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface EnrolledSubject {
  code: string;
  title: string;
  units: number;
  instructor: string;
  section: string;
}

export interface GradeSummary {
  subjectCode: string;
  subjectName: string;
  prelim: number | null;
  midterm: number | null;
  final: number | null;
  average: number | null;
  status: 'draft' | 'submitted' | 'finalized';
}

export interface AttendanceSummary {
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  attendanceRate: number;
}

export interface TuitionSummary {
  totalAmount: number;
  paid: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid';
}

export const useStudentDashboard = (studentId: string) => {
  const { data: studentProfiles, loading: studentProfilesLoading } = useSupabaseTable({
    table: 'student_profiles',
    fallback: fallbackStudentProfiles,
    orderBy: 'student_number',
  });
  const { data: enrollmentHistory, loading: enrollmentHistoryLoading } = useSupabaseTable({
    table: 'enrollment_records_view',
    fallback: fallbackEnrollmentHistory,
    orderBy: 'submitted_at',
  });
  const { data: subjects, loading: subjectsLoading } = useSupabaseTable({
    table: 'subjects',
    fallback: fallbackSubjects,
    orderBy: 'code',
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
  const { data: instructors, loading: instructorsLoading } = useSupabaseTable({
    table: 'instructors',
    fallback: fallbackInstructors,
    orderBy: 'name',
  });
  const { data: attendanceRecords, loading: attendanceRecordsLoading } = useSupabaseTable({
    table: 'attendance_records_view',
    fallback: fallbackAttendanceRecords,
    orderBy: 'date',
  });
  const { data: gradeRecords, loading: gradeRecordsLoading } = useSupabaseTable({
    table: 'grade_records',
    fallback: fallbackGradeRecords,
    orderBy: 'id',
  });
  const { data: tuitionRates, loading: tuitionRatesLoading } = useSupabaseTable({
    table: 'tuition_rates_view',
    fallback: fallbackTuitionRates,
    orderBy: 'course_id',
  });

  const profile = useMemo(() => {
    return studentProfiles.find((p) => p.id === studentId);
  }, [studentId, studentProfiles]);

  const currentEnrollment = useMemo(() => {
    return enrollmentHistory.find(
      (e) =>
        e.studentId === studentId &&
        e.status === 'approved' &&
        e.schoolYear === '2024-2025' &&
        e.semester === '1st',
    );
  }, [studentId, enrollmentHistory]);

  const enrolledSubjects = useMemo(() => {
    if (!currentEnrollment) return [];

    const studentClasses = classOfferings.filter((c) =>
      c.enrolledStudentIds.includes(studentId),
    );

    return studentClasses
      .map((classOffering) => {
        const subject = subjects.find((s) => s.id === classOffering.subjectId);
        const instructor = instructors.find((i) => i.id === classOffering.instructorId);

        if (!subject || !instructor) return null;

        return {
          code: subject.code,
          title: subject.title,
          units: subject.units,
          instructor: instructor.name,
          section: classOffering.sectionCode,
        } as EnrolledSubject;
      })
      .filter((s): s is EnrolledSubject => s !== null);
  }, [studentId, currentEnrollment, classOfferings, subjects, instructors]);

  const todaySchedule = useMemo(() => {
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[today.getDay()];

    const studentClasses = classOfferings.filter((c) =>
      c.enrolledStudentIds.includes(studentId),
    );

    const todayClasses: TodayClass[] = [];

    studentClasses.forEach((classOffering) => {
      const schedule = classSchedules.find(
        (s) => s.classId === classOffering.id && s.days.includes(todayName as any),
      );

      if (schedule) {
        const subject = subjects.find((s) => s.id === classOffering.subjectId);
        const instructor = instructors.find((i) => i.id === classOffering.instructorId);

        if (subject && instructor) {
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
            instructor: instructor.name,
            room: classOffering.room,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            status,
          });
        }
      }
    });

    return todayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [studentId, classOfferings, classSchedules, subjects, instructors]);

  const gradesSummary = useMemo(() => {
    const studentGrades = gradeRecords.filter((g) => g.studentId === studentId);

    return studentGrades.map((grade) => {
      const subject = subjects.find((s) => s.id === grade.subjectId);
      const avg =
        grade.prelimGrade !== null && grade.midtermGrade !== null && grade.finalGrade !== null
          ? (grade.prelimGrade + grade.midtermGrade + grade.finalGrade) / 3
          : null;

      return {
        subjectCode: subject?.code || 'N/A',
        subjectName: subject?.title || 'Unknown',
        prelim: grade.prelimGrade,
        midterm: grade.midtermGrade,
        final: grade.finalGrade,
        average: avg,
        status: grade.status,
      } as GradeSummary;
    });
  }, [studentId, gradeRecords, subjects]);

  const gpa = useMemo(() => {
    const finalized = gradesSummary.filter(
      (g) => g.average !== null && g.status === 'finalized',
    );

    if (finalized.length === 0) return null;

    const total = finalized.reduce((sum, g) => sum + (g.average || 0), 0);
    return total / finalized.length;
  }, [gradesSummary]);

  const attendanceSummary = useMemo(() => {
    const studentAttendance = attendanceRecords.filter((a) => a.studentId === studentId);

    const total = studentAttendance.length;
    const present = studentAttendance.filter((a) => a.status === 'present').length;
    const late = studentAttendance.filter((a) => a.status === 'late').length;
    const absent = studentAttendance.filter((a) => a.status === 'absent').length;

    const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;

    return {
      totalSessions: total,
      present,
      late,
      absent,
      attendanceRate,
    } as AttendanceSummary;
  }, [studentId, attendanceRecords]);

  const tuitionSummary = useMemo(() => {
    if (!currentEnrollment || !profile) {
      return {
        totalAmount: 0,
        paid: 0,
        balance: 0,
        status: 'unpaid' as const,
      };
    }

    const rate = tuitionRates.find((r) => r.courseId === profile.courseId);
    if (!rate) {
      return {
        totalAmount: 0,
        paid: 0,
        balance: 0,
        status: 'unpaid' as const,
      };
    }

    const enrolledSubjectsList = subjects.filter((s) =>
      currentEnrollment.subjectIds.includes(s.id),
    );

    const lecUnits = enrolledSubjectsList.reduce((sum, s) => sum + s.lecUnits, 0);
    const labUnits = enrolledSubjectsList.reduce((sum, s) => sum + s.labUnits, 0);

    const lecFee = lecUnits * rate.perLecUnit;
    const labFee = labUnits * rate.perLabUnit;
    const miscTotal = rate.miscFees.reduce((sum, f) => sum + f.amount, 0);

    const totalAmount = lecFee + labFee + miscTotal;
    const paid = totalAmount * 0.8; // Mock: 80% paid
    const balance = totalAmount - paid;

    let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (balance === 0) status = 'paid';
    else if (paid > 0) status = 'partial';

    return {
      totalAmount,
      paid,
      balance,
      status,
    } as TuitionSummary;
  }, [currentEnrollment, profile, subjects, tuitionRates]);

  return {
    profile,
    currentEnrollment,
    enrolledSubjects,
    todaySchedule,
    gradesSummary,
    gpa,
    attendanceSummary,
    tuitionSummary,
    isLoading:
      studentProfilesLoading ||
      enrollmentHistoryLoading ||
      subjectsLoading ||
      classOfferingsLoading ||
      classSchedulesLoading ||
      instructorsLoading ||
      attendanceRecordsLoading ||
      gradeRecordsLoading ||
      tuitionRatesLoading,
  };
};
