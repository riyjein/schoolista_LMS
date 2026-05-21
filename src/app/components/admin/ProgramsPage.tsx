import { useState, useMemo } from "react";
import { studentProfiles } from "@/lib/data/enrollment/students";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Search,
  GraduationCap,
  Plus,
  Users,
  BookOpen,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
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
import ProgramModal from "./modals/ProgramModal";
import { useAdminPrograms } from "@/lib/hooks/admin/useAdminPrograms";
import { Course } from "@/lib/types/enrollment";

export default function ProgramsPage() {
  const {
    programs,
    loading,
    error,
    createProgram,
    updateProgram,
    deleteProgram,
  } = useAdminPrograms();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeProgram, setActiveProgram] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const programsWithStats = useMemo(() => {
    return programs.map((course) => {
      const enrolledStudents = studentProfiles.filter(
        (s) => s.courseId === course.id,
      );

      return {
        ...course,
        enrolledStudents: enrolledStudents.length,
      };
    });
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    if (!search) return programsWithStats;

    const query = search.toLowerCase();
    return programsWithStats.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query),
    );
  }, [search, programsWithStats]);

  const openCreateModal = () => {
    setActiveProgram(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (program: Course) => {
    setActiveProgram(program);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSubmit = async (payload: Partial<Course>) => {
    if (modalMode === "create") {
      await createProgram(payload);
      return;
    }

    if (activeProgram?.id) {
      await updateProgram(activeProgram.id, payload);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    setProcessingId(deleteTarget.id);
    try {
      await deleteProgram(deleteTarget.id);
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold tracking-tight">Program Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage academic programs and curricula
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Programs
                </p>
                <p className="mt-1 text-2xl font-bold">{programs.length}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <GraduationCap className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {studentProfiles.length}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Departments
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {new Set(programs.map((c) => c.department)).size}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <BookOpen className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Programs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Program Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Program Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Units
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Enrolled
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPrograms.map((program) => (
                  <tr
                    key={program.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-mono">
                        {program.code}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{program.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {program.department}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {program.totalUnits} units
                    </td>
                    <td className="px-4 py-3 text-sm">{program.years} years</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {program.enrolledStudents} students
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={processingId === program.id}
                          onClick={() => openEditModal(program)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={processingId === program.id}
                          onClick={() => setDeleteTarget(program)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredPrograms.length} of {programs.length} programs
          </p>
        </CardContent>
      </Card>

      <ProgramModal
        open={modalOpen}
        mode={modalMode}
        initialProgram={activeProgram}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the program "{deleteTarget?.name}
              "? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingId === deleteTarget?.id}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={processingId === deleteTarget?.id}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processingId === deleteTarget?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
