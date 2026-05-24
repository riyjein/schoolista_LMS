import { useState, useMemo } from 'react';
import { useFacultyStudents } from '@/lib/hooks/schedule/useFacultyStudents';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Users, Search, X, BookOpen, GraduationCap, Hash, CheckCircle2 } from 'lucide-react';

const CURRENT_INSTRUCTOR_ID = 'inst-2';

const ITEMS_PER_PAGE = 10;

export default function FacultyStudentsPage() {
  const {
    students,
    taughtSubjects,
    taughtSections,
    selectedSubject,
    selectedSection,
    setSelectedSubject,
    setSelectedSection,
    isLoading,
  } = useFacultyStudents(CURRENT_INSTRUCTOR_ID);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!search) return students;

    const query = search.toLowerCase();
    return students.filter(
      (student) =>
        student.studentNumber.toLowerCase().includes(query) ||
        student.fullName.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query) ||
        student.section.toLowerCase().includes(query),
    );
  }, [students, search]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (filterFn: () => void) => {
    filterFn();
    setCurrentPage(1);
  };

  const hasFilters = search || selectedSubject !== 'all' || selectedSection !== 'all';

  const resetFilters = () => {
    setSearch('');
    setSelectedSubject('all');
    setSelectedSection('all');
    setCurrentPage(1);
  };

  // Get subject name by ID
  const getSubjectName = (subjectId: string) => {
    const subject = taughtSubjects.find((s) => s.id === subjectId);
    return subject ? `${subject.code} - ${subject.title}` : 'N/A';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold tracking-tight">Student Roster</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View enrolled students in your classes for 2024-2025 1st Semester.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="font-semibold">{students.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Subjects Taught</p>
                <p className="font-semibold">{taughtSubjects.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Sections</p>
                <p className="font-semibold">{taughtSections.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student number, name, or course..."
                value={search}
                onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
                className="pl-9"
              />
            </div>

            {/* Subject filter */}
            <Select
              value={selectedSubject}
              onValueChange={(value) => handleFilterChange(() => setSelectedSubject(value))}
            >
              <SelectTrigger className="w-full lg:w-[250px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {taughtSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Section filter */}
            <Select
              value={selectedSection}
              onValueChange={(value) => handleFilterChange(() => setSelectedSection(value))}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {taughtSections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear filters */}
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Student Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Year Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Users className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        {hasFilters
                          ? 'No students match your filters.'
                          : 'No enrolled students yet.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          <Hash className="h-3 w-3" />
                          {student.studentNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{student.fullName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {student.course}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                          Year {student.yearLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{student.section}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {getSubjectName(student.subjectId)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                            student.enrollmentStatus === 'approved' &&
                              'bg-green-100 text-green-800',
                            student.enrollmentStatus === 'submitted' &&
                              'bg-blue-100 text-blue-800',
                            student.enrollmentStatus === 'draft' &&
                              'bg-gray-100 text-gray-800',
                          )}
                        >
                          {student.enrollmentStatus === 'approved' && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {student.enrollmentStatus.charAt(0).toUpperCase() +
                            student.enrollmentStatus.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!isLoading && filteredStudents.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} of{' '}
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
