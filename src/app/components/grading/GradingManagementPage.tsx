import { useState, useCallback } from 'react';
import { useFacultyClasses } from '@/lib/hooks/grading/useFacultyClasses';
import { useGradeEncoding } from '@/lib/hooks/grading/useGradeEncoding';
import { useGradingTable } from '@/lib/hooks/grading/useGradingTable';
import { useGradingSubmission } from '@/lib/hooks/grading/useGradingSubmission';
import type { GradeRow } from '@/lib/hooks/grading/useGradeEncoding';
import type { SortField, PeriodFocus } from '@/lib/hooks/grading/useGradingTable';
import { GradeStatusBadge } from './components/GradeStatusBadge';
import { GradeRemarkBadge } from './components/GradeRemarkBadge';
import { GradeInput } from './components/GradeInput';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/app/components/ui/dialog';
import {
  BookOpen, Search, X, ChevronUp, ChevronDown, ChevronsUpDown,
  Lock, Save, Send, CheckCircle2, Loader2, SlidersHorizontal,
  Users, GraduationCap,
} from 'lucide-react';
import { instructors } from '@/lib/data/attendance/instructors';
import type { GradeStatus } from '@/lib/types/grades';
import { gradeSettings } from '@/lib/data/grades/grade-settings';

const STATUS_FILTERS: { value: GradeStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'finalized', label: 'Finalized' },
];

const PERIOD_FILTERS: { value: PeriodFocus; label: string }[] = [
  { value: 'all', label: 'All Periods' },
  { value: 'prelim', label: 'Missing Prelim' },
  { value: 'midterm', label: 'Missing Midterm' },
  { value: 'final', label: 'Missing Final' },
];

