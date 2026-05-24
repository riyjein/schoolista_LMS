import { useMemo } from "react";
import { attendanceRecords as fallbackAttendanceRecords } from "../../data/attendance/attendance-records";
import { classOfferings as fallbackClassOfferings } from "../../data/attendance/class-offerings";
import { attendanceSessions as fallbackAttendanceSessions } from "../../data/attendance/attendance-sessions";
import { subjects as fallbackSubjects } from "../../data/enrollment/subjects";
import { instructors as fallbackInstructors } from "../../data/attendance/instructors";
import { gradeStudents as fallbackGradeStudents } from "../../data/grades/grades";
import { useSupabaseTable } from "../../supabase/useSupabaseTable";
import type { AttendanceSummary, AttendanceRecord } from "../../types/attendance";

export interface ClassAttendanceReport {
  classId: string;
  subjectCode: string;
  subjectTitle: string;
  sectionCode: string;
  room: string;
  instructorId: string;
  instructorName: string;
  enrolledCount: number;
  totalSessions: number;
  summary: AttendanceSummary;
  studentSummaries: StudentClassSummary[];
  atRiskCount: number;
}

export interface StudentClassSummary {
  studentId: string;
  studentName: string;
  studentNumber: string;
  summary: AttendanceSummary;
  isAtRisk: boolean;
}

export interface OverallReportStats {
  totalClasses: number;
  totalStudents: number;
  totalSessions: number;
  avgAttendanceRate: number;
  atRiskStudents: number;
  perfectAttendanceStudents: number;
}

function summarizeForStudent(
  records: AttendanceRecord[],
  studentId: string,
  classId: string,
) {
  const r = records.filter(
    (rec: AttendanceRecord) => rec.studentId === studentId && rec.classId === classId,
  );
  const total = r.length;
  const present = r.filter((rec: AttendanceRecord) => rec.status === "present").length;
  const late = r.filter((rec: AttendanceRecord) => rec.status === "late").length;
  const absent = r.filter((rec: AttendanceRecord) => rec.status === "absent").length;
  const excused = r.filter((rec: AttendanceRecord) => rec.status === "excused").length;
  const attendanceRate =
    total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;
  return {
    total,
    present,
    late,
    absent,
    excused,
    attendanceRate,
  } satisfies AttendanceSummary;
}

export function useAttendanceReports() {
  const { data: attendanceRecords } = useSupabaseTable({
    table: "attendance_records",
    fallback: fallbackAttendanceRecords,
    orderBy: "date",
  });
  const { data: classOfferings } = useSupabaseTable({
    table: "class_offerings",
    fallback: fallbackClassOfferings,
    orderBy: "id",
  });
  const { data: attendanceSessions } = useSupabaseTable({
    table: "attendance_sessions",
    fallback: fallbackAttendanceSessions,
    orderBy: "date",
  });
  const { data: subjects } = useSupabaseTable({
    table: "subjects",
    fallback: fallbackSubjects,
    orderBy: "code",
  });
  const { data: instructors } = useSupabaseTable({
    table: "instructors",
    fallback: fallbackInstructors,
    orderBy: "name",
  });
  const gradeStudents = fallbackGradeStudents;

  return useMemo<{
    classReports: ClassAttendanceReport[];
    overall: OverallReportStats;
  }>(() => {
    const classReports: ClassAttendanceReport[] = classOfferings.map(
      (offering) => {
        const subject = subjects.find((s) => s.id === offering.subjectId);
        const instructor = instructors.find(
          (i) => i.id === offering.instructorId,
        );
        const sessions = attendanceSessions.filter(
          (s) => s.classId === offering.id,
        );
        const classRecords = attendanceRecords.filter(
          (r) => r.classId === offering.id,
        );

        const studentSummaries: StudentClassSummary[] =
          offering.enrolledStudentIds.map((studentId) => {
            const student = gradeStudents[studentId];
            const summary = summarizeForStudent(
              attendanceRecords,
              studentId,
              offering.id,
            );
            return {
              studentId,
              studentName: student?.name ?? studentId,
              studentNumber: student?.studentNumber ?? "",
              summary,
              isAtRisk: summary.attendanceRate < 75 && summary.total > 0,
            };
          });

        const total = classRecords.length;
        const present = classRecords.filter(
          (r) => r.status === "present",
        ).length;
        const late = classRecords.filter((r) => r.status === "late").length;
        const absent = classRecords.filter((r) => r.status === "absent").length;
        const excused = classRecords.filter(
          (r) => r.status === "excused",
        ).length;
        const attendanceRate =
          total > 0
            ? Math.round(((present + late + excused) / total) * 100)
            : 0;

        return {
          classId: offering.id,
          subjectCode: subject?.code ?? offering.subjectId,
          subjectTitle: subject?.title ?? offering.subjectId,
          sectionCode: offering.sectionCode,
          room: offering.room,
          instructorId: offering.instructorId,
          instructorName: instructor?.name ?? offering.instructorId,
          enrolledCount: offering.enrolledStudentIds.length,
          totalSessions: sessions.length,
          summary: { total, present, late, absent, excused, attendanceRate },
          studentSummaries,
          atRiskCount: studentSummaries.filter((s) => s.isAtRisk).length,
        };
      },
    );

    const allStudentIds = [
      ...new Set(classOfferings.flatMap((o) => o.enrolledStudentIds)),
    ];
    const avgRate =
      classReports.length > 0
        ? Math.round(
            classReports.reduce((s, r) => s + r.summary.attendanceRate, 0) /
              classReports.length,
          )
        : 0;

    const atRisk = new Set<string>();
    const perfect = new Set<string>();
    for (const cr of classReports) {
      for (const ss of cr.studentSummaries) {
        if (ss.isAtRisk) atRisk.add(ss.studentId);
        if (ss.summary.attendanceRate === 100) perfect.add(ss.studentId);
      }
    }

    const overall: OverallReportStats = {
      totalClasses: classReports.length,
      totalStudents: allStudentIds.length,
      totalSessions: attendanceSessions.length,
      avgAttendanceRate: avgRate,
      atRiskStudents: atRisk.size,
      perfectAttendanceStudents: perfect.size,
    };

    return {
      classReports: classReports.sort(
        (a, b) => a.summary.attendanceRate - b.summary.attendanceRate,
      ),
      overall,
    };
  }, [
    attendanceRecords,
    classOfferings,
    attendanceSessions,
    subjects,
    instructors,
  ]);
}
