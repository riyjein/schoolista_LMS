// ─── Types ────────────────────────────────────────────────────────────────────

export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AnnouncementStatus = 'draft' | 'published' | 'archived';
export type AnnouncementAudience = 'all' | 'students' | 'faculty' | 'program-chairs' | 'stakeholders';

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

// ─── Mock Announcements Data ──────────────────────────────────────────────────

export const announcements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Enrollment for 2nd Semester Now Open',
    content: 'Online enrollment for the 2nd Semester of AY 2024-2025 is now open. All students are required to enroll by December 15, 2024. Late enrollment will incur additional fees.',
    priority: 'high',
    status: 'published',
    audience: ['students'],
    authorId: 'admin-1',
    authorName: 'System Administrator',
    createdAt: '2024-11-01',
    publishedAt: '2024-11-01',
    expiresAt: '2024-12-15',
    isPinned: true,
    viewCount: 1547,
  },
  {
    id: 'ann-2',
    title: 'Faculty Development Workshop - December 5',
    content: 'All faculty members are invited to attend the Faculty Development Workshop on Modern Teaching Methodologies. The workshop will be held on December 5, 2024, from 9:00 AM to 4:00 PM at the University Auditorium.',
    priority: 'medium',
    status: 'published',
    audience: ['faculty'],
    authorId: 'u5',
    authorName: 'Maria Clara Santos',
    createdAt: '2024-10-28',
    publishedAt: '2024-10-28',
    expiresAt: '2024-12-05',
    isPinned: false,
    viewCount: 342,
  },
  {
    id: 'ann-3',
    title: 'System Maintenance - November 25',
    content: 'The LMS will undergo scheduled maintenance on November 25, 2024, from 2:00 AM to 6:00 AM. During this time, the system will be temporarily unavailable. Please plan your activities accordingly.',
    priority: 'urgent',
    status: 'published',
    audience: ['all'],
    authorId: 'admin-1',
    authorName: 'System Administrator',
    createdAt: '2024-11-15',
    publishedAt: '2024-11-15',
    expiresAt: '2024-11-26',
    isPinned: true,
    viewCount: 2134,
  },
  {
    id: 'ann-4',
    title: 'Final Exam Schedule Released',
    content: 'The final examination schedule for the 1st Semester AY 2024-2025 has been published. Students can view their exam schedules in the portal. Please report any conflicts to the Registrar\'s Office.',
    priority: 'high',
    status: 'published',
    audience: ['students', 'faculty'],
    authorId: 'u4',
    authorName: 'Dr. Roberto Mendez',
    createdAt: '2024-11-10',
    publishedAt: '2024-11-10',
    expiresAt: '2024-12-20',
    isPinned: false,
    viewCount: 1876,
  },
  {
    id: 'ann-5',
    title: 'New Library Hours',
    content: 'Starting December 1, the University Library will extend its operating hours. New hours: Monday-Friday 7:00 AM - 10:00 PM, Saturday 8:00 AM - 6:00 PM, Sunday 10:00 AM - 4:00 PM.',
    priority: 'low',
    status: 'published',
    audience: ['all'],
    authorId: 'admin-1',
    authorName: 'System Administrator',
    createdAt: '2024-11-18',
    publishedAt: '2024-11-18',
    expiresAt: null,
    isPinned: false,
    viewCount: 543,
  },
  {
    id: 'ann-6',
    title: 'Accreditation Visit Preparation',
    content: 'DRAFT: Program chairs are requested to prepare all necessary documentation for the upcoming accreditation visit scheduled for January 2025.',
    priority: 'high',
    status: 'draft',
    audience: ['program-chairs'],
    authorId: 'u5',
    authorName: 'Maria Clara Santos',
    createdAt: '2024-11-19',
    publishedAt: null,
    expiresAt: null,
    isPinned: false,
    viewCount: 0,
  },
  {
    id: 'ann-7',
    title: 'Graduation Requirements Reminder',
    content: 'All graduating students must submit their clearance forms by January 10, 2025. Please ensure all academic and financial obligations are settled.',
    priority: 'medium',
    status: 'published',
    audience: ['students'],
    authorId: 'admin-1',
    authorName: 'System Administrator',
    createdAt: '2024-11-12',
    publishedAt: '2024-11-12',
    expiresAt: '2025-01-10',
    isPinned: false,
    viewCount: 892,
  },
];

// ─── Compute Statistics ───────────────────────────────────────────────────────

function computeAnnouncementStatistics(): AnnouncementStatistics {
  return {
    totalAnnouncements: announcements.length,
    publishedAnnouncements: announcements.filter((a) => a.status === 'published').length,
    draftAnnouncements: announcements.filter((a) => a.status === 'draft').length,
    archivedAnnouncements: announcements.filter((a) => a.status === 'archived').length,
    urgentAnnouncements: announcements.filter((a) => a.priority === 'urgent').length,
    pinnedAnnouncements: announcements.filter((a) => a.isPinned).length,
  };
}

export const announcementStatistics: AnnouncementStatistics = computeAnnouncementStatistics();

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getAnnouncementById = (id: string): Announcement | undefined =>
  announcements.find((a) => a.id === id);

export const getAnnouncementsByStatus = (status: AnnouncementStatus): Announcement[] =>
  announcements.filter((a) => a.status === status);

export const getAnnouncementsByAudience = (audience: AnnouncementAudience): Announcement[] =>
  announcements.filter((a) => a.audience.includes(audience) || a.audience.includes('all'));

export const getPinnedAnnouncements = (): Announcement[] =>
  announcements.filter((a) => a.isPinned && a.status === 'published');
