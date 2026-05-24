import { useState, useMemo } from 'react';
import { useFacultySchedule } from '@/lib/hooks/schedule/useFacultySchedule';
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
import { Calendar, Search, X, Clock, MapPin, BookOpen, Users, Hash } from 'lucide-react';
import { instructors } from '@/lib/data/attendance/instructors';

const CURRENT_INSTRUCTOR_ID = 'inst-2';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function FacultySchedulePage() {
  const { schedule, isLoading } = useFacultySchedule(CURRENT_INSTRUCTOR_ID);
  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  const instructor = instructors.find((i) => i.id === CURRENT_INSTRUCTOR_ID);

  // Get unique sections
  const sections = useMemo(() => {
    return [...new Set(schedule.map((s) => s.section))];
  }, [schedule]);

  // Filter schedule
  const filteredSchedule = useMemo(() => {
    let result = [...schedule];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.subjectCode.toLowerCase().includes(query) ||
          entry.subjectName.toLowerCase().includes(query) ||
          entry.section.toLowerCase().includes(query),
      );
    }

    // Day filter
    if (dayFilter !== 'all') {
      result = result.filter((entry) => entry.days.includes(dayFilter));
    }

    // Section filter
    if (sectionFilter !== 'all') {
      result = result.filter((entry) => entry.section === sectionFilter);
    }

    return result;
  }, [schedule, search, dayFilter, sectionFilter]);

  const hasFilters = search || dayFilter !== 'all' || sectionFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setDayFilter('all');
    setSectionFilter('all');
  };

  const totalEnrolled = schedule.reduce((sum, entry) => sum + entry.enrolledCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold tracking-tight">My Teaching Schedule</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your assigned classes and sections for 2024-2025 1st Semester.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="font-semibold">{schedule.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="font-semibold">{totalEnrolled}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Sections</p>
                <p className="font-semibold">{sections.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Schedule Days</p>
                <p className="font-semibold">
                  {[...new Set(schedule.flatMap((s) => s.days))].length}
                </p>
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
                placeholder="Search by subject or section..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Section filter */}
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Day filter */}
            <Select value={dayFilter} onValueChange={setDayFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {DAYS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
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

        {/* Schedule Table */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Room
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Schedule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Enrolled
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filteredSchedule.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Calendar className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        {hasFilters
                          ? 'No classes match your filters.'
                          : 'No assigned classes yet.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSchedule.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{entry.subjectName}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.subjectCode}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                          {entry.section}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{entry.room}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {entry.days.join(', ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.startTime} - {entry.endTime}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {entry.enrolledCount} / {entry.maxStudents}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
                            entry.status === 'active' &&
                              'bg-green-100 text-green-800',
                            entry.status === 'upcoming' &&
                              'bg-blue-100 text-blue-800',
                            entry.status === 'completed' &&
                              'bg-gray-100 text-gray-800',
                          )}
                        >
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && filteredSchedule.length > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Showing {filteredSchedule.length} of {schedule.length} class
            {schedule.length !== 1 ? 'es' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