function SortIcon({ field, active, dir }: { field: SortField; active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />;
  return dir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-primary" />
    : <ChevronDown className="h-3.5 w-3.5 text-primary" />;
}

interface SortableThProps {
  label: string;
  field: SortField;
  activeSortField: SortField;
  sortDir: 'asc' | 'desc';
  onSort: (f: SortField) => void;
  className?: string;
}

function SortableTh({ label, field, activeSortField, sortDir, onSort, className }: SortableThProps) {
  return (
    <th
      onClick={() => onSort(field)}
      className={cn(
        'px-3 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none group',
        className,
      )}
    >
      <span className="flex items-center gap-1 whitespace-nowrap">
        {label}
        <SortIcon field={field} active={activeSortField === field} dir={sortDir} />
      </span>
    </th>
  );
}

function gradeColor(value: number | null): string {
  if (value === null) return 'text-muted-foreground';
  if (value >= 90) return 'text-green-700';
  if (value >= 75) return 'text-blue-700';
  if (value >= 60) return 'text-yellow-700';
  return 'text-red-700';
}

// ─── Submission Confirmation Dialog ──────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  action: string | null;
  studentName: string | null;
  submitableCount: number;
  finalizableCount: number;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen, action, studentName, submitableCount, finalizableCount, isProcessing, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const isBulk = action === 'bulk_submit' || action === 'bulk_finalize';
  const isFinalize = action === 'finalize' || action === 'bulk_finalize';

  const title = action === 'submit'
    ? 'Submit Grades'
    : action === 'finalize'
      ? 'Finalize Grades'
      : action === 'bulk_submit'
        ? 'Submit All Draft Grades'
        : 'Finalize All Submitted Grades';

  const description = action === 'submit'
    ? `Submit grades for ${studentName}? They will be locked from further editing until re-opened.`
    : action === 'finalize'
      ? `Permanently finalize grades for ${studentName}? This action cannot be undone.`
      : action === 'bulk_submit'
        ? `Submit grades for ${submitableCount} student${submitableCount !== 1 ? 's' : ''} with complete grades. Students with missing grades will be skipped.`
        : `Permanently finalize grades for ${finalizableCount} submitted student${finalizableCount !== 1 ? 's' : ''}. This cannot be undone.`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isProcessing) onCancel(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={cn(isFinalize && 'text-red-700')}>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {isFinalize && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Finalized grades are permanently locked and cannot be edited. Please review carefully before proceeding.
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>Cancel</Button>
          <Button
            variant={isFinalize ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isProcessing || (isBulk && (action === 'bulk_submit' ? submitableCount === 0 : finalizableCount === 0))}
          >
            {isProcessing
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
              : isFinalize ? 'Finalize' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Grading Table for one class ─────────────────────────────────────────────

interface ClassGradingTableProps {
  classId: string;
  instructorId: string;
}

function ClassGradingTable({ classId, instructorId }: ClassGradingTableProps) {
  const encoding = useGradeEncoding(instructorId, classId);
  const table = useGradingTable(encoding.rows);
  const submission = useGradingSubmission();
  const [showFilters, setShowFilters] = useState(false);

  const handleConfirm = useCallback(async () => {
    const { action, targetRecordId } = submission.dialog;
    await submission.confirm(() => {
      if (action === 'submit' && targetRecordId) encoding.submitRecord(targetRecordId);
      else if (action === 'finalize' && targetRecordId) encoding.finalizeRecord(targetRecordId);
      else if (action === 'bulk_submit') encoding.bulkSubmit();
      else if (action === 'bulk_finalize') encoding.bulkFinalize();
    });
  }, [submission, encoding]);

  const canBulkSubmit = encoding.submitableCount > 0;
  const canBulkFinalize = encoding.finalizableCount > 0;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Draft', value: encoding.rows.filter((r) => r.effectiveStatus === 'draft').length, color: 'text-yellow-700' },
          { label: 'Submitted', value: encoding.rows.filter((r) => r.effectiveStatus === 'submitted').length, color: 'text-blue-700' },
          { label: 'Finalized', value: encoding.rows.filter((r) => r.effectiveStatus === 'finalized').length, color: 'text-green-700' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-3 shadow-sm text-center">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-muted-foreground text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search student name or number…"
              value={table.searchQuery}
              onChange={(e) => table.setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {table.searchQuery && (
              <button
                onClick={() => table.setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
            Filters
            {table.hasActiveFilters && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">!</span>
            )}
          </Button>

          {/* Bulk actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              disabled={!canBulkSubmit}
              onClick={submission.requestBulkSubmit}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Submit All ({encoding.submitableCount})
            </Button>
            <Button
              size="sm"
              disabled={!canBulkFinalize}
              onClick={submission.requestBulkFinalize}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Finalize All ({encoding.finalizableCount})
            </Button>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex items-center gap-4 flex-wrap px-3 py-2 rounded-lg border bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status:</span>
              <div className="flex gap-1 flex-wrap">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => table.setStatusFilter(f.value as GradeStatus | 'all')}
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors border',
                      table.statusFilter === f.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:bg-accent',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Show:</span>
              <div className="flex gap-1 flex-wrap">
                {PERIOD_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => table.setPeriodFocus(f.value)}
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors border',
                      table.periodFocus === f.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:bg-accent',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {table.hasActiveFilters && (
              <button
                onClick={table.resetFilters}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-8">#</th>
                  <SortableTh label="Student" field="studentName" activeSortField={table.sortField} sortDir={table.sortDir} onSort={table.toggleSort} className="min-w-40" />
                  <SortableTh label="ID No." field="studentNumber" activeSortField={table.sortField} sortDir={table.sortDir} onSort={table.toggleSort} />
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Units</th>
                  <SortableTh label="Prelim" field="prelim" activeSortField={table.sortField} sortDir={table.sortDir} onSort={table.toggleSort} className="text-center" />
                  <SortableTh label="Midterm" field="midterm" activeSortField={table.sortField} sortDir={table.sortDir} onSort={table.toggleSort} className="text-center" />
                  <SortableTh label="Final" field="final" activeSortField={table.sortField} sortDir={table.sortDir} onSort={table.toggleSort} className="text-center" />
                  <SortableTh label="Overall" field="overall" activeSortField={table.sortField} sortDir={table.sortDir} onSort={table.toggleSort} className="text-center" />
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">GP</th>
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Remarks</th>
                  <SortableTh label="Status" field="status" activeSortField={table.sortField} sortDir={table.sortDir} onSort={table.toggleSort} className="text-center" />
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {table.pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      {table.hasActiveFilters
                        ? 'No students match the current filters.'
                        : 'No grade records found for this class.'}
                    </td>
                  </tr>
                ) : (
                  table.pageRows.map((row, idx) => (
                    <GradeTableRow
                      key={row.recordId}
                      row={row}
                      rowIndex={(table.currentPage - 1) * 10 + idx + 1}
                      onUpdate={(field, value) => encoding.updateGrade(row.recordId, field, value)}
                      onSaveDraft={() => encoding.saveDraft(row.recordId)}
                      onRequestSubmit={() => submission.requestSubmit(row.recordId, row.studentName)}
                      onRequestFinalize={() => submission.requestFinalize(row.recordId, row.studentName)}
                      highlightPrelim={table.periodFocus === 'prelim'}
                      highlightMidterm={table.periodFocus === 'midterm'}
                      highlightFinal={table.periodFocus === 'final'}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {table.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {((table.currentPage - 1) * 10) + 1}–{Math.min(table.currentPage * 10, table.filteredTotal)} of {table.filteredTotal} student{table.filteredTotal !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="sm"
                disabled={table.currentPage === 1}
                onClick={() => table.setPage(table.currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: table.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => table.setPage(p)}
                  className={cn(
                    'h-8 w-8 rounded text-sm font-medium transition-colors',
                    p === table.currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent',
                  )}
                >
                  {p}
                </button>
              ))}
              <Button
                variant="outline" size="sm"
                disabled={table.currentPage === table.totalPages}
                onClick={() => table.setPage(table.currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Grading weights info */}
        <div className="flex items-center gap-3 px-4 py-2 border-t bg-muted/10 text-xs text-muted-foreground">
          <span>Grade weights:</span>
          <span>Prelim {Math.round(gradeSettings.prelimWeight * 100)}%</span>
          <span>·</span>
          <span>Midterm {Math.round(gradeSettings.midtermWeight * 100)}%</span>
          <span>·</span>
          <span>Final {Math.round(gradeSettings.finalWeight * 100)}%</span>
          <span>·</span>
          <span>Passing: {gradeSettings.passingGrade}</span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={submission.dialog.isOpen}
        action={submission.dialog.action}
        studentName={submission.dialog.targetStudentName}
        submitableCount={encoding.submitableCount}
        finalizableCount={encoding.finalizableCount}
        isProcessing={submission.dialog.isProcessing}
        onConfirm={handleConfirm}
        onCancel={submission.cancel}
      />
    </div>
  );
}

// ─── Individual grade table row ───────────────────────────────────────────────

interface GradeTableRowProps {
  row: GradeRow;
  rowIndex: number;
  onUpdate: (field: 'prelim' | 'midterm' | 'final', value: number | null) => void;
  onSaveDraft: () => void;
  onRequestSubmit: () => void;
  onRequestFinalize: () => void;
  highlightPrelim?: boolean;
  highlightMidterm?: boolean;
  highlightFinal?: boolean;
}

function GradeTableRow({
  row, rowIndex, onUpdate, onSaveDraft, onRequestSubmit, onRequestFinalize,
  highlightPrelim, highlightMidterm, highlightFinal,
}: GradeTableRowProps) {
  const canSubmit = row.effectiveStatus === 'draft' && row.computed.isComplete && !Object.values(row.fieldErrors).some(Boolean);
  const canFinalize = row.effectiveStatus === 'submitted';

  return (
    <tr
      className={cn(
        'transition-colors',
        row.isLocked ? 'bg-muted/20' : row.isDirty ? 'bg-primary/3' : 'hover:bg-muted/30',
        row.computed.remarks === 'Failed' && !row.isLocked && 'bg-red-50/40 hover:bg-red-50/60',
      )}
    >
      <td className="px-3 py-2.5 text-xs text-muted-foreground">{rowIndex}</td>

      {/* Student */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          {row.isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
          <div>
            <p className="font-medium text-sm">{row.studentName}</p>
          </div>
        </div>
      </td>

      {/* Student # */}
      <td className="px-3 py-2.5 text-xs text-muted-foreground tabular-nums">{row.studentNumber}</td>

      {/* Units */}
      <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">{row.subjectUnits}</td>

      {/* Prelim */}
      <td className="px-3 py-2 text-center">
        {row.isLocked ? (
          <span className={cn('tabular-nums', gradeColor(row.prelim))}>{row.prelim ?? '—'}</span>
        ) : (
          <div className="flex justify-center">
            <GradeInput
              value={row.prelim}
              onChange={(v) => onUpdate('prelim', v)}
              disabled={row.isLocked}
              error={row.fieldErrors.prelim}
              highlight={highlightPrelim && row.prelim === null}
            />
          </div>
        )}
      </td>

      {/* Midterm */}
      <td className="px-3 py-2 text-center">
        {row.isLocked ? (
          <span className={cn('tabular-nums', gradeColor(row.midterm))}>{row.midterm ?? '—'}</span>
        ) : (
          <div className="flex justify-center">
            <GradeInput
              value={row.midterm}
              onChange={(v) => onUpdate('midterm', v)}
              disabled={row.isLocked}
              error={row.fieldErrors.midterm}
              highlight={highlightMidterm && row.midterm === null}
            />
          </div>
        )}
      </td>

      {/* Final */}
      <td className="px-3 py-2 text-center">
        {row.isLocked ? (
          <span className={cn('tabular-nums', gradeColor(row.final))}>{row.final ?? '—'}</span>
        ) : (
          <div className="flex justify-center">
            <GradeInput
              value={row.final}
              onChange={(v) => onUpdate('final', v)}
              disabled={row.isLocked}
              error={row.fieldErrors.final}
              highlight={highlightFinal && row.final === null}
            />
          </div>
        )}
      </td>

      {/* Overall */}
      <td className="px-3 py-2.5 text-center">
        <span className={cn('font-semibold tabular-nums text-sm', gradeColor(row.computed.overall))}>
          {row.computed.overall !== null ? row.computed.overall.toFixed(2) : '—'}
        </span>
      </td>

      {/* Grade Point */}
      <td className="px-3 py-2.5 text-center">
        <span className={cn('font-semibold tabular-nums text-sm', row.computed.gradePoint !== null && row.computed.gradePoint >= 5 ? 'text-red-700' : 'text-muted-foreground')}>
          {row.computed.gradePoint !== null ? row.computed.gradePoint.toFixed(2) : '—'}
        </span>
      </td>

      {/* Remarks */}
      <td className="px-3 py-2.5 text-center">
        <GradeRemarkBadge remark={row.computed.remarks} size="sm" />
      </td>

      {/* Status */}
      <td className="px-3 py-2.5 text-center">
        <GradeStatusBadge status={row.effectiveStatus} size="sm" />
      </td>

      {/* Actions */}
      <td className="px-3 py-2.5">
        <div className="flex items-center justify-center gap-1">
          {row.isLocked ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" /> Locked
            </span>
          ) : (
            <>
              {row.isDirty && (
                <Button size="sm" variant="outline" onClick={onSaveDraft} className="h-7 px-2 text-xs">
                  <Save className="h-3 w-3 mr-1" /> Save
                </Button>
              )}
              {canSubmit && (
                <Button size="sm" variant="secondary" onClick={onRequestSubmit} className="h-7 px-2 text-xs">
                  <Send className="h-3 w-3 mr-1" /> Submit
                </Button>
              )}
              {canFinalize && (
                <Button size="sm" onClick={onRequestFinalize} className="h-7 px-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Finalize
                </Button>
              )}
              {!row.isDirty && !canSubmit && !canFinalize && (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEMO_INSTRUCTOR_ID = 'inst-2';

export default function GradingManagementPage() {
  const [instructorId, setInstructorId] = useState(DEMO_INSTRUCTOR_ID);
  const [selectedClassId, setSelectedClassId] = useState('');

  const currentClasses = useFacultyClasses(instructorId);
  const effectiveClassId = selectedClassId || currentClasses[0]?.classId || '';
  const selectedClass = currentClasses.find((c) => c.classId === effectiveClassId);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
              Grading Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              2024-2025 · 1st Semester · Encode and manage student grades for your handled classes.
            </p>
          </div>

          {/* Demo instructor picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Viewing as:</span>
            <select
              value={instructorId}
              onChange={(e) => {
                setInstructorId(e.target.value);
                setSelectedClassId('');
              }}
              className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Teaching load overview */}
        {currentClasses.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No teaching load found</p>
            <p className="text-muted-foreground text-sm mt-1">This instructor has no assigned classes for this semester.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Left: Class list sidebar */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Teaching Load ({currentClasses.length} class{currentClasses.length !== 1 ? 'es' : ''})
              </p>
              <div className="space-y-2">
                {currentClasses.map((cls) => (
                  <button
                    key={cls.classId}
                    onClick={() => setSelectedClassId(cls.classId)}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-all',
                      effectiveClassId === cls.classId
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:bg-muted/40 shadow-sm',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{cls.subjectCode}</p>
                        <p className="text-xs text-muted-foreground truncate">{cls.subjectTitle}</p>
                      </div>
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{cls.sectionCode}</span>
                      <span>·</span>
                      <span>{cls.room}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{cls.finalizedCount}/{cls.enrolledCount} finalized</span>
                        <span className="text-muted-foreground">{cls.completionPercent}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            cls.completionPercent === 100 ? 'bg-green-500' : 'bg-primary',
                          )}
                          style={{ width: `${cls.completionPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {cls.draftCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">{cls.draftCount} draft</span>
                      )}
                      {cls.submittedCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">{cls.submittedCount} submitted</span>
                      )}
                      {cls.finalizedCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">{cls.finalizedCount} final</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Grading table */}
            <div>
              {effectiveClassId && selectedClass ? (
                <>
                  {/* Class header */}
                  <div className="mb-4 rounded-xl border bg-card px-5 py-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h2 className="font-semibold">
                          {selectedClass.subjectCode} — {selectedClass.subjectTitle}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedClass.sectionCode} · {selectedClass.room} · {selectedClass.subjectUnits} units · {selectedClass.enrolledCount} enrolled
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Completion:</span>
                        <span className={cn('text-sm font-bold', selectedClass.completionPercent === 100 ? 'text-green-700' : 'text-muted-foreground')}>
                          {selectedClass.completionPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <ClassGradingTable
                    key={`${instructorId}-${effectiveClassId}`}
                    classId={effectiveClassId}
                    instructorId={instructorId}
                  />
                </>
              ) : (
                <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">Select a class to manage grades</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
