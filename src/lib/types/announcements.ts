export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AnnouncementStatus = 'draft' | 'published' | 'archived';
export type AnnouncementAudience =
  | 'all'
  | 'students'
  | 'faculty'
  | 'program-chairs'
  | 'stakeholders';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  audience: AnnouncementAudience[];
  authorId: string;
  authorName: string;
  createdAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  isPinned: boolean;
  viewCount: number;
}

export interface AnnouncementStatistics {
  totalAnnouncements: number;
  publishedAnnouncements: number;
  draftAnnouncements: number;
  archivedAnnouncements: number;
  urgentAnnouncements: number;
  pinnedAnnouncements: number;
}
