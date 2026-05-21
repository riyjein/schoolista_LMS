import { useMemo } from "react";

import {
  computeAnnouncementStatistics,
  type Announcement,
  type AnnouncementStatistics,
  announcements as fallbackAnnouncements,
} from "@/lib/data/admin/announcements";
import { useSupabaseCrudTable } from "@/lib/supabase/useSupabaseCrudTable";

export interface UseAdminAnnouncementsResult {
  announcements: Announcement[];
  statistics: AnnouncementStatistics;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createAnnouncement: (payload: Partial<Announcement>) => Promise<Announcement | null>;
  updateAnnouncement: (id: string, payload: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

export function useAdminAnnouncements(): UseAdminAnnouncementsResult {
  const table = useSupabaseCrudTable<Announcement>({
    table: "announcements",
    fallback: fallbackAnnouncements,
    orderBy: "createdAt",
    ascending: false,
  });

  const statistics = useMemo(() => computeAnnouncementStatistics(table.data), [table.data]);

  return {
    announcements: table.data,
    statistics,
    loading: table.loading,
    error: table.error,
    refresh: table.refresh,
    createAnnouncement: table.createRow,
    updateAnnouncement: table.updateRowById,
    deleteAnnouncement: table.deleteRowById,
  };
}
