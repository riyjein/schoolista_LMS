import { useState } from 'react';
import { useFacultyRatings } from '@/lib/hooks/evaluation/useFacultyRatings';
import { useEvaluationAggregation } from '@/lib/hooks/evaluation/useEvaluationAggregation';
import { useEvaluationFilters } from '@/lib/hooks/evaluation/useEvaluationFilters';
import { RatingBar, StarRating } from '../components/RatingBar';
import { cn } from '@/app/components/ui/utils';
import { instructors } from '@/lib/data/attendance/instructors';
import { Users, TrendingUp, Award, Search, X, ChevronUp, ChevronDown, Minus } from 'lucide-react';

const DEMO_INSTRUCTOR_ID = 'inst-1';

function RatingTrend({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground text-xs">—</span>;
  const pct = (value / 5) * 100;
  if (pct >= 90) return <ChevronUp className="h-4 w-4 text-green-500" />;
  if (pct >= 70) return <Minus className="h-4 w-4 text-blue-500" />;
  return <ChevronDown className="h-4 w-4 text-red-500" />;
}

function ratingTextColor(value: number | null): string {
  if (value === null) return 'text-muted-foreground';
  const pct = value / 5;
  if (pct >= 0.9) return 'text-green-700';
  if (pct >= 0.7) return 'text-blue-700';
  if (pct >= 0.5) return 'text-yellow-700';
  return 'text-red-700';
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold">1</span>;
  if (rank === 2) return <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-300 text-slate-700 text-xs font-bold">2</span>;
  if (rank === 3) return <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-300 text-orange-900 text-xs font-bold">3</span>;
  return <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">{rank}</span>;
}

interface InstructorDetailProps {
  instructorId: string;
}

function InstructorDetail({ instructorId }: InstructorDetailProps) {
  const summary = useFacultyRatings(instructorId);

  if (summary.totalEvaluations === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 shadow-sm text-center">
        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium">No evaluations yet</p>
        <p className="text-muted-foreground text-sm mt-1">Students have not submitted any evaluations for this instructor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall rating card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall Rating</p>
            <StarRating value={summary.overallRating} />
            <p className="text-xs text-muted-foreground mt-2">
              Based on {summary.totalEvaluations} evaluation{summary.totalEvaluations !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Department</p>
            <p className="text-sm font-medium">{summary.department}</p>
          </div>
        </div>

        {/* Overall bar */}
        <div className="mt-4 pt-4 border-t">
          <RatingBar value={summary.overallRating} maxValue={5} label="Weighted Score" />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/40">
          <p className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Category Breakdown
          </p>
        </div>
        <div className="p-5 space-y-4">
          {summary.categoryScores.map((cs) => (
            <div key={cs.categoryId}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0', cs.color)} />
                  <span className="text-sm font-medium">{cs.label}</span>
                  <span className="text-xs text-muted-foreground">({Math.round(cs.weight * 100)}%)</span>
                </div>
                <span className="text-xs text-muted-foreground">{cs.count} ratings</span>
              </div>
              <RatingBar value={cs.average} maxValue={5} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Per-class stats */}
      {summary.classStats.length > 0 && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/40">
            <p className="font-semibold text-sm">Class Statistics</p>
          </div>
          <div className="divide-y">
            {summary.classStats.map((cs) => (
              <div key={cs.classId} className="px-5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{cs.subjectCode} — {cs.subjectTitle}</p>
                    <p className="text-xs text-muted-foreground">{cs.sectionCode} · {cs.evaluationCount} response{cs.evaluationCount !== 1 ? 's' : ''}</p>
                  </div>
                  <span className={cn('text-sm font-bold tabular-nums', ratingTextColor(cs.averageRating))}>
                    {cs.averageRating !== null ? cs.averageRating.toFixed(2) : '—'}
                  </span>
                </div>
                <RatingBar value={cs.averageRating} maxValue={5} size="sm" showValue={false} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacultyEvaluationPage() {
  const [selectedInstructorId, setSelectedInstructorId] = useState(DEMO_INSTRUCTOR_ID);
  const allSummaries = useEvaluationAggregation();
  const { filters, setFilter, clearFilters, filtered, hasActiveFilters } = useEvaluationFilters(allSummaries);

  const selectedInstructor = instructors.find((i) => i.id === selectedInstructorId);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold tracking-tight">Faculty Evaluation Results</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            2024-2025 1st Semester · Aggregated student feedback for all instructors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Rankings table */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
                <p className="font-semibold text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  Faculty Rankings
                </p>
                <span className="text-xs text-muted-foreground">{allSummaries.length} instructors</span>
              </div>

              {/* Search filter */}
              <div className="px-3 py-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search instructors…"
                    value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                    className="w-full rounded-md border bg-background pl-8 pr-8 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  {filters.search && (
                    <button onClick={() => setFilter('search', '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Min rating filter */}
              <div className="px-3 py-2 border-b flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex-shrink-0">Min rating:</span>
                <div className="flex gap-1">
                  {[0, 3, 3.5, 4, 4.5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setFilter('minRating', v)}
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium transition-colors',
                        filters.minRating === v
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent',
                      )}
                    >
                      {v === 0 ? 'All' : `${v}+`}
                    </button>
                  ))}
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>

              {/* Instructor list */}
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">No instructors match your filters.</div>
                ) : (
                  filtered.map((s, idx) => {
                    const globalRank = allSummaries.findIndex((a) => a.instructorId === s.instructorId) + 1;
                    const isSelected = s.instructorId === selectedInstructorId;
                    return (
                      <button
                        key={s.instructorId}
                        onClick={() => setSelectedInstructorId(s.instructorId)}
                        className={cn(
                          'w-full px-4 py-3 text-left flex items-center gap-3 transition-colors',
                          isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/40',
                        )}
                      >
                        <RankBadge rank={globalRank} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.instructorName}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.department.replace('College of ', '')}</p>
                          <p className="text-xs text-muted-foreground">{s.totalEvaluations} eval{s.totalEvaluations !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={cn('text-sm font-bold tabular-nums', ratingTextColor(s.overallRating))}>
                            {s.overallRating !== null ? s.overallRating.toFixed(2) : '—'}
                          </span>
                          <RatingTrend value={s.overallRating} />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Instructors with no evals */}
              {instructors
                .filter((i) => !allSummaries.some((s) => s.instructorId === i.id))
                .map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setSelectedInstructorId(i.id)}
                    className={cn(
                      'w-full px-4 py-3 text-left flex items-center gap-3 transition-colors border-t',
                      selectedInstructorId === i.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/40',
                    )}
                  >
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs">—</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{i.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{i.department.replace('College of ', '')}</p>
                      <p className="text-xs text-muted-foreground">No evaluations</p>
                    </div>
                    <span className="text-xs text-muted-foreground">—</span>
                  </button>
                ))}
            </div>

            {/* Demo note */}
            <p className="text-xs text-muted-foreground text-center">
              Viewing instructor: <span className="font-medium">{selectedInstructor?.name}</span>
            </p>
          </div>

          {/* Right: Detail panel */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="font-semibold">{selectedInstructor?.name ?? selectedInstructorId}</h2>
              <p className="text-sm text-muted-foreground">{selectedInstructor?.department}</p>
            </div>
            <InstructorDetail instructorId={selectedInstructorId} />
          </div>
        </div>

        {/* Aggregated comparison table */}
        {allSummaries.length > 0 && (
          <div className="mt-8 rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/40">
              <p className="font-semibold text-sm">All Faculty Comparison</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">#</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Instructor</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Evals</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Teaching</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Comm.</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Mgmt.</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Prof.</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Engage.</th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Overall</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allSummaries.map((s, idx) => (
                    <tr
                      key={s.instructorId}
                      className={cn(
                        'transition-colors cursor-pointer',
                        s.instructorId === selectedInstructorId ? 'bg-primary/5' : 'hover:bg-muted/30',
                      )}
                      onClick={() => setSelectedInstructorId(s.instructorId)}
                    >
                      <td className="px-4 py-2.5">
                        <RankBadge rank={idx + 1} />
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{s.instructorName}</p>
                        <p className="text-xs text-muted-foreground">{s.department.replace('College of ', '')}</p>
                      </td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{s.totalEvaluations}</td>
                      {s.categoryScores.map((cs) => (
                        <td key={cs.categoryId} className={cn('px-4 py-2.5 text-center font-semibold tabular-nums', ratingTextColor(cs.average))}>
                          {cs.average !== null ? cs.average.toFixed(2) : '—'}
                        </td>
                      ))}
                      <td className={cn('px-4 py-2.5 text-center font-bold tabular-nums', ratingTextColor(s.overallRating))}>
                        {s.overallRating !== null ? s.overallRating.toFixed(2) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
