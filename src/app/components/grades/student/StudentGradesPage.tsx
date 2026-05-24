import { useState, type ChangeEvent } from 'react';

import { GPASummaryCard } from '../components/GPASummaryCard';
import { DLBadge } from '../components/DLBadge';
import { GradeStatusBadge } from '../components/GradeStatusBadge';
import { RemarksBadge } from '../components/RemarksBadge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { BookOpen, Clock, Search, X } from 'lucide-react';
import { subjects } from '../../../../lib/data/enrollment/subjects';
import { completedSubjectRecords } from '../../../../lib/data/enrollment/completed-subjects';
import { useGradeTable } from '../../../../lib/hooks/grades/useGradeTable';
import { useGPAComputation } from '../../../../lib/hooks/grades/useGPAComputation';
import { useDLQualification } from '../../../../lib/hooks/grades/useDLQualification';
import { EnrichedGradeRecord } from '../../../../lib/types/grades';
import { cn } from '../../../../lib/utils';


// Demo: Maria Santos (student-1)
const STUDENT_ID = 'student-1';
const STUDENT_NAME = 'Maria Santos';
const CURRENT_SCHOOL_YEAR = '2024-2025';
const CURRENT_SEMESTER = '1st Semester';

type TabId = 'current' | 'history';

function GradeCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const color =
    value >= 90 ? 'text-green-600' :
    value >= 75 ? 'text-foreground' :
    'text-red-600';
  return <span className={cn('font-mono font-medium tabular-nums', color)}>{value.toFixed(1)}</span>;
}

function OverallCell({ record }: { record: EnrichedGradeRecord }) {
  const { overall, gradePoint } = record.computed;
  if (overall === null) return <span className="text-muted-foreground">—</span>;
  const color =
    gradePoint === 5.0 ? 'text-red-600' :
    (gradePoint ?? 5) <= 1.75 ? 'text-green-600' :
    'text-foreground';
  return (
    <div className={cn('font-medium', color)}>
      <span className="font-mono tabular-nums">{overall.toFixed(1)}</span>
      <span className="text-muted-foreground ml-1 text-xs">({gradePoint?.toFixed(2)})</span>
    </div>
  );
}

