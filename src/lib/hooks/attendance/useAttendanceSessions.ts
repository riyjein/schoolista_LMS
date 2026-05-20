import { useMemo } from 'react';
import type { AttendanceSession } from '../../types/attendance';
import {
  attendanceSessions,
  demoSessions,
  getAllSessions,
  getSessionById,
  getSessionsForClass,
  getSessionsForDate,
  getDemoSessionsForDay,
} from '../../data/attendance/attendance-sessions';

export interface UseAttendanceSessionsReturn {
  sessions: AttendanceSession[];
  demoSessions: AttendanceSession[];
  allSessions: AttendanceSession[];
  getSessionById: (id: string) => AttendanceSession | undefined;
  getSessionsForClass: (classId: string) => AttendanceSession[];
  getSessionsForDate: (date: string) => AttendanceSession[];
  getDemoSessionsForDay: (day: 'Mon' | 'Tue' | 'Wed') => AttendanceSession[];
  getSessionsInDateRange: (from: string, to: string) => AttendanceSession[];
}

export function useAttendanceSessions(classId?: string): UseAttendanceSessionsReturn {
  const sessions = useMemo(
    () => (classId ? getSessionsForClass(classId) : attendanceSessions),
    [classId],
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
