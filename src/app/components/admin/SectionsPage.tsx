import { useState, useMemo } from "react";
import { courses } from "@/lib/data/enrollment/courses";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, Grid3x3, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
import SectionModal from "./modals/SectionModal";
import { useAdminSections, Section } from "@/lib/hooks/admin/useAdminSections";

export default function SectionsPage() {
  const {
    sections,
    loading,
    error,
    createSection,
    updateSection,
    deleteSection,
  } = useAdminSections();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    let result = [...sections];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter((s) => s.code.toLowerCase().includes(query));
    }

    if (courseFilter !== "all") {
      result = result.filter(
        (s) => s.courseId === courseFilter || s.courseId === "all",
      );
    }

    return result;
  }, [search, courseFilter, sections]);

  const getCourseNameById = (courseId: string) => {
    if (courseId === "all") return "All Programs";
    const course = courses.find((c) => c.id === courseId);
    return course ? course.name : courseId;
  };

  const openCreateModal = () => {
    setActiveSection(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (section: Section) => {
    setActiveSection(section);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSubmit = async (payload: Partial<Section>) => {
    if (modalMode === "create") {
      await createSection(payload);
      return;
    }

    if (activeSection?.id) {
      await updateSection(activeSection.id, payload);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    setProcessingId(deleteTarget.id);
    try {
      await deleteSection(deleteTarget.id);
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
          <h1 className="font-bold tracking-tight">Section Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage class sections and assignments
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sections
                </p>
                <p className="mt-1 text-2xl font-bold">{sections.length}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Grid3x3 className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Capacity
              </p>
              <p className="mt-1 text-2xl font-bold">
                {sections.reduce((sum, s) => sum + s.maxStudents, 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Section Size
              </p>
              <p className="mt-1 text-2xl font-bold">
                {sections.length > 0
                  ? Math.round(
                      sections.reduce((sum, s) => sum + s.maxStudents, 0) /
                        sections.length,
                    )
                  : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full lg:w-[250px]">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Section Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Year Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    School Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Semester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Max Students
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSections.map((section) => (
                  <tr
                    key={section.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-mono">
                        {section.code}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getCourseNameById(section.courseId)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      Year {section.yearLevel}
                    </td>
                    <td className="px-4 py-3 text-sm">{section.schoolYear}</td>
                    <td className="px-4 py-3 text-sm">{section.semester}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {section.maxStudents} students
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={processingId === section.id}
                          onClick={() => openEditModal(section)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={processingId === section.id}
                          onClick={() => setDeleteTarget(section)}
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
            Showing {filteredSections.length} of {sections.length} sections
          </p>
        </CardContent>
      </Card>

      <SectionModal
        open={modalOpen}
        mode={modalMode}
        initialSection={activeSection}
        courseOptions={courses}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete section "{deleteTarget?.code}"?
              This action cannot be undone.
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
