import { useState, useMemo, useCallback } from 'react';
import type { EnrichedGradeRecord, GradeStatus, GradeRemark } from '../../types/grades';
import { getGradesForStudent } from '../../data/grades/grades';
import { gradeStudents } from '../../data/grades/grades';
import { classOfferings } from '../../data/attendance/class-offerings';
import { subjects } from '../../data/enrollment/subjects';
import { instructors } from '../../data/attendance/instructors';
import { computeOverallGrade } from './useGradeComputation';
import { gradeSettings } from '../../data/grades/grade-settings';

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

function enrichRecord(r: ReturnType<typeof getGradesForStudent>[0]): EnrichedGradeRecord {
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

  const records = useMemo(() => getGradesForStudent(studentId).map(enrichRecord), [studentId]);

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
