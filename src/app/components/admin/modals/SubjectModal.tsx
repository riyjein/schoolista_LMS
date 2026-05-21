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
import { Textarea } from "../../ui/textarea";
import type { Subject, SubjectType } from "@/lib/types/enrollment";

interface SubjectModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialSubject?: Subject | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: Partial<Subject>) => Promise<void> | void;
}

interface SubjectFormState {
  code: string;
  title: string;
  type: SubjectType;
  units: string;
  lecUnits: string;
  labUnits: string;
  department: string;
  description: string;
}

const emptyState: SubjectFormState = {
  code: "",
  title: "",
  type: "major",
  units: "",
  lecUnits: "",
  labUnits: "",
  department: "",
  description: "",
};

function toFormState(subject?: Subject | null): SubjectFormState {
  if (!subject) return emptyState;
  return {
    code: subject.code ?? "",
    title: subject.title ?? "",
    type: subject.type,
    units: subject.units ? String(subject.units) : "",
    lecUnits: subject.lecUnits ? String(subject.lecUnits) : "",
    labUnits: subject.labUnits ? String(subject.labUnits) : "",
    department: subject.department ?? "",
    description: subject.description ?? "",
  };
}

export default function SubjectModal({
  open,
  mode,
  initialSubject,
  onOpenChange,
  onSubmit,
}: SubjectModalProps) {
  const [form, setForm] = useState<SubjectFormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(toFormState(initialSubject));
  }, [initialSubject, open]);

  const handleChange =
    (key: keyof SubjectFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const units = Number(form.units);
      const lecUnits = Number(form.lecUnits);
      const labUnits = Number(form.labUnits);

      await onSubmit({
        code: form.code.trim(),
        title: form.title.trim(),
        type: form.type,
        units: Number.isFinite(units) ? units : 0,
        lecUnits: Number.isFinite(lecUnits) ? lecUnits : 0,
        labUnits: Number.isFinite(labUnits) ? labUnits : 0,
        department: form.department.trim(),
        description: form.description.trim(),
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
          <DialogTitle>{mode === "create" ? "Add Subject" : "Edit Subject"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a catalog subject with the correct unit breakdown."
              : "Update subject details, type, and academic department."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="subject-code">Code</Label>
              <Input id="subject-code" value={form.code} onChange={handleChange("code")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject-title">Title</Label>
              <Input
                id="subject-title"
                value={form.title}
                onChange={handleChange("title")}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, type: value as SubjectType }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="GE">General Education</SelectItem>
                  <SelectItem value="elective">Elective</SelectItem>
                  <SelectItem value="PE">PE</SelectItem>
                  <SelectItem value="NSTP">NSTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject-department">Department</Label>
              <Input
                id="subject-department"
                value={form.department}
                onChange={handleChange("department")}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="subject-units">Units</Label>
              <Input
                id="subject-units"
                type="number"
                min="0"
                value={form.units}
                onChange={handleChange("units")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject-lec">Lecture Units</Label>
              <Input
                id="subject-lec"
                type="number"
                min="0"
                value={form.lecUnits}
                onChange={handleChange("lecUnits")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject-lab">Laboratory Units</Label>
              <Input
                id="subject-lab"
                type="number"
                min="0"
                value={form.labUnits}
                onChange={handleChange("labUnits")}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject-description">Description</Label>
            <Textarea
              id="subject-description"
              value={form.description}
              onChange={handleChange("description")}
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : mode === "create" ? "Create Subject" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
