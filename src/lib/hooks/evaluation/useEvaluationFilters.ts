import { useState, useCallback, useMemo } from 'react';
import type { InstructorSummary } from '../../types/evaluation';

export interface EvalFilters {
  search: string;
  minRating: number; // 0 = no filter
  instructorId: string;
}

const DEFAULT_FILTERS: EvalFilters = { search: '', minRating: 0, instructorId: '' };

export function useEvaluationFilters(summaries: InstructorSummary[]) {
  const [filters, setFilters] = useState<EvalFilters>(DEFAULT_FILTERS);

  const setFilter = useCallback(
    <K extends keyof EvalFilters>(key: K, value: EvalFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const filtered = useMemo(() => {
    let list = summaries;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.instructorName.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.classStats.some((c) => c.subjectCode.toLowerCase().includes(q)),
      );
    }

    if (filters.minRating > 0) {
      list = list.filter((s) => s.overallRating !== null && s.overallRating >= filters.minRating);
    }

    if (filters.instructorId) {
      list = list.filter((s) => s.instructorId === filters.instructorId);
    }

    return list;
  }, [summaries, filters]);

  const hasActiveFilters = filters.search !== '' || filters.minRating > 0 || filters.instructorId !== '';

  return { filters, setFilter, clearFilters, filtered, hasActiveFilters };
}
