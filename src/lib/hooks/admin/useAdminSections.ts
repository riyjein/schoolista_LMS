import { useMemo } from "react";
import { useSupabaseCrudTable } from "../../supabase/useSupabaseCrudTable";

export interface Section {
  id: string;
  code: string;
  courseId: string;
  yearLevel: number;
  schoolYear: string;
  semester: string;
  maxStudents: number;
}

export interface UseAdminSectionsResult {
  sections: Section[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSection: (payload: Partial<Section>) => Promise<Section | null>;
  updateSection: (id: string, payload: Partial<Section>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
}

export function useAdminSections(): UseAdminSectionsResult {
  const table = useSupabaseCrudTable<Section>({
    table: "sections",
    fallback: [],
    orderBy: "code",
  });

  return {
    sections: table.data,
    loading: table.loading,
    error: table.error,
    refresh: table.refresh,
    createSection: table.createRow,
    updateSection: table.updateRowById,
    deleteSection: table.deleteRowById,
  };
}
