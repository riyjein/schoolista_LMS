import { useMemo } from "react";
import { Course } from "../../types/enrollment";
import { useSupabaseCrudTable } from "../../supabase/useSupabaseCrudTable";

export interface UseAdminProgramsResult {
  programs: Course[];
  departments: string[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProgram: (payload: Partial<Course>) => Promise<Course | null>;
  updateProgram: (id: string, payload: Partial<Course>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
}

export function useAdminPrograms(): UseAdminProgramsResult {
  const table = useSupabaseCrudTable<Course>({
    table: "courses",
    fallback: [],
    orderBy: "code",
  });

  const departments = useMemo(
    () => [...new Set(table.data.map((program) => program.department))].sort(),
    [table.data],
  );

  return {
    programs: table.data,
    departments,
    loading: table.loading,
    error: table.error,
    refresh: table.refresh,
    createProgram: table.createRow,
    updateProgram: table.updateRowById,
    deleteProgram: table.deleteRowById,
  };
}
