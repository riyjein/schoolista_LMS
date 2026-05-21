import type { AttendanceSession, DayOfWeek } from "../../types/attendance";
import { classSchedules } from "./schedules";
import { attendanceSettings } from "./attendance-settings";

const DAY_NAMES: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function getDayName(date: Date): DayOfWeek {
  // getDay() returns 0=Sun, 1=Mon … 6=Sat
  const idx = (date.getDay() + 6) % 7; // Mon=0 … Sat=5
  return DAY_NAMES[idx];
}

function generateSessionsForRange(
  start: string,
  end: string,
): AttendanceSession[] {
  const sessions: AttendanceSession[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  let sessionCounter = 1;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayName = getDayName(new Date(d));
    const dateStr = d.toISOString().split("T")[0];

    for (const sched of classSchedules) {
      if (!sched.days.includes(dayName)) continue;

      const openTime = addMinutes(
        sched.startTime,
        -attendanceSettings.openingBufferMinutes,
      );
      const closeTime = addMinutes(
        sched.endTime,
        attendanceSettings.closingWindowMinutes,
      );
      const lateAfter = addMinutes(
        sched.startTime,
        attendanceSettings.lateThresholdMinutes,
      );

      sessions.push({
        id: `session-${String(sessionCounter).padStart(4, "0")}`,
        classId: sched.classId,
        scheduleId: sched.id,
        date: dateStr,
        openTime,
        closeTime,
        lateAfter,
        status: "closed", // historical sessions are all closed
      });
      sessionCounter++;
    }
  }
  return sessions;
}

// Generate for full 1st semester 2024-2025 (Aug 5 – Oct 25, 2024)
export const attendanceSessions: AttendanceSession[] = [];

// Simulated "demo sessions" — future dates that map to specific demo days
// These are the sessions the RFID scanner will use for live simulation
export const demoSessions: AttendanceSession[] = [];

export const getAllSessions = (): AttendanceSession[] => [
  ...attendanceSessions,
  ...demoSessions,
];

export const getSessionById = (id: string): AttendanceSession | undefined =>
  getAllSessions().find((s) => s.id === id);

export const getSessionsForClass = (classId: string): AttendanceSession[] =>
  attendanceSessions.filter((s) => s.classId === classId);

export const getSessionsForDate = (date: string): AttendanceSession[] =>
  getAllSessions().filter((s) => s.date === date);

export const getDemoSessionsForDay = (
  dayType: "Mon" | "Tue" | "Wed",
): AttendanceSession[] => {
  const dateMap = { Mon: "2024-09-16", Tue: "2024-09-17", Wed: "2024-09-18" };
  return demoSessions.filter((s) => s.date === dateMap[dayType]);
};