export default function StudentGradesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('current');
  const table = useGradeTable(STUDENT_ID);
  const gpaResult = useGPAComputation(STUDENT_ID, true);
  const dlQual = useDLQualification(STUDENT_ID);

  const hasFilters = !!(table.filters.status || table.filters.remarks || table.filters.search);

  // Grade history from completed subjects
  const history = completedSubjectRecords
    .filter((r) => r.studentId === STUDENT_ID)
    .map((r) => {
      const subject = subjects.find((s) => s.id === r.subjectId);
      return { ...r, subjectCode: subject?.code ?? r.subjectId, subjectTitle: subject?.title ?? r.subjectId, units: subject?.units ?? 0 };
    })
    .sort((a, b) => {
      const semOrder = (s: string) => s === '1st' ? 0 : 1;
      const yearCmp = Number(b.schoolYear.split('-')[0]) - Number(a.schoolYear.split('-')[0]);
      if (yearCmp !== 0) return yearCmp;
      const yCmp = b.yearLevel - a.yearLevel;
      if (yCmp !== 0) return yCmp;
      return semOrder(b.semester) - semOrder(a.semester);
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold tracking-tight">Grades</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {STUDENT_NAME} · {CURRENT_SCHOOL_YEAR} {CURRENT_SEMESTER}
          </p>
        </div>

        {/* Top row: GPA + DL */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <GPASummaryCard gpaResult={gpaResult} />
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="text-muted-foreground mb-3 text-sm font-medium">Dean's List Status</p>
            <DLBadge qualification={dlQual} showDisqualifiers={true} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border bg-card p-1 shadow-sm">
          {([
            { id: 'current' as TabId, label: "Current Semester", icon: BookOpen },
            { id: 'history' as TabId, label: "Grade History", icon: Clock },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeTab === id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Current Semester */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search subject or instructor…"
                  className="pl-9"
                  value={table.filters.search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => table.setFilter('search', e.target.value)}
                />
              </div>
              <select
                value={table.filters.status}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => table.setFilter('status', e.target.value as any)}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="finalized">Finalized</option>
              </select>
              <select
                value={table.filters.remarks}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => table.setFilter('remarks', e.target.value as any)}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Remarks</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Incomplete">Incomplete</option>
                <option value="No Grade">No Grade</option>
              </select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={table.clearFilters}>
                  <X className="mr-1 h-4 w-4" /> Clear
                </Button>
              )}
            </div>

            {/* Grade table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {table.records.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <p className="font-medium">No grade records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden sm:table-cell">Units</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Prelim</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Midterm</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Final</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Overall</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Remarks</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden md:table-cell">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {table.paginated.map((r) => (
                        <tr key={r.id} className={cn(
                          'hover:bg-muted/30 transition-colors',
                          r.computed.remarks === 'Failed' && 'bg-red-50/50',
                        )}>
                          <td className="px-4 py-3">
                            <p className="font-medium">{r.subjectCode}</p>
                            <p className="text-muted-foreground text-xs">{r.subjectTitle}</p>
                            <p className="text-muted-foreground text-xs hidden sm:block">{r.instructorName}</p>
                          </td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell">{r.subjectUnits}</td>
                          <td className="px-4 py-3 text-center"><GradeCell value={r.prelimGrade} /></td>
                          <td className="px-4 py-3 text-center"><GradeCell value={r.midtermGrade} /></td>
                          <td className="px-4 py-3 text-center"><GradeCell value={r.finalGrade} /></td>
                          <td className="px-4 py-3 text-center"><OverallCell record={r} /></td>
                          <td className="px-4 py-3 text-center">
                            <RemarksBadge remarks={r.computed.remarks} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-center hidden md:table-cell">
                            <GradeStatusBadge status={r.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* GPA breakdown */}
            {gpaResult.items.length > 0 && (
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="mb-3 font-semibold">GPA Breakdown (Finalized Grades Only)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="py-2 text-left font-medium text-muted-foreground">Subject</th>
                        <th className="py-2 text-center font-medium text-muted-foreground">Units</th>
                        <th className="py-2 text-center font-medium text-muted-foreground">Grade Point</th>
                        <th className="py-2 text-center font-medium text-muted-foreground">Weighted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {gpaResult.items.map((item) => (
                        <tr key={item.classId}>
                          <td className="py-2">
                            <span className="font-medium">{item.subjectCode}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{item.subjectTitle}</span>
                          </td>
                          <td className="py-2 text-center">{item.units}</td>
                          <td className={cn('py-2 text-center font-mono font-medium',
                            item.gradePoint === 5.0 ? 'text-red-600' :
                            item.gradePoint <= 1.75 ? 'text-green-600' : 'text-foreground'
                          )}>
                            {item.gradePoint.toFixed(2)}
                          </td>
                          <td className="py-2 text-center font-mono">
                            {(item.gradePoint * item.units).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 font-semibold">
                        <td className="py-2">Total / GPA</td>
                        <td className="py-2 text-center">{gpaResult.finalizedUnits}</td>
                        <td className={cn('py-2 text-center font-mono',
                          gpaResult.gpa !== null && gpaResult.gpa <= 1.75 ? 'text-green-600' : 'text-foreground'
                        )}>
                          {gpaResult.gpa?.toFixed(3) ?? '—'}
                        </td>
                        <td className="py-2 text-center font-mono">
                          {gpaResult.items.reduce((s, i) => s + i.gradePoint * i.units, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grade History */}
        {activeTab === 'history' && (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            {history.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">No grade history available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden sm:table-cell">Units</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Grade</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden md:table-cell">School Year</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden sm:table-cell">Semester</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.map((r, i) => (
                      <tr key={i} className={cn(
                        'hover:bg-muted/30 transition-colors',
                        !r.passed && 'bg-red-50/50',
                      )}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{r.subjectCode}</p>
                          <p className="text-muted-foreground text-xs">{r.subjectTitle}</p>
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">{r.units}</td>
                        <td className={cn('px-4 py-3 text-center font-mono font-semibold',
                          r.grade >= 75 ? 'text-green-600' : 'text-red-600'
                        )}>
                          {r.grade}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{r.schoolYear}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">{r.semester}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                            r.passed
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200',
                          )}>
                            {r.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
