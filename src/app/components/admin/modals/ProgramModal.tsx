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
import { Textarea } from "../../ui/textarea";
import type { Course } from "@/lib/types/enrollment";

interface ProgramModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialProgram?: Course | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: Partial<Course>) => Promise<void> | void;
}

interface ProgramFormState {
  code: string;
  name: string;
  department: string;
  totalUnits: string;
  years: string;
}

const emptyState: ProgramFormState = {
  code: "",
  name: "",
  department: "",
  totalUnits: "",
  years: "",
};

function toFormState(program?: Course | null): ProgramFormState {
  if (!program) return emptyState;
  return {
    code: program.code ?? "",
    name: program.name ?? "",
    department: program.department ?? "",
    totalUnits: program.totalUnits ? String(program.totalUnits) : "",
    years: program.years ? String(program.years) : "",
  };
}

export default function ProgramModal({
  open,
  mode,
  initialProgram,
  onOpenChange,
  onSubmit,
}: ProgramModalProps) {
  const [form, setForm] = useState<ProgramFormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(toFormState(initialProgram));
  }, [initialProgram, open]);

  const handleChange =
    (key: keyof ProgramFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const totalUnits = Number(form.totalUnits);
      const years = Number(form.years);

      await onSubmit({
        code: form.code.trim(),
        name: form.name.trim(),
        department: form.department.trim(),
        totalUnits: Number.isFinite(totalUnits) ? totalUnits : 0,
        years: Number.isFinite(years) ? years : 4,
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
            {mode === "create" ? "Add Program" : "Edit Program"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create an academic program with department and duration information."
              : "Update program details and requirements."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="program-code">Code</Label>
              <Input
                id="program-code"
                value={form.code}
                onChange={handleChange("code")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="program-name">Name</Label>
              <Input
                id="program-name"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="program-department">Department</Label>
              <Input
                id="program-department"
                value={form.department}
                onChange={handleChange("department")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="program-years">Duration (Years)</Label>
              <Input
                id="program-years"
                type="number"
                min="1"
                max="10"
                value={form.years}
                onChange={handleChange("years")}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="program-units">Total Units</Label>
            <Input
              id="program-units"
              type="number"
              min="0"
              value={form.totalUnits}
              onChange={handleChange("totalUnits")}
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
                  ? "Create Program"
                  : "Update Program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
