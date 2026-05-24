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
import type { User, UserRole, UserStatus } from "@/lib/data/admin/users";

interface UserModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialUser?: User | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: Partial<User>) => Promise<void> | void;
}

interface UserFormState {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  studentNumber: string;
  employeeId: string;
  program: string;
  yearLevel: string;
}

const emptyState: UserFormState = {
  name: "",
  email: "",
  role: "student",
  status: "active",
  department: "",
  studentNumber: "",
  employeeId: "",
  program: "",
  yearLevel: "",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toFormState(user?: User | null): UserFormState {
  if (!user) return emptyState;
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role,
    status: user.status,
    department: user.department ?? "",
    studentNumber: user.studentNumber ?? "",
    employeeId: user.employeeId ?? "",
    program: user.program ?? user.courseId ?? "",
    yearLevel: user.yearLevel ? String(user.yearLevel) : "",
  };
}

export default function UserModal({
  open,
  mode,
  initialUser,
  onOpenChange,
  onSubmit,
}: UserModalProps) {
  const [form, setForm] = useState<UserFormState>(emptyState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(toFormState(initialUser));
  }, [initialUser, open]);

  const handleChange =
    (key: keyof UserFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<User> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
        avatarInitials: getInitials(form.name),
        department: form.department.trim() || undefined,
        studentNumber: form.studentNumber.trim() || undefined,
        employeeId: form.employeeId.trim() || undefined,
        program: form.program.trim() || undefined,
        yearLevel: form.yearLevel ? Number(form.yearLevel) : undefined,
        createdAt:
          initialUser?.createdAt ?? new Date().toISOString().slice(0, 10),
        lastLogin: initialUser?.lastLogin ?? null,
      };

      await onSubmit(payload);
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
            {mode === "create" ? "Add User" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new system account and assign its role."
              : "Update the selected user's profile and access details."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    role: value as UserRole,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="program-chair">Program Chair</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
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
                    status: value as UserStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="user-department">Department</Label>
              <Input
                id="user-department"
                value={form.department}
                onChange={handleChange("department")}
                placeholder="College or office"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-program">Program</Label>
              <Input
                id="user-program"
                value={form.program}
                onChange={handleChange("program")}
                placeholder="Program identifier"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="user-student-number">Student Number</Label>
              <Input
                id="user-student-number"
                value={form.studentNumber}
                onChange={handleChange("studentNumber")}
                placeholder="Optional for staff"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-employee-id">Employee ID</Label>
              <Input
                id="user-employee-id"
                value={form.employeeId}
                onChange={handleChange("employeeId")}
                placeholder="Optional for students"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-year-level">Year Level</Label>
              <Input
                id="user-year-level"
                type="number"
                min="1"
                max="4"
                value={form.yearLevel}
                onChange={handleChange("yearLevel")}
                placeholder="1-4"
              />
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
                  ? "Create User"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
