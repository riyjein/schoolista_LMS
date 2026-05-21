import { useMemo } from "react";

import {
  computeUserStatistics,
  type User,
  type UserStatistics,
  users as fallbackUsers,
} from "@/lib/data/admin/users";
import { useSupabaseCrudTable } from "@/lib/supabase/useSupabaseCrudTable";

export interface UseAdminUsersResult {
  users: User[];
  statistics: UserStatistics;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createUser: (payload: Partial<User>) => Promise<User | null>;
  updateUser: (id: string, payload: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export function useAdminUsers(): UseAdminUsersResult {
  const table = useSupabaseCrudTable<User>({
    table: "users",
    fallback: fallbackUsers,
    orderBy: "name",
  });

  const statistics = useMemo(() => computeUserStatistics(table.data), [table.data]);

  return {
    users: table.data,
    statistics,
    loading: table.loading,
    error: table.error,
    refresh: table.refresh,
    createUser: table.createRow,
    updateUser: table.updateRowById,
    deleteUser: table.deleteRowById,
  };
}
