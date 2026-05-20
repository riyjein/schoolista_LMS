import { useState, useMemo } from 'react';
import {
  announcements,
  announcementStatistics,
  type AnnouncementStatus,
  type AnnouncementPriority,
} from '@/lib/data/admin/announcements';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Search, Megaphone, Plus, Eye, Pin, AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';

export default function AnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query) ||
          a.authorName.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((a) => a.priority === priorityFilter);
    }

    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [search, statusFilter, priorityFilter]);

  const getPriorityBadgeColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadgeVariant = (status: AnnouncementStatus) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and manage system-wide announcements
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="mt-1 text-2xl font-bold">{announcementStatistics.totalAnnouncements}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Published</p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {announcementStatistics.publishedAnnouncements}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Drafts</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">
                {announcementStatistics.draftAnnouncements}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Urgent</p>
              <p className="mt-1 text-2xl font-bold text-red-700">
                {announcementStatistics.urgentAnnouncements}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pinned</p>
              <p className="mt-1 text-2xl font-bold text-purple-700">
                {announcementStatistics.pinnedAnnouncements}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-lg border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {announcement.isPinned && (
                        <Pin className="h-4 w-4 text-purple-600" />
                      )}
                      <h3 className="font-medium">{announcement.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>By {announcement.authorName}</span>
                      <span>•</span>
                      <span>{announcement.createdAt}</span>
                      {announcement.publishedAt && (
                        <>
                          <span>•</span>
                          <span>Published: {announcement.publishedAt}</span>
                        </>
                      )}
                      {announcement.status === 'published' && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{announcement.viewCount} views</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {announcement.audience.map((aud) => (
                        <Badge key={aud} variant="outline" className="text-xs">
                          {aud}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Badge
                        className={cn('text-xs border', getPriorityBadgeColor(announcement.priority))}
                      >
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(announcement.status)} className="text-xs">
                        {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredAnnouncements.length} of {announcements.length} announcements
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
