import { useAttendanceHistory, type SortField } from '@/lib/hooks/attendance/useAttendanceHistory';
import type { EnrichedAttendanceRecord, AttendanceStatus } from '@/lib/types/attendance';
import { AttendanceStatusBadge } from '../components/AttendanceStatusBadge';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

const STATUS_OPTIONS: { value: AttendanceStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
];

interface SortHeaderProps {
  label: string;
  field: SortField;
  current: SortField;
  dir: 'asc' | 'desc';
  onSort: (f: SortField) => void;
}

function SortHeader({ label, field, current, dir, onSort }: SortHeaderProps) {
  const active = current === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-medium hover:text-foreground transition-colors"
    >
      {label}
      <span className={cn('flex flex-col', active ? 'text-blue-600' : 'text-muted-foreground/40')}>
        <ChevronUp className="h-3 w-3 -mb-1" style={{ opacity: active && dir === 'asc' ? 1 : 0.4 }} />
        <ChevronDown className="h-3 w-3" style={{ opacity: active && dir === 'desc' ? 1 : 0.4 }} />
      </span>
    </button>
  );
}

interface Props {
  studentId: string;
}

export function AttendanceHistoryTab({ studentId }: Props) {
  const history = useAttendanceHistory(studentId);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    !!history.filters.classId ||
    !!history.filters.status ||
    !!history.filters.dateFrom ||
    !!history.filters.dateTo;

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Total Sessions', value: history.summary.total, color: 'text-foreground' },
          { label: 'Present', value: history.summary.present, color: 'text-green-600' },
          { label: 'Late', value: history.summary.late, color: 'text-yellow-600' },
          { label: 'Absent', value: history.summary.absent, color: 'text-red-600' },
          { label: 'Excused', value: history.summary.excused, color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-muted-foreground text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance rate */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Overall Attendance Rate</span>
          <span className={cn(
            'font-bold',
            history.summary.attendanceRate >= 80 ? 'text-green-600'
              : history.summary.attendanceRate >= 60 ? 'text-yellow-600'
                : 'text-red-600',
          )}>
            {history.summary.attendanceRate}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              history.summary.attendanceRate >= 80 ? 'bg-green-500'
                : history.summary.attendanceRate >= 60 ? 'bg-yellow-500'
                  : 'bg-red-500',
            )}
            style={{ width: `${history.summary.attendanceRate}%` }}
          />
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by subject, instructor, date…"
              className="pl-9"
              value={history.filters.search}
              onChange={(e) => history.setFilter('search', e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
            )}
          </Button>
          {(hasActiveFilters || history.filters.search) && (
            <Button variant="ghost" size="sm" onClick={() => { history.clearFilters(); }}>
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Subject</Label>
                <select
                  value={history.filters.classId}
                  onChange={(e) => history.setFilter('classId', e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Subjects</option>
                  {history.availableClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.subjectCode} — {c.subjectTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <select
                  value={history.filters.status}
                  onChange={(e) => history.setFilter('status', e.target.value as AttendanceStatus | '')}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">From Date</Label>
                <Input
                  type="date"
                  value={history.filters.dateFrom}
                  onChange={(e) => history.setFilter('dateFrom', e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">To Date</Label>
                <Input
                  type="date"
                  value={history.filters.dateTo}
                  onChange={(e) => history.setFilter('dateTo', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-muted-foreground text-sm">
        Showing {history.paginated.length} of {history.allFiltered.length} records
      </p>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {history.paginated.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <p className="font-medium">No records found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-muted-foreground">
                    <SortHeader label="Date" field="date" current={history.sortField} dir={history.sortDir} onSort={history.setSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-muted-foreground">
                    <SortHeader label="Subject" field="subject" current={history.sortField} dir={history.sortDir} onSort={history.setSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-muted-foreground hidden md:table-cell">Instructor</th>
                  <th className="px-4 py-3 text-left text-muted-foreground hidden lg:table-cell">Section</th>
                  <th className="px-4 py-3 text-left text-muted-foreground hidden sm:table-cell">
                    <SortHeader label="Time In" field="timeIn" current={history.sortField} dir={history.sortDir} onSort={history.setSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-muted-foreground">
                    <SortHeader label="Status" field="status" current={history.sortField} dir={history.sortDir} onSort={history.setSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-muted-foreground hidden xl:table-cell">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.paginated.map((r) => (
                  <HistoryRow key={r.id} record={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {history.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Page {history.page} of {history.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={history.page <= 1}
              onClick={() => history.setPage(history.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, history.totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(history.page - 2, history.totalPages - 4));
              const p = start + i;
              return (
                <Button
                  key={p}
                  variant={p === history.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => history.setPage(p)}
                  className="w-8 p-0"
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={history.page >= history.totalPages}
              onClick={() => history.setPage(history.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryRow({ record }: { record: EnrichedAttendanceRecord }) {
  const date = new Date(record.date + 'T00:00:00');
  const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm whitespace-nowrap">{dateLabel}</td>
      <td className="px-4 py-3">
        <p className="font-medium">{record.subjectCode}</p>
        <p className="text-muted-foreground text-xs">{record.subjectTitle}</p>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm hidden md:table-cell">{record.instructorName}</td>
      <td className="px-4 py-3 text-muted-foreground text-sm hidden lg:table-cell">{record.sectionCode}</td>
      <td className="px-4 py-3 text-sm hidden sm:table-cell font-mono">
        {record.timeIn === '--:--' ? <span className="text-muted-foreground">—</span> : record.timeIn}
      </td>
      <td className="px-4 py-3">
        <AttendanceStatusBadge status={record.status} size="sm" />
      </td>
      <td className="px-4 py-3 text-muted-foreground text-sm hidden xl:table-cell">
        {record.remarks ?? '—'}
      </td>
    </tr>
  );
}
