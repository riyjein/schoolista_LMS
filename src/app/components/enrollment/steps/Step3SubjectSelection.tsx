import { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, BookOpen } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { SubjectCard } from '../components/SubjectCard';
import { SubjectSuggestions } from '../components/SubjectSuggestions';
import { StickyEnrollmentSummary } from '../components/StickyEnrollmentSummary';
import { getSubjectsByIds } from '@/lib/data/enrollment/subjects';
import type { EnrichedSubject, EnrollmentStrategy, YearLevel, Semester } from '@/lib/types/enrollment';
import type { UnitComputationResult } from '@/lib/hooks/useUnitComputation';
import { useEnrollmentSuggestions } from '@/lib/hooks/useEnrollmentSuggestions';

interface Step3Props {
  courseId: string;
  yearLevel: YearLevel;
  semester: Semester;
  enrichedSubjects: EnrichedSubject[];
  selectedSubjectIds: string[];
  completedSubjectIds: string[];
  strategy: EnrollmentStrategy;
  computation: UnitComputationResult;
  validationErrors: string[];
  onToggle: (id: string) => void;
  onApplySuggestions: (ids: string[]) => void;
  onStrategyChange: (s: EnrollmentStrategy) => void;
  onClearSelection: () => void;
  onNext: () => void;
  onBack: () => void;
}

type FilterType = 'all' | 'major' | 'minor' | 'GE' | 'elective' | 'PE' | 'NSTP';

export function Step3SubjectSelection({
  courseId,
  yearLevel,
  semester,
  enrichedSubjects,
  selectedSubjectIds,
  completedSubjectIds,
  strategy,
  computation,
  validationErrors,
  onToggle,
  onApplySuggestions,
  onStrategyChange,
  onClearSelection,
  onNext,
  onBack,
}: Step3Props) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [showLocked, setShowLocked] = useState(false);

  const { suggestions } = useEnrollmentSuggestions({
    courseId,
    yearLevel,
    semester,
    completedSubjectIds,
    strategy,
    currentSelectedIds: selectedSubjectIds,
  });

  const totalSuggestedUnits = suggestions.reduce((sum, s) => sum + s.units, 0);

  const filtered = useMemo(() => {
    return enrichedSubjects.filter((s) => {
      if (s.status === 'completed') return false;
      if (!showLocked && s.status === 'locked') return false;
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [enrichedSubjects, search, typeFilter, showLocked]);

  const availableCount = enrichedSubjects.filter((s) => s.status === 'available').length;
  const lockedCount = enrichedSubjects.filter((s) => s.status === 'locked').length;
  const selectedSubjects = getSubjectsByIds(selectedSubjectIds);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">
        <div>
          <h2 className="font-semibold text-slate-800">Select Subjects</h2>
          <p className="text-sm text-slate-500 mt-1">
            Choose subjects for your {semester} Semester enrollment. {yearLevel === 1 ? '1st' : yearLevel === 2 ? '2nd' : yearLevel === 3 ? '3rd' : '4th'} Year.
          </p>
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Smart suggestions */}
        {suggestions.length > 0 && (
          <SubjectSuggestions
            suggestions={suggestions}
            strategy={strategy}
            onStrategyChange={onStrategyChange}
            onApply={onApplySuggestions}
            totalSuggestedUnits={totalSuggestedUnits}
          />
        )}

        {/* Filters row */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
            <SelectTrigger className="w-40">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="GE">GE</SelectItem>
              <SelectItem value="elective">Elective</SelectItem>
              <SelectItem value="PE">PE</SelectItem>
              <SelectItem value="NSTP">NSTP</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showLocked ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowLocked((p) => !p)}
            className={showLocked ? 'bg-slate-700 text-white' : ''}
          >
            {showLocked ? 'Hide' : 'Show'} Locked ({lockedCount})
          </Button>
        </div>

        {/* Subject count */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Badge variant="outline" className="text-xs">{availableCount} available</Badge>
          <Badge variant="outline" className="text-xs text-slate-400">{lockedCount} locked</Badge>
          <span className="flex-1" />
          {selectedSubjectIds.length > 0 && (
            <button
              onClick={onClearSelection}
              className="text-xs text-red-500 hover:text-red-600 underline underline-offset-2"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Subject grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No subjects match your filters.</p>
            {!showLocked && lockedCount > 0 && (
              <button
                onClick={() => setShowLocked(true)}
                className="text-sm text-[var(--color-primary)] hover:underline mt-2"
              >
                Show {lockedCount} locked subject(s)
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isSelected={selectedSubjectIds.includes(subject.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={selectedSubjectIds.length === 0 || computation.isOverload}
            className="flex-1"
          >
            Review Summary
            {selectedSubjectIds.length > 0 && (
              <span className="ml-1.5 text-xs opacity-80">({selectedSubjectIds.length})</span>
            )}
          </Button>
        </div>
      </div>

      {/* Sticky sidebar */}
      <div className="lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-6 bg-white border border-slate-200 rounded-2xl overflow-hidden h-[calc(100vh-12rem)] flex flex-col">
          <StickyEnrollmentSummary
            selectedSubjects={selectedSubjects}
            computation={computation}
            onRemove={onToggle}
            onContinue={onNext}
            continueLabel="Review Summary"
          />
        </div>
      </div>
    </div>
  );
}
