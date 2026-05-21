import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { Switch } from "../../ui/switch";
import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementPriority,
  AnnouncementStatus,
} from "../../../../lib/types/announcements";
import { User } from "../../../../lib/types/user";

const AUDIENCE_OPTIONS: AnnouncementAudience[] = [
  "all",
  "students",
  "faculty",
  "program-chairs",
  "stakeholders",
];

interface AnnouncementModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialAnnouncement?: Announcement | null;
  authors: User[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: Partial<Announcement>) => Promise<void> | void;
}

interface AnnouncementFormState {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  authorId: string;
  authorName: string;
  publishedAt: string;
  expiresAt: string;
  isPinned: boolean;
  audience: Record<AnnouncementAudience, boolean>;
}

function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function resolveDefaultAuthor(authors: User[]): User | undefined {
  return (
    authors.find((user) => user.role === "admin") ??
    authors.find((user) => user.role === "program-chair") ??
    authors[0]
  );
}

function toFormState(
  announcement: Announcement | null | undefined,
  authors: User[],
): AnnouncementFormState {
  const defaultAuthor = resolveDefaultAuthor(authors);
  const audience = AUDIENCE_OPTIONS.reduce(
    (acc, item) => ({
      ...acc,
      [item]: announcement?.audience?.includes(item) ?? item === "all",
    }),
    {} as Record<AnnouncementAudience, boolean>,
  );

  return {
    title: announcement?.title ?? "",
    content: announcement?.content ?? "",
    priority: announcement?.priority ?? "medium",
    status: announcement?.status ?? "draft",
    authorId: announcement?.authorId ?? defaultAuthor?.id ?? "",
    authorName: announcement?.authorName ?? defaultAuthor?.name ?? "",
    publishedAt: toDateInputValue(announcement?.publishedAt),
    expiresAt: toDateInputValue(announcement?.expiresAt),
    isPinned: announcement?.isPinned ?? false,
    audience,
  };
}

export default function AnnouncementModal({
  open,
  mode,
  initialAnnouncement,
  authors,
  onOpenChange,
  onSubmit,
}: AnnouncementModalProps) {
  const [form, setForm] = useState<AnnouncementFormState>(() =>
    toFormState(null, authors),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(toFormState(initialAnnouncement, authors));
  }, [authors, initialAnnouncement, open]);

  const selectedAudience = useMemo(
    () => AUDIENCE_OPTIONS.filter((item) => form.audience[item]),
    [form.audience],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const currentAuthor =
        authors.find((author) => author.id === form.authorId) ??
        resolveDefaultAuthor(authors);

      const audience: AnnouncementAudience[] =
        selectedAudience.length > 0 ? selectedAudience : ["all"];
      const createdAt =
        initialAnnouncement?.createdAt ?? new Date().toISOString().slice(0, 10);
      const publishedAt =
        form.status === "published"
          ? form.publishedAt || new Date().toISOString().slice(0, 10)
          : null;

      await onSubmit({
        title: form.title.trim(),
        content: form.content.trim(),
        priority: form.priority,
        status: form.status,
        audience,
        authorId: currentAuthor?.id ?? form.authorId,
        authorName: currentAuthor?.name ?? form.authorName,
        createdAt: createdAt,
        publishedAt,
        expiresAt: form.expiresAt || null,
        isPinned: form.isPinned,
        viewCount: initialAnnouncement?.viewCount ?? 0,
      });

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New Announcement" : "Edit Announcement"}
          </DialogTitle>
          <DialogDescription>
            Create or update a campus announcement, then publish it to the
            selected audience.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="announcement-content">Content</Label>
              <Textarea
                id="announcement-content"
                rows={6}
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    priority: value as AnnouncementPriority,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    status: value as AnnouncementStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="announcement-published">Publish Date</Label>
              <Input
                id="announcement-published"
                type="date"
                value={form.publishedAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    publishedAt: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="announcement-expires">Expiry Date</Label>
              <Input
                id="announcement-expires"
                type="date"
                value={form.expiresAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expiresAt: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Author</Label>
              <Select
                value={form.authorId}
                onValueChange={(value) => {
                  const selectedAuthor = authors.find(
                    (author) => author.id === value,
                  );
                  setForm((current) => ({
                    ...current,
                    authorId: value,
                    authorName: selectedAuthor?.name ?? current.authorName,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name} ({author.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <Label
                  htmlFor="announcement-pinned"
                  className="text-sm font-medium"
                >
                  Pinned
                </Label>
                <p className="text-xs text-muted-foreground">
                  Pin this announcement to the top of lists.
                </p>
              </div>
              <Switch
                id="announcement-pinned"
                checked={form.isPinned}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    isPinned: Boolean(checked),
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Audience</Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {AUDIENCE_OPTIONS.map((audience) => (
                <label
                  key={audience}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={form.audience[audience]}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        audience: {
                          ...current.audience,
                          [audience]: Boolean(checked),
                        },
                      }))
                    }
                  />
                  <span className="capitalize">
                    {audience.replace("-", " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create Announcement"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
