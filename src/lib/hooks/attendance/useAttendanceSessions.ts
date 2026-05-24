import { useMemo } from "react";
import type { AttendanceSession } from "../../types/attendance";
import {
  attendanceSessions as fallbackAttendanceSessions,
  demoSessions,
  getAllSessions,
  getSessionById,
  getSessionsForClass,
  getSessionsForDate,
  getDemoSessionsForDay,
} from "../../data/attendance/attendance-sessions";
import { useSupabaseTable } from "../../supabase/useSupabaseTable";

export interface UseAttendanceSessionsReturn {
  sessions: AttendanceSession[];
  demoSessions: AttendanceSession[];
  allSessions: AttendanceSession[];
  getSessionById: (id: string) => AttendanceSession | undefined;
  getSessionsForClass: (classId: string) => AttendanceSession[];
  getSessionsForDate: (date: string) => AttendanceSession[];
  getDemoSessionsForDay: (day: "Mon" | "Tue" | "Wed") => AttendanceSession[];
  getSessionsInDateRange: (from: string, to: string) => AttendanceSession[];
}

export function useAttendanceSessions(
  classId?: string,
): UseAttendanceSessionsReturn {
  const { data: attendanceSessions } = useSupabaseTable({
    table: "attendance_sessions",
    fallback: fallbackAttendanceSessions,
    orderBy: "date",
  });

  const sessions = useMemo(
    () => (classId ? getSessionsForClass(classId) : attendanceSessions),
    [classId, attendanceSessions],
  );

  const getSessionsInDateRange = useMemo(
    () => (from: string, to: string) =>
      getAllSessions().filter((s) => s.date >= from && s.date <= to),
    [],
  );

  return {
    sessions,
    demoSessions,
    allSessions: getAllSessions(),
    getSessionById,
    getSessionsForClass,
    getSessionsForDate,
    getDemoSessionsForDay,
    getSessionsInDateRange,
  };
}
