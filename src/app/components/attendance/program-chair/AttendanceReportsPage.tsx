import { useState, useMemo } from 'react';
import { useAttendanceReports } from '@/lib/hooks/attendance/useAttendanceReports';
import { cn } from '@/app/components/ui/utils';
import {
  BarChart3, AlertTriangle, TrendingUp, Users, BookOpen,
  ChevronDown, ChevronUp, Search, X, Star,
} from 'lucide-react';
import type { ClassAttendanceReport } from '@/lib/hooks/attendance/useAttendanceReports';

function RateBar({ rate }: { rate: number }) {
  const color = rate >= 90 ? 'bg-green-500' : rate >= 75 ? 'bg-yellow-500' : 'bg-red-500';
  const text = rate >= 90 ? 'text-green-700' : rate >= 75 ? 'text-yellow-700' : 'text-red-700';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${rate}%` }} />
      </div>
      <span className={cn('text-xs font-bold tabular-nums w-9 text-right', text)}>{rate}%</span>
    </div>
  );
}

function RateBadge({ rate }: { rate: number }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border',
      rate >= 90 ? 'bg-green-50 text-green-800 border-green-200'
        : rate >= 75 ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
        : 'bg-red-50 text-red-800 border-red-200',
    )}>
      {rate}%
    </span>
  );
}

interface ClassRowProps {
  report: ClassAttendanceReport;
  rank: number;
}

function ClassRow({ report, rank }: ClassRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className={cn(
          'border-b cursor-pointer hover:bg-muted/20 transition-colors',
          report.summary.attendanceRate < 75 && 'bg-red-50/30',
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 text-sm text-muted-foreground">{rank}</td>
        <td className="px-4 py-3">
          <p className="font-medium text-sm">{report.subjectCode}</p>
          <p className="text-xs text-muted-foreground truncate max-w-48">{report.subjectTitle}</p>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{report.sectionCode}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{report.instructorName.split(' ').slice(-1)[0]}</td>
        <td className="px-4 py-3 text-center text-sm">{report.enrolledCount}</td>
        <td className="px-4 py-3 text-center text-sm">{report.totalSessions}</td>
        <td className="px-4 py-3 text-center text-green-700 text-sm">{report.summary.present}</td>
        <td className="px-4 py-3 text-center text-yellow-700 text-sm">{report.summary.late}</td>
        <td className="px-4 py-3 text-center text-red-700 text-sm">{report.summary.absent}</td>
        <td className="px-4 py-3 min-w-32">
          <RateBar rate={report.summary.attendanceRate} />
        </td>
        <td className="px-4 py-3 text-center">
          {report.atRiskCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700">
              <AlertTriangle className="h-3 w-3" /> {report.atRiskCount}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground mx-auto" /> : <ChevronDown className="h-4 w-4 text-muted-foreground mx-auto" />}
        </td>
      </tr>

      {/* Student breakdown */}
      {expanded && (
        <tr className="border-b bg-muted/10">
          <td colSpan={12} className="px-6 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Student Breakdown</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {report.studentSummaries.map((s) => (
                <div
                  key={s.studentId}
                  className={cn(
                    'rounded-lg border px-3 py-2 flex items-center justify-between gap-3',
                    s.isAtRisk ? 'border-red-200 bg-red-50' : 'border-border bg-background',
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.studentName}</p>
                    <p className="text-xs text-muted-foreground">{s.studentNumber}</p>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className="text-green-700">{s.summary.present}P</span>
                      <span className="text-yellow-700">{s.summary.late}L</span>
                      <span className="text-red-700">{s.summary.absent}A</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RateBadge rate={s.summary.attendanceRate} />
                    {s.isAtRisk && <span className="text-[10px] text-red-600 flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" /> At Risk</span>}
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AttendanceReportsPage() {
  const { classReports, overall } = useAttendanceReports();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rate-asc' | 'rate-desc' | 'subject'>('rate-asc');

  const filtered = useMemo(() => {
    let list = classReports;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.subjectCode.toLowerCase().includes(q) ||
          r.subjectTitle.toLowerCase().includes(q) ||
          r.instructorName.toLowerCase().includes(q) ||
          r.sectionCode.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'rate-asc') return a.summary.attendanceRate - b.summary.attendanceRate;
      if (sortBy === 'rate-desc') return b.summary.attendanceRate - a.summary.attendanceRate;
      return a.subjectCode.localeCompare(b.subjectCode);
    });
  }, [classReports, search, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
            Attendance Reports
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            2024-2025 · 1st Semester · Program-wide attendance overview across all classes.
          </p>
        </div>

        {/* Overall KPI cards */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Classes', value: overall.totalClasses, icon: BookOpen, color: 'text-muted-foreground' },
            { label: 'Students', value: overall.totalStudents, icon: Users, color: 'text-muted-foreground' },
            { label: 'Total Sessions', value: overall.totalSessions, icon: BarChart3, color: 'text-muted-foreground' },
            { label: 'Avg Rate', value: `${overall.avgAttendanceRate}%`, icon: TrendingUp, color: overall.avgAttendanceRate >= 85 ? 'text-green-700' : 'text-yellow-700' },
            { label: 'At Risk', value: overall.atRiskStudents, icon: AlertTriangle, color: overall.atRiskStudents > 0 ? 'text-red-700' : 'text-muted-foreground' },
            { label: 'Perfect Attendance', value: overall.perfectAttendanceStudents, icon: Star, color: 'text-green-700' },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border bg-card p-4 shadow-sm text-center">
              <card.icon className={cn('h-5 w-5 mx-auto mb-1', card.color)} />
              <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>

        {/* At-risk alert */}
        {overall.atRiskStudents > 0 && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">
              <span className="font-semibold">{overall.atRiskStudents} student{overall.atRiskStudents !== 1 ? 's' : ''}</span> across the program are below 75% attendance and may be at risk of not receiving credit. Expand a class row to see the breakdown.
            </p>
          </div>
        )}

        {/* Table toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search class, subject, instructor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="rate-asc">Sort: Rate ↑ (lowest first)</option>
            <option value="rate-desc">Sort: Rate ↓ (highest first)</option>
            <option value="subject">Sort: Subject A–Z</option>
          </select>
          <p className="text-sm text-muted-foreground">{filtered.length} class{filtered.length !== 1 ? 'es' : ''}</p>
        </div>

        {/* Class comparison table */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Subject</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Section</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Instructor</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Students</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Sessions</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-green-700">Present</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-yellow-700">Late</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-red-700">Absent</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground min-w-36">Rate</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">At Risk</th>
                  <th className="px-4 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-10 text-center text-sm text-muted-foreground">No classes match your search.</td>
                  </tr>
                ) : (
                  filtered.map((report, idx) => (
                    <ClassRow key={report.classId} report={report} rank={idx + 1} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t bg-muted/10 text-xs text-muted-foreground text-right">
            Click any row to expand student breakdown · Attendance rate = (Present + Late + Excused) / Total sessions × 100
          </div>
        </div>
      </div>
    </div>
  );
}
