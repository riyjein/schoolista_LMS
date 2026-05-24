import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { Button } from "../../ui/button";
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

interface Section {
  id: string;
  code: string;
  courseId: string;
  yearLevel: number;
  schoolYear: string;
  semester: string;
  maxStudents: number;
}

interface SectionModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialSection?: Section | null;
  courseOptions: Array<{ id: string; name: string }>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: Partial<Section>) => Promise<void> | void;
}

interface SectionFormState {
  code: string;
  courseId: string;
  yearLevel: string;
  schoolYear: string;
  semester: string;
  maxStudents: string;
}

const emptyState: SectionFormState = {
  code: "",
  courseId: "all",
  yearLevel: "1",
  schoolYear: "",
  semester: "1st",
  maxStudents: "",
};

function toFormState(section?: Section | null): SectionFormState {
  if (!section) return emptyState;
  return {
    code: section.code ?? "",
    courseId: section.courseId ?? "all",
    yearLevel: section.yearLevel ? String(section.yearLevel) : "1",
    schoolYear: section.schoolYear ?? "",
    semester: section.semester ?? "1st",
    maxStudents: section.maxStudents ? String(section.maxStudents) : "",
  };
}

export default function SectionModal({
  open,
  mode,
  initialSection,
  courseOptions,
  onOpenChange,
  onSubmit,
}: SectionModalProps) {
  const [form, setForm] = useState<SectionFormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(toFormState(initialSection));
  }, [initialSection, open]);

  const handleChange =
    (key: keyof SectionFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const yearLevel = Number(form.yearLevel);
      const maxStudents = Number(form.maxStudents);

      await onSubmit({
        code: form.code.trim(),
        courseId: form.courseId,
        yearLevel: Number.isFinite(yearLevel) ? yearLevel : 1,
        schoolYear: form.schoolYear.trim(),
        semester: form.semester,
        maxStudents: Number.isFinite(maxStudents) ? maxStudents : 30,
      });

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Section" : "Edit Section"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new class section with enrollment details."
              : "Update section information and capacity."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="section-code">Code</Label>
              <Input
                id="section-code"
                value={form.code}
                onChange={handleChange("code")}
                placeholder="e.g., A, B, C"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section-program">Program</Label>
              <Select
                value={form.courseId}
                onValueChange={(value) =>
                  setForm((c) => ({ ...c, courseId: value }))
                }
              >
                <SelectTrigger id="section-program">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {courseOptions.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="section-year">Year Level</Label>
              <Select
                value={form.yearLevel}
                onValueChange={(value) =>
                  setForm((c) => ({ ...c, yearLevel: value }))
                }
              >
                <SelectTrigger id="section-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section-semester">Semester</Label>
              <Select
                value={form.semester}
                onValueChange={(value) =>
                  setForm((c) => ({ ...c, semester: value }))
                }
              >
                <SelectTrigger id="section-semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Semester</SelectItem>
                  <SelectItem value="2nd">2nd Semester</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section-schoolyear">School Year</Label>
              <Input
                id="section-schoolyear"
                value={form.schoolYear}
                onChange={handleChange("schoolYear")}
                placeholder="e.g., 2024-2025"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="section-maxstudents">Max Students</Label>
            <Input
              id="section-maxstudents"
              type="number"
              min="1"
              value={form.maxStudents}
              onChange={handleChange("maxStudents")}
              required
            />
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
                  ? "Create Section"
                  : "Update Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
