import { useState, useMemo, useCallback } from "react";
import type {
  DayAttendance,
  EnrichedAttendanceRecord,
  AttendanceSummary,
} from "../../types/attendance";
import { attendanceRecords as fallbackAttendanceRecords } from "../../data/attendance/attendance-records";
import { classOfferings as fallbackClassOfferings } from "../../data/attendance/class-offerings";
import { classSchedules as fallbackClassSchedules } from "../../data/attendance/schedules";
import { instructors as fallbackInstructors } from "../../data/attendance/instructors";
import { subjects as fallbackSubjects } from "../../data/enrollment/subjects";
import { useSupabaseTable } from "../../supabase/useSupabaseTable";

function enrichRecord(
  r: (typeof fallbackAttendanceRecords)[number],
  classOfferings: typeof fallbackClassOfferings,
  classSchedules: typeof fallbackClassSchedules,
  instructors: typeof fallbackInstructors,
  subjects: typeof fallbackSubjects,
): EnrichedAttendanceRecord {
  const offering = classOfferings.find((o) => o.id === r.classId);
  const subject = subjects.find((s) => s.id === r.subjectId);
  const instructor = instructors.find((i) => i.id === r.instructorId);
  const schedule = classSchedules.find((s) => s.classId === r.classId);

  return {
    ...r,
    subjectCode: subject?.code ?? r.subjectId,
    subjectTitle: subject?.title ?? r.subjectId,
    instructorName: instructor?.name ?? r.instructorId,
    sessionStartTime: schedule?.startTime ?? "--:--",
    sessionEndTime: schedule?.endTime ?? "--:--",
  };
}

export type CalendarView = "month" | "week";

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  dayAttendance: DayAttendance | null;
}

export interface UseAttendanceCalendarReturn {
  view: CalendarView;
  setView: (v: CalendarView) => void;
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
  classFilter: string; // classId or '' for all
  setClassFilter: (id: string) => void;
  currentYear: number;
  currentMonth: number; // 0-indexed
  setCurrentMonth: (year: number, month: number) => void;
  currentWeekStart: Date;
  setCurrentWeekStart: (d: Date) => void;
  calendarGrid: CalendarDay[];
  weekGrid: CalendarDay[];
  dayAttendanceMap: Map<string, DayAttendance>;
  summary: AttendanceSummary;
  selectedDayAttendance: DayAttendance | null;
  isLoading: boolean;
}

function buildDayAttendance(
  date: string,
  records: EnrichedAttendanceRecord[],
): DayAttendance {
  return {
    date,
    records,
    hasAbsence: records.some((r) => r.status === "absent"),
    hasLate: records.some((r) => r.status === "late"),
    hasPresent: records.some((r) => r.status === "present"),
    hasExcused: records.some((r) => r.status === "excused"),
  };
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function useAttendanceCalendar(
  studentId: string,
): UseAttendanceCalendarReturn {
  const { data: attendanceRecords, loading: attendanceRecordsLoading } =
    useSupabaseTable({
      table: "attendance_records",
      fallback: fallbackAttendanceRecords,
      orderBy: "date",
    });
  const { data: classOfferings, loading: classOfferingsLoading } =
    useSupabaseTable({
      table: "class_offerings",
      fallback: fallbackClassOfferings,
      orderBy: "id",
    });
  const { data: classSchedules, loading: classSchedulesLoading } =
    useSupabaseTable({
      table: "class_schedules",
      fallback: fallbackClassSchedules,
      orderBy: "id",
    });
  const { data: instructors, loading: instructorsLoading } = useSupabaseTable({
    table: "instructors",
    fallback: fallbackInstructors,
    orderBy: "name",
  });
  const { data: subjects, loading: subjectsLoading } = useSupabaseTable({
    table: "subjects",
    fallback: fallbackSubjects,
    orderBy: "code",
  });

  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState("");
  const [currentYear, setYear] = useState(2024);
  const [currentMonth, setMonth] = useState(7); // August = index 7

  // Start week on Monday of the first week with records
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(2024, 7, 5)),
  );

  const setCurrentMonth = useCallback((year: number, month: number) => {
    setYear(year);
    setMonth(month);
  }, []);

  const enrichedRecords = useMemo(() => {
    const raw = attendanceRecords.filter((r) => r.studentId === studentId);
    const filtered = classFilter
      ? raw.filter((r) => r.classId === classFilter)
      : raw;
    return filtered.map((r) =>
      enrichRecord(r, classOfferings, classSchedules, instructors, subjects),
    );
  }, [
    studentId,
    classFilter,
    attendanceRecords,
    classOfferings,
    classSchedules,
    instructors,
    subjects,
  ]);

  const dayAttendanceMap = useMemo(() => {
    const map = new Map<string, DayAttendance>();
    const byDate = new Map<string, EnrichedAttendanceRecord[]>();

    for (const r of enrichedRecords) {
      if (!byDate.has(r.date)) byDate.set(r.date, []);
      byDate.get(r.date)!.push(r);
    }

    for (const [date, records] of byDate) {
      map.set(date, buildDayAttendance(date, records));
    }
    return map;
  }, [enrichedRecords]);

  const summary = useMemo<AttendanceSummary>(() => {
    const total = enrichedRecords.length;
    const present = enrichedRecords.filter(
      (r) => r.status === "present",
    ).length;
    const late = enrichedRecords.filter((r) => r.status === "late").length;
    const absent = enrichedRecords.filter((r) => r.status === "absent").length;
    const excused = enrichedRecords.filter(
      (r) => r.status === "excused",
    ).length;
    const attendanceRate =
      total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;
    return { total, present, late, absent, excused, attendanceRate };
  }, [enrichedRecords]);

  const calendarGrid = useMemo((): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Pad start (Mon = 0)
    const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = startPad; i > 0; i--) {
      const d = new Date(currentYear, currentMonth, 1 - i);
      const date = formatDate(d);
      days.push({
        date,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        dayAttendance: dayAttendanceMap.get(date) ?? null,
      });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(currentYear, currentMonth, day);
      const date = formatDate(d);
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        dayAttendance: dayAttendanceMap.get(date) ?? null,
      });
    }

    // Pad end to fill last row
    const endPad = 7 - (days.length % 7 === 0 ? 7 : days.length % 7);
    for (let i = 1; i <= endPad; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const date = formatDate(d);
      days.push({
        date,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        dayAttendance: dayAttendanceMap.get(date) ?? null,
      });
    }

    return days;
  }, [currentYear, currentMonth, dayAttendanceMap]);

  const weekGrid = useMemo((): CalendarDay[] => {
    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      const date = formatDate(d);
      days.push({
        date,
        dayNumber: d.getDate(),
        isCurrentMonth: d.getMonth() === currentMonth,
        dayAttendance: dayAttendanceMap.get(date) ?? null,
      });
    }
    return days;
  }, [currentWeekStart, currentMonth, dayAttendanceMap]);

  const selectedDayAttendance = useMemo(
    () => (selectedDate ? (dayAttendanceMap.get(selectedDate) ?? null) : null),
    [selectedDate, dayAttendanceMap],
  );

  return {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    classFilter,
    setClassFilter,
    currentYear,
    currentMonth,
    setCurrentMonth,
    currentWeekStart,
    setCurrentWeekStart,
    calendarGrid,
    weekGrid,
    dayAttendanceMap,
    summary,
    selectedDayAttendance,
    isLoading:
      attendanceRecordsLoading ||
      classOfferingsLoading ||
      classSchedulesLoading ||
      instructorsLoading ||
      subjectsLoading,
  };
}
