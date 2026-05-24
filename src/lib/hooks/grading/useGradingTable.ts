import { useState, useMemo, useCallback } from 'react';
import type { GradeRow } from './useGradeEncoding';
import type { GradeStatus } from '../../types/grades';

export type SortField = 'studentName' | 'studentNumber' | 'prelim' | 'midterm' | 'final' | 'overall' | 'status';
export type SortDir = 'asc' | 'desc';
export type PeriodFocus = 'all' | 'prelim' | 'midterm' | 'final';

const PAGE_SIZE = 10;

function compareRows(a: GradeRow, b: GradeRow, field: SortField, dir: SortDir): number {
  let diff = 0;
  switch (field) {
    case 'studentName':   diff = a.studentName.localeCompare(b.studentName); break;
    case 'studentNumber': diff = a.studentNumber.localeCompare(b.studentNumber); break;
    case 'prelim':        diff = (a.prelim ?? -1) - (b.prelim ?? -1); break;
    case 'midterm':       diff = (a.midterm ?? -1) - (b.midterm ?? -1); break;
    case 'final':         diff = (a.final ?? -1) - (b.final ?? -1); break;
    case 'overall':       diff = (a.computed.overall ?? -1) - (b.computed.overall ?? -1); break;
    case 'status': {
      const order: Record<GradeStatus, number> = { draft: 0, submitted: 1, finalized: 2 };
      diff = order[a.effectiveStatus] - order[b.effectiveStatus];
      break;
    }
  }
  return dir === 'asc' ? diff : -diff;
}

export interface GradingTableState {
  searchQuery: string;
  statusFilter: GradeStatus | 'all';
  periodFocus: PeriodFocus;
  sortField: SortField;
  sortDir: SortDir;
  currentPage: number;
  filteredTotal: number;
  totalPages: number;
  pageRows: GradeRow[];
  setSearch: (q: string) => void;
  setStatusFilter: (s: GradeStatus | 'all') => void;
  setPeriodFocus: (p: PeriodFocus) => void;
  toggleSort: (field: SortField) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function useGradingTable(rows: GradeRow[]): GradingTableState {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<GradeStatus | 'all'>('all');
  const [periodFocus, setPeriodFocus] = useState<PeriodFocus>('all');
  const [sortField, setSortField] = useState<SortField>('studentName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const setSearch = useCallback((q: string) => { setSearchQuery(q); setCurrentPage(1); }, []);
  const setStatusFilterAndReset = useCallback((s: GradeStatus | 'all') => { setStatusFilter(s); setCurrentPage(1); }, []);
  const setPeriodFocusAndReset = useCallback((p: PeriodFocus) => { setPeriodFocus(p); setCurrentPage(1); }, []);

  const toggleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); return field; }
      setSortDir('asc');
      return field;
    });
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setPeriodFocus('all');
    setSortField('studentName');
    setSortDir('asc');
    setCurrentPage(1);
  }, []);

  const filtered = useMemo(() => {
    let list = rows;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.studentNumber.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((r) => r.effectiveStatus === statusFilter);
    }

    if (periodFocus === 'prelim') list = list.filter((r) => r.prelim === null);
    else if (periodFocus === 'midterm') list = list.filter((r) => r.midterm === null);
    else if (periodFocus === 'final') list = list.filter((r) => r.final === null);

    return [...list].sort((a, b) => compareRows(a, b, sortField, sortDir));
  }, [rows, searchQuery, statusFilter, periodFocus, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== 'all' || periodFocus !== 'all';

  return {
    searchQuery,
    statusFilter,
    periodFocus,
    sortField,
    sortDir,
    currentPage: safePage,
    filteredTotal: filtered.length,
    totalPages,
    pageRows,
    setSearch,
    setStatusFilter: setStatusFilterAndReset,
    setPeriodFocus: setPeriodFocusAndReset,
    toggleSort,
    setPage: setCurrentPage,
    resetFilters,
    hasActiveFilters,
  };
}
