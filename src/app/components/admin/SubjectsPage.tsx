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
import { Loader2, Pencil, Plus, Search, Trash2, BookOpen } from "lucide-react";

import SubjectModal from "./modals/SubjectModal";
import { Subject, SubjectType } from "../../../lib/types/enrollment";
import { useAdminSubjects } from "../../../lib/hooks/admin/useAdminSubjects";

export default function SubjectsPage() {
  const { subjects, departments, statistics, loading, error, createSubject, updateSubject, deleteSubject } =
    useAdminSubjects();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredSubjects = useMemo(() => {
    let result = [...subjects];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (subject) =>
          subject.code.toLowerCase().includes(query) ||
          subject.title.toLowerCase().includes(query) ||
          subject.description.toLowerCase().includes(query),
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((subject) => subject.type === typeFilter);
    }

    if (departmentFilter !== "all") {
      result = result.filter((subject) => subject.department === departmentFilter);
    }

    return result;
  }, [departmentFilter, search, subjects, typeFilter]);

  const getTypeBadgeColor = (type: SubjectType) => {
    switch (type) {
      case "major":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "minor":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "GE":
        return "bg-green-100 text-green-800 border-green-300";
      case "elective":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "PE":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "NSTP":
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const openCreateModal = () => {
    setActiveSubject(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setActiveSubject(subject);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSubmit = async (payload: Partial<Subject>) => {
    if (modalMode === "create") {
      await createSubject(payload);
      return;
    }

    if (activeSubject) {
      await updateSubject(activeSubject.id, payload);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessingId(deleteTarget.id);
    await deleteSubject(deleteTarget.id);
    setProcessingId(null);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold tracking-tight">Subject Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage course catalog and subject offerings
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
          <CardContent className="p-4 text-sm text-destructive">
            Failed to load subjects: {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
              <p className="mt-1 text-2xl font-bold">{statistics.totalSubjects}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Major</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">
                {statistics.majorSubjects}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">General Ed</p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {statistics.generalEducationSubjects}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Minor</p>
              <p className="mt-1 text-2xl font-bold text-purple-700">
                {statistics.minorSubjects}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="GE">General Education</SelectItem>
                <SelectItem value="elective">Elective</SelectItem>
                <SelectItem value="PE">PE</SelectItem>
                <SelectItem value="NSTP">NSTP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full lg:w-[250px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Units
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto mb-2 h-10 w-10 animate-spin text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">Loading subjects...</p>
                    </td>
                  </tr>
                ) : filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <BookOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        No subjects match your current filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((subject) => (
                    <tr key={subject.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {subject.code}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{subject.title}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {subject.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn("border text-xs", getTypeBadgeColor(subject.type))}>
                          {subject.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {subject.units} ({subject.lecUnits}L + {subject.labUnits}Lab)
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {subject.department}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(subject)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(subject)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </p>
        </CardContent>
      </Card>

      <SubjectModal
        open={modalOpen}
        mode={modalMode}
        initialSubject={activeSubject}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subject</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {deleteTarget?.code} from the catalog and any linked academic
              records should be reviewed first.
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
