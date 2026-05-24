import type { ClassSchedule } from "../../types/attendance";

export const classSchedules: ClassSchedule[] = [];

export const getSchedulesByClass = (classId: string): ClassSchedule[] =>
  classSchedules.filter((s) => s.classId === classId);

export const getScheduleById = (id: string): ClassSchedule | undefined =>
  classSchedules.find((s) => s.id === id);

/** Returns which schedule (if any) is active for a given class on a given day name */
export const getScheduleForDay = (
  classId: string,
  dayName: string,
): ClassSchedule | undefined =>
  classSchedules.find(
    (s) =>
      s.classId === classId &&
      s.days.includes(dayName as ClassSchedule["days"][0]),
  );
