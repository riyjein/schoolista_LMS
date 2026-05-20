import { useAttendanceCalendar, type CalendarDay } from '@/lib/hooks/attendance/useAttendanceCalendar';
import type { DayAttendance, EnrichedAttendanceRecord } from '@/lib/types/attendance';
import { AttendanceStatusBadge } from '../components/AttendanceStatusBadge';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { classOfferings } from '@/lib/data/attendance/class-offerings';
import { subjects } from '@/lib/data/enrollment/subjects';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function DayCell({ day, isSelected, onClick }: { day: CalendarDay; isSelected: boolean; onClick: () => void }) {
  const hasAny = day.dayAttendance !== null;
  const { dayAttendance: da } = day;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex min-h-[72px] flex-col gap-1 rounded-lg border p-2 text-left text-sm transition-all hover:shadow-sm',
        !day.isCurrentMonth && 'opacity-40',
        isSelected && 'ring-2 ring-blue-500 ring-offset-1',
        da?.hasAbsence ? 'border-red-200 bg-red-50'
          : da?.hasLate ? 'border-yellow-200 bg-yellow-50'
            : da?.hasPresent || da?.hasExcused ? 'border-green-200 bg-green-50'
              : 'border-border bg-background',
      )}
    >
      <span className={cn(
        'font-medium',
        isSelected && 'text-blue-600',
      )}>
        {day.dayNumber}
      </span>
      {da && (
        <div className="flex flex-wrap gap-0.5">
          {da.hasPresent && <span className="h-2 w-2 rounded-full bg-green-500" title="Present" />}
          {da.hasLate && <span className="h-2 w-2 rounded-full bg-yellow-500" title="Late" />}
          {da.hasAbsence && <span className="h-2 w-2 rounded-full bg-red-500" title="Absent" />}
          {da.hasExcused && <span className="h-2 w-2 rounded-full bg-blue-500" title="Excused" />}
        </div>
      )}
    </button>
  );
}

function DayDetailPanel({ da, onClose }: { da: DayAttendance; onClose: () => void }) {
  const date = new Date(da.date + 'T00:00:00');
  const label = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{label}</h3>
          <p className="text-muted-foreground text-sm">{da.records.length} session{da.records.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {da.records.map((r) => (
          <RecordRow key={r.id} record={r} />
        ))}
      </div>
    </div>
  );
}

function RecordRow({ record }: { record: EnrichedAttendanceRecord }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{record.subjectCode} — {record.subjectTitle}</p>
        <p className="text-muted-foreground text-sm">{record.instructorName}</p>
        <p className="text-muted-foreground text-xs">
          {record.sessionStartTime} – {record.sessionEndTime}
          {record.timeIn !== '--:--' && ` · Tap: ${record.timeIn}`}
        </p>
      </div>
      <AttendanceStatusBadge status={record.status} size="sm" />
    </div>
  );
}

interface Props {
  studentId: string;
}

export function AttendanceCalendarTab({ studentId }: Props) {
  const cal = useAttendanceCalendar(studentId);

  const enrolledClasses = classOfferings.filter((o) => o.enrolledStudentIds.includes(studentId));

  function prevMonth() {
    const m = cal.currentMonth === 0 ? 11 : cal.currentMonth - 1;
    const y = cal.currentMonth === 0 ? cal.currentYear - 1 : cal.currentYear;
    cal.setCurrentMonth(y, m);
  }

  function nextMonth() {
    const m = cal.currentMonth === 11 ? 0 : cal.currentMonth + 1;
    const y = cal.currentMonth === 11 ? cal.currentYear + 1 : cal.currentYear;
    cal.setCurrentMonth(y, m);
  }

  function prevWeek() {
    const d = new Date(cal.currentWeekStart);
    d.setDate(d.getDate() - 7);
    cal.setCurrentWeekStart(d);
  }

  function nextWeek() {
    const d = new Date(cal.currentWeekStart);
    d.setDate(d.getDate() + 7);
    cal.setCurrentWeekStart(d);
  }

  const grid = cal.view === 'month' ? cal.calendarGrid : cal.weekGrid;

  return (
    <div className="space-y-5">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="flex rounded-lg border">
          {(['month', 'week'] as const).map((v) => (
            <button
              key={v}
              onClick={() => cal.setView(v)}
              className={cn(
                'px-4 py-2 text-sm font-medium capitalize transition-colors first:rounded-l-lg last:rounded-r-lg',
                cal.view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Month/Week nav */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0"
            onClick={cal.view === 'month' ? prevMonth : prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium">
            {cal.view === 'month'
              ? `${MONTHS[cal.currentMonth]} ${cal.currentYear}`
              : (() => {
                  const end = new Date(cal.currentWeekStart);
                  end.setDate(end.getDate() + 6);
                  return `${cal.currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                })()
            }
          </span>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0"
            onClick={cal.view === 'month' ? nextMonth : nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Subject filter */}
        <select
          value={cal.classFilter}
          onChange={(e) => cal.setClassFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Subjects</option>
          {enrolledClasses.map((o) => {
            const sub = subjects.find((s) => s.id === o.subjectId);
            return (
              <option key={o.id} value={o.id}>
                {sub?.code} — {sub?.title}
              </option>
            );
          })}
        </select>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Present', value: cal.summary.present, color: 'text-green-600 bg-green-50 border-green-200' },
          { label: 'Late', value: cal.summary.late, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
          { label: 'Absent', value: cal.summary.absent, color: 'text-red-600 bg-red-50 border-red-200' },
          { label: 'Excused', value: cal.summary.excused, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-lg border p-3 text-center', s.color)}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="text-muted-foreground py-1 text-center text-xs font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((day) => (
            <DayCell
              key={day.date}
              day={day}
              isSelected={cal.selectedDate === day.date}
              onClick={() => cal.setSelectedDate(cal.selectedDate === day.date ? null : day.date)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
          {[
            { color: 'bg-green-500', label: 'Present' },
            { color: 'bg-yellow-500', label: 'Late' },
            { color: 'bg-red-500', label: 'Absent' },
            { color: 'bg-blue-500', label: 'Excused' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-sm">
              <span className={cn('h-3 w-3 rounded-full', l.color)} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Day detail */}
      {cal.selectedDayAttendance && (
        <DayDetailPanel
          da={cal.selectedDayAttendance}
          onClose={() => cal.setSelectedDate(null)}
        />
      )}

      {/* Empty state for selected date with no records */}
      {cal.selectedDate && !cal.selectedDayAttendance && (
        <div className="rounded-xl border bg-card p-5 text-center text-sm text-muted-foreground shadow-sm">
          No attendance records for this date.
        </div>
      )}
    </div>
  );
}
