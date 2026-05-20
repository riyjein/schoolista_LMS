import { useMemo } from 'react';
import type { EnrichedSubject, EnrollmentStrategy, YearLevel, Semester } from '../types/enrollment';
import { MAX_UNITS } from '../types/enrollment';
import { getCurriculumForCourse } from '../data/enrollment/curriculum';
import { getSubjectById } from '../data/enrollment/subjects';
import { getPrerequisitesForSubject } from '../data/enrollment/prerequisites';

interface UseEnrollmentSuggestionsOptions {
  courseId: string;
  yearLevel: YearLevel;
  semester: Semester;
  completedSubjectIds: string[];
  strategy: EnrollmentStrategy;
  currentSelectedIds: string[];
}

export function useEnrollmentSuggestions({
  courseId,
  yearLevel,
  semester,
  completedSubjectIds,
  strategy,
  currentSelectedIds,
}: UseEnrollmentSuggestionsOptions) {
  const suggestions: EnrichedSubject[] = useMemo(() => {
    const entries = getCurriculumForCourse(courseId, yearLevel, semester);

    const candidates: EnrichedSubject[] = [];

    for (const entry of entries) {
      const subject = getSubjectById(entry.subjectId);
      if (!subject) continue;

      // Skip already completed
      if (completedSubjectIds.includes(subject.id)) continue;

      // Skip already selected
      if (currentSelectedIds.includes(subject.id)) continue;

      // Check prerequisites
      const prereqIds = getPrerequisitesForSubject(subject.id);
      const unmetPrereqs = prereqIds.filter((id) => !completedSubjectIds.includes(id));

      if (unmetPrereqs.length > 0) continue; // Skip locked

      const prereqs = prereqIds
        .map((id) => getSubjectById(id))
        .filter(Boolean) as typeof candidates[0]['prerequisites'];

      candidates.push({
        ...subject,
        status: 'available',
        prerequisites: prereqs,
        unmetPrerequisites: [],
        yearLevel: entry.yearLevel,
        semester: entry.semester,
        isRecommended: true,
      });
    }

    // Sort by strategy
    candidates.sort((a, b) => {
      if (strategy === 'major-priority') {
        if (a.type === 'major' && b.type !== 'major') return -1;
        if (a.type !== 'major' && b.type === 'major') return 1;
        return b.units - a.units;
      }
      if (strategy === 'minor-priority') {
        if (a.type === 'minor' && b.type !== 'minor') return -1;
        if (a.type !== 'minor' && b.type === 'minor') return 1;
        return b.units - a.units;
      }
      // balanced: alternate major/minor/GE, prioritize by units
      return b.units - a.units;
    });

    // Fill up to MAX_UNITS greedily
    const selected: EnrichedSubject[] = [];
    let totalUnits = currentSelectedIds.reduce((sum, id) => {
      const s = getSubjectById(id);
      return sum + (s?.units ?? 0);
    }, 0);

    for (const candidate of candidates) {
      if (totalUnits + candidate.units <= MAX_UNITS) {
        selected.push(candidate);
        totalUnits += candidate.units;
      }
    }

    return selected;
  }, [courseId, yearLevel, semester, completedSubjectIds, strategy, currentSelectedIds]);

  return { suggestions };
}
