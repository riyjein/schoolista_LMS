import { useState, useMemo, useCallback } from 'react';
import type { GradeRecord, EnrichedGradeRecord, GradeStatus, GradeRemark } from '../../types/grades';
import { gradeRecords as fallbackGradeRecords, gradeStudents } from '../../data/grades/grades';
import { classOfferings as fallbackClassOfferings } from '../../data/attendance/class-offerings';
import { subjects as fallbackSubjects } from '../../data/enrollment/subjects';
import { instructors as fallbackInstructors } from '../../data/attendance/instructors';
import { computeOverallGrade } from './useGradeComputation';
import { gradeSettings } from '../../data/grades/grade-settings';
import { useSupabaseTable } from '../../supabase/useSupabaseTable';

export type GradeSortField = 'subject' | 'overall' | 'gradePoint' | 'remarks' | 'status';
export type SortDir = 'asc' | 'desc';

export interface GradeFilters {
  status: GradeStatus | '';
  remarks: GradeRemark | '';
  search: string;
}

export interface UseGradeTableReturn {
  records: EnrichedGradeRecord[];
  filters: GradeFilters;
  setFilter: <K extends keyof GradeFilters>(key: K, value: GradeFilters[K]) => void;
  clearFilters: () => void;
  sortField: GradeSortField;
  sortDir: SortDir;
  setSort: (field: GradeSortField) => void;
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  paginated: EnrichedGradeRecord[];
}

const PAGE_SIZE = 10;
const DEFAULT_FILTERS: GradeFilters = { status: '', remarks: '', search: '' };

function enrichRecord(
  r: GradeRecord,
  classOfferings: typeof fallbackClassOfferings,
  subjects: typeof fallbackSubjects,
  instructors: typeof fallbackInstructors,
): EnrichedGradeRecord {
  const student = gradeStudents[r.studentId];
  const offering = classOfferings.find((o) => o.id === r.classId);
  const subject = subjects.find((s) => s.id === r.subjectId);
  const instructor = instructors.find((i) => i.id === r.instructorId);
  const computed = computeOverallGrade(r.prelimGrade, r.midtermGrade, r.finalGrade, gradeSettings);

  return {
    ...r,
    studentName: student?.name ?? r.studentId,
    studentNumber: student?.studentNumber ?? '',
    subjectCode: subject?.code ?? r.subjectId,
    subjectTitle: subject?.title ?? r.subjectId,
    subjectUnits: subject?.units ?? 0,
    instructorName: instructor?.name ?? r.instructorId,
    computed,
  };
}

export function useGradeTable(studentId: string): UseGradeTableReturn {
  const { data: gradeRecords } = useSupabaseTable({
    table: 'grade_records',
    fallback: fallbackGradeRecords,
    orderBy: 'id',
  });
  const { data: classOfferings } = useSupabaseTable({
    table: 'class_offerings_view',
    fallback: fallbackClassOfferings,
    orderBy: 'id',
  });
  const { data: subjects } = useSupabaseTable({
    table: 'subjects',
    fallback: fallbackSubjects,
    orderBy: 'code',
  });
  const { data: instructors } = useSupabaseTable({
    table: 'instructors',
    fallback: fallbackInstructors,
    orderBy: 'name',
  });
  const [filters, setFilters] = useState<GradeFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<GradeSortField>('subject');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const setFilter = useCallback(
    <K extends keyof GradeFilters>(key: K, value: GradeFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    [],
  );

  const clearFilters = useCallback(() => { setFilters(DEFAULT_FILTERS); setPage(1); }, []);

  const setSort = useCallback((field: GradeSortField) => {
    setSortField((prev) => {
      if (prev === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      else setSortDir('asc');
      return field;
    });
    setPage(1);
  }, []);

  const records = useMemo(
    () => gradeRecords.filter((r) => r.studentId === studentId).map((r) => enrichRecord(r, classOfferings, subjects, instructors)),
    [studentId, gradeRecords, classOfferings, subjects, instructors],
  );

  const filtered = useMemo(() => {
    let list = records;
    if (filters.status) list = list.filter((r) => r.status === filters.status);
    if (filters.remarks) list = list.filter((r) => r.computed.remarks === filters.remarks);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.subjectCode.toLowerCase().includes(q) ||
          r.subjectTitle.toLowerCase().includes(q) ||
          r.instructorName.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'subject') cmp = a.subjectCode.localeCompare(b.subjectCode);
      else if (sortField === 'overall') cmp = (a.computed.overall ?? -1) - (b.computed.overall ?? -1);
      else if (sortField === 'gradePoint') cmp = (a.computed.gradePoint ?? 99) - (b.computed.gradePoint ?? 99);
      else if (sortField === 'remarks') cmp = a.computed.remarks.localeCompare(b.computed.remarks);
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [records, filters, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  return { records: filtered, filters, setFilter, clearFilters, sortField, sortDir, setSort, page, totalPages, setPage, paginated };
}
