import { useState, useMemo, useCallback } from "react";
import type {
  EnrichedAttendanceRecord,
  AttendanceSummary,
  AttendanceStatus,
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

export interface AttendanceFilters {
  classId: string;
  status: AttendanceStatus | "";
  dateFrom: string;
  dateTo: string;
  search: string;
}

export type SortField = "date" | "subject" | "status" | "timeIn";
export type SortDir = "asc" | "desc";

export interface UseAttendanceHistoryReturn {
  filters: AttendanceFilters;
  setFilter: <K extends keyof AttendanceFilters>(
    key: K,
    value: AttendanceFilters[K],
  ) => void;
  clearFilters: () => void;
  sortField: SortField;
  sortDir: SortDir;
  setSort: (field: SortField) => void;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  totalPages: number;
  allFiltered: EnrichedAttendanceRecord[];
  paginated: EnrichedAttendanceRecord[];
  summary: AttendanceSummary;
  availableClasses: { id: string; subjectCode: string; subjectTitle: string }[];
}

const DEFAULT_FILTERS: AttendanceFilters = {
  classId: "",
  status: "",
  dateFrom: "",
  dateTo: "",
  search: "",
};

const PAGE_SIZE = 15;

export function useAttendanceHistory(
  studentId: string,
): UseAttendanceHistoryReturn {
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

  const [filters, setFilters] = useState<AttendanceFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const setFilter = useCallback(
    <K extends keyof AttendanceFilters>(
      key: K,
      value: AttendanceFilters[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const setSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else setSortDir("asc");
      return field;
    });
    setPage(1);
  }, []);

  const enrichedRecords = useMemo(
    () =>
      attendanceRecords
        .filter((r) => r.studentId === studentId)
        .map((r) =>
          enrichRecord(
            r,
            classOfferings,
            classSchedules,
            instructors,
            subjects,
          ),
        ),
    [
      studentId,
      attendanceRecords,
      classOfferings,
      classSchedules,
      instructors,
      subjects,
    ],
  );

  const availableClasses = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; subjectCode: string; subjectTitle: string }[] =
      [];
    for (const r of enrichedRecords) {
      if (!seen.has(r.classId)) {
        seen.add(r.classId);
        result.push({
          id: r.classId,
          subjectCode: r.subjectCode,
          subjectTitle: r.subjectTitle,
        });
      }
    }
    return result.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));
  }, [enrichedRecords]);

  const allFiltered = useMemo(() => {
    let records = enrichedRecords;

    if (filters.classId)
      records = records.filter((r) => r.classId === filters.classId);
    if (filters.status)
      records = records.filter((r) => r.status === filters.status);
    if (filters.dateFrom)
      records = records.filter((r) => r.date >= filters.dateFrom);
    if (filters.dateTo)
      records = records.filter((r) => r.date <= filters.dateTo);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.subjectCode.toLowerCase().includes(q) ||
          r.subjectTitle.toLowerCase().includes(q) ||
          r.instructorName.toLowerCase().includes(q) ||
          r.date.includes(q),
      );
    }

    records = [...records].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.date.localeCompare(b.date);
      else if (sortField === "subject")
        cmp = a.subjectCode.localeCompare(b.subjectCode);
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      else if (sortField === "timeIn") cmp = a.timeIn.localeCompare(b.timeIn);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return records;
  }, [enrichedRecords, filters, sortField, sortDir]);

  const summary = useMemo<AttendanceSummary>(() => {
    const total = allFiltered.length;
    const present = allFiltered.filter((r) => r.status === "present").length;
    const late = allFiltered.filter((r) => r.status === "late").length;
    const absent = allFiltered.filter((r) => r.status === "absent").length;
    const excused = allFiltered.filter((r) => r.status === "excused").length;
    const attendanceRate =
      total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;
    return { total, present, late, absent, excused, attendanceRate };
  }, [allFiltered]);

  const totalPages = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE));

  const paginated = useMemo(
    () => allFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allFiltered, page],
  );

  return {
    filters,
    setFilter,
    clearFilters,
    sortField,
    sortDir,
    setSort,
    page,
    pageSize: PAGE_SIZE,
    setPage,
    totalPages,
    allFiltered,
    paginated,
    summary,
    availableClasses,
    isLoading:
      attendanceRecordsLoading ||
      classOfferingsLoading ||
      classSchedulesLoading ||
      instructorsLoading ||
      subjectsLoading,
  };
}
