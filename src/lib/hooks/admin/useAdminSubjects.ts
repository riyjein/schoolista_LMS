import { useMemo } from "react";
import { Subject } from "../../types/enrollment";
import { useSupabaseCrudTable } from "../../supabase/useSupabaseCrudTable";

export interface SubjectStatistics {
  totalSubjects: number;
  majorSubjects: number;
  minorSubjects: number;
  generalEducationSubjects: number;
  electiveSubjects: number;
}

export interface UseAdminSubjectsResult {
  subjects: Subject[];
  departments: string[];
  statistics: SubjectStatistics;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSubject: (payload: Partial<Subject>) => Promise<Subject | null>;
  updateSubject: (id: string, payload: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
}

function computeSubjectStatistics(subjects: Subject[]): SubjectStatistics {
  return {
    totalSubjects: subjects.length,
    majorSubjects: subjects.filter((subject) => subject.type === "major").length,
    minorSubjects: subjects.filter((subject) => subject.type === "minor").length,
    generalEducationSubjects: subjects.filter((subject) => subject.type === "GE").length,
    electiveSubjects: subjects.filter((subject) => subject.type === "elective").length,
  };
}

export function useAdminSubjects(): UseAdminSubjectsResult {
  const table = useSupabaseCrudTable<Subject>({
    table: "subjects",
    fallback: [],
    orderBy: "code",
  });

  const departments = useMemo(
    () => [...new Set(table.data.map((subject) => subject.department))].sort(),
    [table.data],
  );

  const statistics = useMemo(() => computeSubjectStatistics(table.data), [table.data]);

  return {
    subjects: table.data,
    departments,
    statistics,
    loading: table.loading,
    error: table.error,
    refresh: table.refresh,
    createSubject: table.createRow,
    updateSubject: table.updateRowById,
    deleteSubject: table.deleteRowById,
  };
}
