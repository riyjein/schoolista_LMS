import { useMemo, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../ui/utils";
import {
  Eye,
  Loader2,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import AnnouncementModal from "./modals/AnnouncementModal";
import { type Announcement, type AnnouncementPriority, type AnnouncementStatus } from "@/lib/data/admin/announcements";
import { useAdminAnnouncements } from "@/lib/hooks/admin/useAdminAnnouncements";
import { useAdminUsers } from "@/lib/hooks/admin/useAdminUsers";

export default function AnnouncementsPage() {
  const { users } = useAdminUsers();
  const { announcements, statistics, loading, error, createAnnouncement, updateAnnouncement, deleteAnnouncement } =
    useAdminAnnouncements();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(query) ||
          announcement.content.toLowerCase().includes(query) ||
          announcement.authorName.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((announcement) => announcement.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((announcement) => announcement.priority === priorityFilter);
    }

    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [announcements, priorityFilter, search, statusFilter]);

  const getPriorityBadgeColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusBadgeVariant = (status: AnnouncementStatus) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "outline";
    }
  };

  const openCreateModal = () => {
    setActiveAnnouncement(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setActiveAnnouncement(announcement);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSubmit = async (payload: Partial<Announcement>) => {
    if (modalMode === "create") {
      await createAnnouncement(payload);
      return;
    }

    if (activeAnnouncement) {
      await updateAnnouncement(activeAnnouncement.id, payload);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessingId(deleteTarget.id);
    await deleteAnnouncement(deleteTarget.id);
    setProcessingId(null);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold tracking-tight">Announcements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage system-wide announcements
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
          <CardContent className="p-4 text-sm text-destructive">
            Failed to load announcements: {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="mt-1 text-2xl font-bold">{statistics.totalAnnouncements}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Published</p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {statistics.publishedAnnouncements}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Drafts</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{statistics.draftAnnouncements}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Urgent</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{statistics.urgentAnnouncements}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pinned</p>
              <p className="mt-1 text-2xl font-bold text-purple-700">{statistics.pinnedAnnouncements}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-lg border p-8 text-center">
                <Loader2 className="mx-auto mb-2 h-10 w-10 animate-spin text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Loading announcements...</p>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="rounded-lg border p-8 text-center">
                <Megaphone className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No announcements match your current filters.
                </p>
              </div>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {announcement.isPinned && <Pin className="h-4 w-4 text-purple-600" />}
                        <h3 className="font-medium">{announcement.title}</h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
                        {announcement.status === "published" && (
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
                        {announcement.audience.map((audience) => (
                          <Badge key={audience} variant="outline" className="text-xs">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Badge className={cn("border text-xs", getPriorityBadgeColor(announcement.priority))}>
                          {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(announcement.status)} className="text-xs">
                          {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(announcement)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(announcement)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredAnnouncements.length} of {announcements.length} announcements
          </p>
        </CardContent>
      </Card>

      <AnnouncementModal
        open={modalOpen}
        mode={modalMode}
        initialAnnouncement={activeAnnouncement}
        authors={users}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteTarget?.title} from the announcements feed and its audience
              will no longer see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(processingId)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={Boolean(processingId)}>
              {processingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
