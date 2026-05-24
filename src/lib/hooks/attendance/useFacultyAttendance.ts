import { useState, useMemo, useCallback } from "react";
import {
  attendanceRecords as fallbackAttendanceRecords,
  getRecordsForClass,
} from "../../data/attendance/attendance-records";
import {
  classOfferings as fallbackClassOfferings,
  getClassesForInstructor,
} from "../../data/attendance/class-offerings";
import { subjects as fallbackSubjects } from "../../data/enrollment/subjects";
import { attendanceSessions as fallbackAttendanceSessions } from "../../data/attendance/attendance-sessions";
import { gradeStudents as fallbackGradeStudents } from "../../data/grades/grades";
import { useSupabaseTable } from "../../supabase/useSupabaseTable";
import type {
  AttendanceStatus,
  AttendanceSummary,
} from "../../types/attendance";

export interface StudentAttendanceRow {
  studentId: string;
  studentName: string;
  studentNumber: string;
  summary: AttendanceSummary;
  lastSeen: string | null;
  isAtRisk: boolean;
}

export interface SessionRow {
  sessionId: string;
  date: string;
  studentStatuses: Record<string, AttendanceStatus | "no-record">;
}

export interface FacultyClassInfo {
  classId: string;
  subjectCode: string;
  subjectTitle: string;
  sectionCode: string;
  room: string;
  enrolledStudentIds: string[];
  totalSessions: number;
}

function summarize(
  records: ReturnType<typeof getRecordsForClass>,
  studentId: string,
): AttendanceSummary {
  const r = records.filter((rec) => rec.studentId === studentId);
  const total = r.length;
  const present = r.filter((rec) => rec.status === "present").length;
  const late = r.filter((rec) => rec.status === "late").length;
  const absent = r.filter((rec) => rec.status === "absent").length;
  const excused = r.filter((rec) => rec.status === "excused").length;
  const attendanceRate =
    total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;
  return { total, present, late, absent, excused, attendanceRate };
}

export function useFacultyAttendance(instructorId: string) {
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
  const { data: subjects } = useSupabaseTable({
    table: "subjects",
    fallback: fallbackSubjects,
    orderBy: "code",
  });
  const { data: attendanceSessions } = useSupabaseTable({
    table: "attendance_sessions",
    fallback: fallbackAttendanceSessions,
    orderBy: "date",
  });
  const gradeStudents = fallbackGradeStudents;

  const instructorClasses = useMemo<FacultyClassInfo[]>(() => {
    return getClassesForInstructor(instructorId).map((offering) => {
      const subject = subjects.find((s) => s.id === offering.subjectId);
      const sessions = attendanceSessions.filter(
        (s) => s.classId === offering.id,
      );
      return {
        classId: offering.id,
        subjectCode: subject?.code ?? offering.subjectId,
        subjectTitle: subject?.title ?? offering.subjectId,
        sectionCode: offering.sectionCode,
        room: offering.room,
        enrolledStudentIds: offering.enrolledStudentIds,
        totalSessions: sessions.length,
      };
    });
  }, [instructorId]);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    () => instructorClasses[0]?.classId ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const selectedClass =
    instructorClasses.find((c) => c.classId === selectedClassId) ??
    instructorClasses[0];

  const effectiveClassId = selectedClass?.classId ?? "";

  const classRecords = useMemo(
    () => attendanceRecords.filter((r) => r.classId === effectiveClassId),
    [attendanceRecords, effectiveClassId],
  );

  const filteredRecords = useMemo(() => {
    let r = classRecords;
    if (dateFrom) r = r.filter((rec) => rec.date >= dateFrom);
    if (dateTo) r = r.filter((rec) => rec.date <= dateTo);
    return r;
  }, [classRecords, dateFrom, dateTo]);

  const studentRows = useMemo<StudentAttendanceRow[]>(() => {
    if (!selectedClass) return [];
    return selectedClass.enrolledStudentIds
      .map((studentId) => {
        const student = gradeStudents[studentId];
        const summary = summarize(filteredRecords, studentId);
        const lastRecord = [...filteredRecords]
          .filter(
            (r) =>
              r.studentId === studentId &&
              (r.status === "present" || r.status === "late"),
          )
          .sort((a, b) => b.date.localeCompare(a.date))[0];
        return {
          studentId,
          studentName: student?.name ?? studentId,
          studentNumber: student?.studentNumber ?? "",
          summary,
          lastSeen: lastRecord?.date ?? null,
          isAtRisk: summary.attendanceRate < 75 && summary.total > 0,
        };
      })
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          r.studentName.toLowerCase().includes(q) ||
          r.studentNumber.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [selectedClass, filteredRecords, searchQuery]);

  const classSessions = useMemo<SessionRow[]>(() => {
    const sessionDates = [...new Set(filteredRecords.map((r) => r.date))]
      .sort()
      .reverse();
    const enrolledIds = selectedClass?.enrolledStudentIds ?? [];
    return sessionDates.map((date) => {
      const dayRecords = filteredRecords.filter((r) => r.date === date);
      const studentStatuses: Record<string, AttendanceStatus | "no-record"> =
        {};
      for (const sid of enrolledIds) {
        const rec = dayRecords.find((r) => r.studentId === sid);
        studentStatuses[sid] = rec ? rec.status : "no-record";
      }
      const sessionId = dayRecords[0]?.sessionId ?? date;
      return { sessionId, date, studentStatuses };
    });
  }, [filteredRecords, selectedClass]);

  const classSummary = useMemo<AttendanceSummary>(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter(
      (r) => r.status === "present",
    ).length;
    const late = filteredRecords.filter((r) => r.status === "late").length;
    const absent = filteredRecords.filter((r) => r.status === "absent").length;
    const excused = filteredRecords.filter(
      (r) => r.status === "excused",
    ).length;
    const attendanceRate =
      total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;
    return { total, present, late, absent, excused, attendanceRate };
  }, [filteredRecords]);

  const setSelectedClass = useCallback((id: string) => {
    setSelectedClassId(id);
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
  }, []);

  return {
    instructorClasses,
    selectedClass,
    setSelectedClass,
    studentRows,
    classSessions,
    classSummary,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  };
}
