import { useMemo } from "react";

import {
  computeUserStatistics,
  type UserStatistics,
  users as fallbackUsers,
} from "../../data/admin/users";
import {
  computeAnnouncementStatistics,
  announcements as fallbackAnnouncements,
} from "../../data/admin/announcements";
import { courses as fallbackCourses } from "../../data/enrollment/courses";
import { subjects as fallbackSubjects } from "../../data/enrollment/subjects";
import { sections as fallbackSections } from "../../data/schedule/sections";
import { useSupabaseTable } from "../../supabase/useSupabaseTable";
import { AnnouncementStatistics } from "../../types/announcements";

export interface AdminCatalogStatistics {
  totalPrograms: number;
  totalSubjects: number;
  totalSections: number;
}

export interface AdminDashboardMetrics {
  userStatistics: UserStatistics;
  announcementStatistics: AnnouncementStatistics;
  catalogStatistics: AdminCatalogStatistics;
  loading: boolean;
}

export function useAdminDashboardMetrics(): AdminDashboardMetrics {
  const { data: users, loading: usersLoading } = useSupabaseTable({
    table: "users",
    fallback: fallbackUsers,
    orderBy: "name",
  });
  const { data: announcements, loading: announcementsLoading } =
    useSupabaseTable({
      table: "announcements",
      fallback: fallbackAnnouncements,
      orderBy: "created_at",
      ascending: false,
    });
  const { data: courses, loading: coursesLoading } = useSupabaseTable({
    table: "courses",
    fallback: fallbackCourses,
    orderBy: "code",
  });
  const { data: subjects, loading: subjectsLoading } = useSupabaseTable({
    table: "subjects",
    fallback: fallbackSubjects,
    orderBy: "code",
  });
  const { data: sections, loading: sectionsLoading } = useSupabaseTable({
    table: "sections",
    fallback: fallbackSections,
    orderBy: "code",
  });

  const userStatistics = useMemo(() => computeUserStatistics(users), [users]);
  const announcementStatistics = useMemo(
    () => computeAnnouncementStatistics(),
    [announcements],
  );

  const catalogStatistics = useMemo(
    () => ({
      totalPrograms: courses.length,
      totalSubjects: subjects.length,
      totalSections: sections.length,
    }),
    [courses.length, sections.length, subjects.length],
  );

  return {
    userStatistics,
    announcementStatistics,
    catalogStatistics,
    loading:
      usersLoading ||
      announcementsLoading ||
      coursesLoading ||
      subjectsLoading ||
      sectionsLoading,
  };
}
