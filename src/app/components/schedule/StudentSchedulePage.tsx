import { useState, useMemo } from 'react';
import { useStudentSchedule } from '@/lib/hooks/schedule/useStudentSchedule';
import { useScheduleFilters } from '@/lib/hooks/schedule/useScheduleFilters';
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
import { Calendar, Search, X, Clock, MapPin, User, BookOpen, Hash } from 'lucide-react';

const CURRENT_STUDENT_ID = 'student-1';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudentSchedulePage() {
  const { schedule, isLoading } = useStudentSchedule(CURRENT_STUDENT_ID);
  const { filters, search, setSearch, day, setDay, resetFilters } = useScheduleFilters();

  // Filter schedule
  const filteredSchedule = useMemo(() => {
    let result = [...schedule];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.subjectCode.toLowerCase().includes(query) ||
          entry.subjectName.toLowerCase().includes(query) ||
          entry.instructor.toLowerCase().includes(query) ||
          entry.section.toLowerCase().includes(query),
      );
    }

    // Day filter
    if (filters.day !== 'all') {
      result = result.filter((entry) => entry.days.includes(filters.day));
    }

    return result;
  }, [schedule, filters]);

  const hasFilters = filters.search || filters.day !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold tracking-tight">Class Schedule</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your enrolled classes for 2024-2025 1st Semester.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
                <p className="font-semibold">{schedule.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="font-semibold">
                  {schedule.reduce((sum, entry) => sum + entry.units, 0)}
                </p>
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
                placeholder="Search by subject, instructor, or section..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Day filter */}
            <Select value={day} onValueChange={setDay}>
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
                    Subject Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subject Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Instructor
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
                    Units
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
                ) : filteredSchedule.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Calendar className="mx-auto mb-2 h-12 w-12 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        {hasFilters
                          ? 'No schedules match your filters.'
                          : 'No enrolled subjects yet.'}
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
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          <BookOpen className="h-3 w-3" />
                          {entry.subjectCode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{entry.subjectName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{entry.instructor}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
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
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                          {entry.units}
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
            Showing {filteredSchedule.length} of {schedule.length} subject
            {schedule.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
