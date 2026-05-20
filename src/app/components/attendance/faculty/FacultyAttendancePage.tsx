import { useState } from 'react';
import { useFacultyAttendance } from '@/lib/hooks/attendance/useFacultyAttendance';
import { cn } from '@/app/components/ui/utils';
import { instructors } from '@/lib/data/attendance/instructors';
import {
  BookOpen, Search, X, AlertTriangle, Calendar, Users,
  CheckCircle2, Clock, XCircle, MinusCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { AttendanceStatus } from '@/lib/types/attendance';

const DEMO_INSTRUCTOR_ID = 'inst-2';

const STATUS_CONFIG: Record<AttendanceStatus | 'no-record', { label: string; className: string; icon: React.ElementType }> = {
  present:    { label: 'Present',   className: 'bg-green-100 text-green-800',  icon: CheckCircle2 },
  late:       { label: 'Late',      className: 'bg-yellow-100 text-yellow-800', icon: Clock },
  absent:     { label: 'Absent',    className: 'bg-red-100 text-red-800',       icon: XCircle },
  excused:    { label: 'Excused',   className: 'bg-blue-100 text-blue-800',     icon: MinusCircle },
  'no-record':{ label: '—',         className: 'bg-muted text-muted-foreground', icon: MinusCircle },
};

function RateBar({ rate, className }: { rate: number; className?: string }) {
  const color = rate >= 90 ? 'bg-green-500' : rate >= 75 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${rate}%` }} />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums w-9 text-right', rate >= 90 ? 'text-green-700' : rate >= 75 ? 'text-yellow-700' : 'text-red-700')}>
        {rate}%
      </span>
    </div>
  );
}

function StatusDot({ status }: { status: AttendanceStatus | 'no-record' }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center justify-center h-6 w-6 rounded text-xs font-bold', cfg.className)} title={cfg.label}>
      {status === 'present' ? 'P' : status === 'late' ? 'L' : status === 'absent' ? 'A' : status === 'excused' ? 'E' : '—'}
    </span>
  );
}

export default function FacultyAttendancePage() {
  const [instructorId, setInstructorId] = useState(DEMO_INSTRUCTOR_ID);
  const att = useFacultyAttendance(instructorId);
  const [showSessions, setShowSessions] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const handleInstructorChange = (newId: string) => {
    setInstructorId(newId);
    setShowSessions(false);
    setExpandedStudentId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-muted-foreground" />
              Class Attendance
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              2024-2025 · 1st Semester · Monitor student attendance for your handled classes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Viewing as:</span>
            <select
              value={instructorId}
              onChange={(e) => handleInstructorChange(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        {att.instructorClasses.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No classes assigned</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            {/* Class sidebar */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Classes</p>
              {att.instructorClasses.map((cls) => (
                <button
                  key={cls.classId}
                  onClick={() => att.setSelectedClass(cls.classId)}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-all shadow-sm',
                    att.selectedClass?.classId === cls.classId
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/30',
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{cls.subjectCode}</p>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{cls.subjectTitle}</p>
                  <p className="text-xs text-muted-foreground">{cls.sectionCode} · {cls.room}</p>
                  <div className="mt-2">
                    <RateBar rate={att.selectedClass?.classId === cls.classId ? att.classSummary.attendanceRate : 0} />
                  </div>
                </button>
              ))}
            </div>

            {/* Main content */}
            {att.selectedClass ? (
              <div className="space-y-4">
                {/* Class header + summary */}
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h2 className="font-semibold">
                        {att.selectedClass.subjectCode} — {att.selectedClass.subjectTitle}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {att.selectedClass.sectionCode} · {att.selectedClass.room} · {att.selectedClass.enrolledStudentIds.length} students · {att.selectedClass.totalSessions} sessions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Overall Rate</p>
                      <p className={cn(
                        'text-2xl font-bold tabular-nums',
                        att.classSummary.attendanceRate >= 90 ? 'text-green-700'
                          : att.classSummary.attendanceRate >= 75 ? 'text-yellow-700'
                          : 'text-red-700',
                      )}>
                        {att.classSummary.attendanceRate}%
                      </p>
                    </div>
                  </div>

                  {/* Stat pills */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Present', value: att.classSummary.present, color: 'text-green-700 bg-green-50 border-green-200' },
                      { label: 'Late', value: att.classSummary.late, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
                      { label: 'Absent', value: att.classSummary.absent, color: 'text-red-700 bg-red-50 border-red-200' },
                      { label: 'Excused', value: att.classSummary.excused, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                    ].map((s) => (
                      <div key={s.label} className={cn('rounded-lg border px-3 py-2 text-center', s.color)}>
                        <p className="text-lg font-bold tabular-nums">{s.value}</p>
                        <p className="text-xs">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search student…"
                      value={att.searchQuery}
                      onChange={(e) => att.setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border bg-background pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    {att.searchQuery && (
                      <button onClick={() => att.setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">From:</span>
                    <input type="date" value={att.dateFrom} onChange={(e) => att.setDateFrom(e.target.value)}
                      className="rounded-lg border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    <span className="text-xs text-muted-foreground">To:</span>
                    <input type="date" value={att.dateTo} onChange={(e) => att.setDateTo(e.target.value)}
                      className="rounded-lg border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    {(att.dateFrom || att.dateTo) && (
                      <button onClick={() => { att.setDateFrom(''); att.setDateTo(''); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Student rows */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b bg-muted/30 flex items-center justify-between">
                    <p className="text-sm font-semibold">Student Attendance Summary</p>
                    <button
                      onClick={() => setShowSessions((v) => !v)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {showSessions ? 'Hide' : 'Show'} session view
                      {showSessions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  {!showSessions ? (
                    // Per-student summary table
                    <div className="divide-y">
                      {att.studentRows.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">No students found.</div>
                      ) : (
                        att.studentRows.map((row) => (
                          <div key={row.studentId}>
                            <button
                              onClick={() => setExpandedStudentId(expandedStudentId === row.studentId ? null : row.studentId)}
                              className={cn(
                                'w-full px-5 py-3 flex items-center gap-4 text-left transition-colors',
                                row.isAtRisk ? 'bg-red-50/30' : 'hover:bg-muted/20',
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">{row.studentName}</p>
                                  {row.isAtRisk && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700 border border-red-200">
                                      <AlertTriangle className="h-3 w-3" /> At Risk
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{row.studentNumber}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-green-700">{row.summary.present}P</span>
                                <span className="text-yellow-700">{row.summary.late}L</span>
                                <span className="text-red-700">{row.summary.absent}A</span>
                                <span className="text-blue-700">{row.summary.excused}E</span>
                              </div>
                              <div className="w-32">
                                <RateBar rate={row.summary.attendanceRate} />
                              </div>
                              <span className="text-xs text-muted-foreground">{row.lastSeen ?? '—'}</span>
                              {expandedStudentId === row.studentId ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            </button>

                            {/* Expanded: session-by-session for this student */}
                            {expandedStudentId === row.studentId && (
                              <div className="px-5 py-3 bg-muted/20 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Session Log</p>
                                <div className="flex flex-wrap gap-1">
                                  {att.classSessions.map((session) => {
                                    const status = session.studentStatuses[row.studentId] ?? 'no-record';
                                    return (
                                      <div key={session.date} className="flex flex-col items-center gap-0.5" title={`${session.date}: ${STATUS_CONFIG[status].label}`}>
                                        <StatusDot status={status} />
                                        <span className="text-[9px] text-muted-foreground">{session.date.slice(5)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    // Session matrix view
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-card border-b">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground min-w-36">Student</th>
                            {att.classSessions.slice(0, 20).map((s) => (
                              <th key={s.date} className="px-1 py-2.5 text-center text-xs font-medium text-muted-foreground whitespace-nowrap">
                                {s.date.slice(5)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {att.studentRows.map((row) => (
                            <tr key={row.studentId} className={cn('hover:bg-muted/20', row.isAtRisk && 'bg-red-50/30')}>
                              <td className="px-4 py-2">
                                <p className="text-sm font-medium">{row.studentName}</p>
                                <p className="text-xs text-muted-foreground">{row.studentNumber}</p>
                              </td>
                              {att.classSessions.slice(0, 20).map((session) => {
                                const status = session.studentStatuses[row.studentId] ?? 'no-record';
                                return (
                                  <td key={session.date} className="px-1 py-2 text-center">
                                    <StatusDot status={status} />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {att.classSessions.length > 20 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Showing latest 20 of {att.classSessions.length} sessions
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Select a class</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
