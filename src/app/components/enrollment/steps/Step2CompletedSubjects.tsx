import { useState, useMemo } from 'react';
import { CheckSquare, Square, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/components/ui/utils';
import type { YearLevel, Semester, Subject } from '@/lib/types/enrollment';
import { getCurriculumForCourse, getPreviousCurriculumEntries } from '@/lib/data/enrollment/curriculum';
import { getSubjectById } from '@/lib/data/enrollment/subjects';
import { getCompletedSubjectsForStudent } from '@/lib/data/enrollment/completed-subjects';

interface SubjectRowProps {
  subject: Subject;
  isChecked: boolean;
  originalGrade?: number;
  originalPassed?: boolean;
  onToggle: (id: string) => void;
}

function SubjectRow({ subject, isChecked, originalGrade, originalPassed, onToggle }: SubjectRowProps) {
  return (
    <div
      onClick={() => onToggle(subject.id)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
        isChecked
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-slate-200 bg-white hover:border-slate-300',
      )}
    >
      <div className="shrink-0">
        {isChecked
          ? <CheckSquare className="w-5 h-5 text-emerald-500" />
          : <Square className="w-5 h-5 text-slate-300" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">{subject.code}</span>
          {originalPassed !== undefined && (
            originalPassed
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              : <XCircle className="w-3.5 h-3.5 text-red-400" />
          )}
        </div>
        <p className="text-sm font-medium text-slate-700 truncate">{subject.title}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {originalGrade !== undefined && (
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            originalPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
          )}>
            {originalGrade}
          </span>
        )}
        <span className="text-xs text-slate-400">{subject.units}u</span>
      </div>
    </div>
  );
}

interface Step2Props {
  studentId: string;
  courseId: string;
  yearLevel: YearLevel;
  semester: Semester;
  completedSubjectIds: string[];
  onToggle: (id: string) => void;
  onSetAll: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2CompletedSubjects({
  studentId,
  courseId,
  yearLevel,
  semester,
  completedSubjectIds,
  onToggle,
  onSetAll,
  onNext,
  onBack,
}: Step2Props) {
  const [search, setSearch] = useState('');

  const previousEntries = useMemo(
    () => getPreviousCurriculumEntries(courseId, yearLevel, semester),
    [courseId, yearLevel, semester],
  );

  const historicalRecords = useMemo(
    () => getCompletedSubjectsForStudent(studentId),
    [studentId],
  );

  // Group entries by year/semester
  const grouped = useMemo(() => {
    const map = new Map<string, { yearLevel: YearLevel; semester: Semester; subjects: Subject[] }>();
    for (const entry of previousEntries) {
      const key = `${entry.yearLevel}-${entry.semester}`;
      if (!map.has(key)) {
        map.set(key, { yearLevel: entry.yearLevel, semester: entry.semester, subjects: [] });
      }
      const subject = getSubjectById(entry.subjectId);
      if (subject) map.get(key)!.subjects.push(subject);
    }
    return Array.from(map.values()).sort(
      (a, b) => a.yearLevel - b.yearLevel || (a.semester === '1st' ? -1 : 1),
    );
  }, [previousEntries]);

  const allSubjectIds = previousEntries.map((e) => e.subjectId);
  const allSelected = allSubjectIds.every((id) => completedSubjectIds.includes(id));

  const toggleAll = () => {
    if (allSelected) {
      onSetAll(completedSubjectIds.filter((id) => !allSubjectIds.includes(id)));
    } else {
      onSetAll([...new Set([...completedSubjectIds, ...allSubjectIds])]);
    }
  };

  const selectPassed = () => {
    const passedIds = historicalRecords.filter((r) => r.passed).map((r) => r.subjectId);
    onSetAll([...new Set([...completedSubjectIds.filter((id) => !allSubjectIds.includes(id)), ...passedIds])]);
  };

  const yearLabel = (y: YearLevel) =>
    y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-semibold text-slate-800">Previous Academic History</h2>
        <p className="text-sm text-slate-500 mt-1">
          Mark all subjects you have previously completed. This determines which subjects you are eligible to enroll in.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={selectPassed}>
          <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />
          Select All Passed
        </Button>
        <Button variant="outline" size="sm" onClick={toggleAll}>
          {allSelected ? (
            <><Square className="w-4 h-4 mr-1.5" /> Deselect All</>
          ) : (
            <><CheckSquare className="w-4 h-4 mr-1.5" /> Select All</>
          )}
        </Button>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          {completedSubjectIds.length} completed
        </Badge>
        <span className="text-xs text-slate-400">of {allSubjectIds.length} previous subjects</span>
      </div>

      {/* Grouped subjects */}
      {grouped.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <p>No previous subjects found for this configuration.</p>
          <p className="text-sm mt-1">You may be a first-year student or no curriculum data exists for earlier semesters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => {
            const filtered = search
              ? group.subjects.filter(
                  (s) =>
                    s.title.toLowerCase().includes(search.toLowerCase()) ||
                    s.code.toLowerCase().includes(search.toLowerCase()),
                )
              : group.subjects;

            if (filtered.length === 0) return null;

            return (
              <div key={`${group.yearLevel}-${group.semester}`}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-slate-600">
                    {yearLabel(group.yearLevel)} Year &bull; {group.semester} Semester
                  </h3>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs text-slate-400">
                    {filtered.filter((s) => completedSubjectIds.includes(s.id)).length}/{filtered.length} done
                  </span>
                </div>
                <div className="space-y-2">
                  {filtered.map((subject) => {
                    const record = historicalRecords.find((r) => r.subjectId === subject.id);
                    return (
                      <SubjectRow
                        key={subject.id}
                        subject={subject}
                        isChecked={completedSubjectIds.includes(subject.id)}
                        originalGrade={record?.grade}
                        originalPassed={record?.passed}
                        onToggle={onToggle}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1 bg-[var(--color-primary)] hover:opacity-90 text-white">
          Continue to Subject Selection
        </Button>
      </div>
    </div>
  );
}
