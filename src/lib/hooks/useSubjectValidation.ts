import { useMemo } from 'react';
import type { EnrichedSubject, Subject, YearLevel, Semester } from '../types/enrollment';
import { getCurriculumForCourse } from '../data/enrollment/curriculum';
import { getSubjectById, subjects as allSubjects } from '../data/enrollment/subjects';
import { getPrerequisitesForSubject } from '../data/enrollment/prerequisites';
import { getAllEnrolledSubjectIds } from '../data/enrollment/enrollment-history';

interface UseSubjectValidationOptions {
  studentId: string;
  courseId: string;
  yearLevel: YearLevel;
  semester: Semester;
  completedSubjectIds: string[];
  selectedSubjectIds: string[];
}

export function useSubjectValidation({
  studentId,
  courseId,
  yearLevel,
  semester,
  completedSubjectIds,
  selectedSubjectIds,
}: UseSubjectValidationOptions) {
  const previouslyEnrolledIds = useMemo(
    () => getAllEnrolledSubjectIds(studentId),
    [studentId],
  );

  const curriculumEntries = useMemo(
    () => getCurriculumForCourse(courseId, yearLevel, semester),
    [courseId, yearLevel, semester],
  );

  const enrichedSubjects: EnrichedSubject[] = useMemo(() => {
    return curriculumEntries.map((entry) => {
      const subject = getSubjectById(entry.subjectId);
      if (!subject) return null;

      const prereqIds = getPrerequisitesForSubject(subject.id);
      const prereqs: Subject[] = prereqIds.map((id) => getSubjectById(id)).filter(Boolean) as Subject[];

      const unmetPrereqs = prereqs.filter((p) => !completedSubjectIds.includes(p.id));

      let status: EnrichedSubject['status'] = 'available';
      let lockReason: string | undefined;

      if (completedSubjectIds.includes(subject.id)) {
        status = 'completed';
        lockReason = 'You have already completed this subject.';
      } else if (previouslyEnrolledIds.includes(subject.id) && !completedSubjectIds.includes(subject.id)) {
        // Previously enrolled but not passed — available to retake
        status = 'available';
      } else if (selectedSubjectIds.includes(subject.id) && !completedSubjectIds.includes(subject.id)) {
        // Duplicate selection — already in cart
        status = 'available';
      } else if (unmetPrereqs.length > 0) {
        status = 'locked';
        const prereqTitles = unmetPrereqs.map((p) => `${p.code} – ${p.title}`).join(', ');
        lockReason = `Requires: ${prereqTitles}`;
      }

      return {
        ...subject,
        status,
        prerequisites: prereqs,
        unmetPrerequisites: unmetPrereqs,
        yearLevel: entry.yearLevel,
        semester: entry.semester,
        isRecommended: false,
        lockReason,
      } satisfies EnrichedSubject;
    }).filter(Boolean) as EnrichedSubject[];
  }, [curriculumEntries, completedSubjectIds, selectedSubjectIds, previouslyEnrolledIds]);

  const isDuplicate = (subjectId: string): boolean =>
    completedSubjectIds.includes(subjectId) || selectedSubjectIds.filter((id) => id === subjectId).length > 1;

  const canSelect = (subjectId: string): boolean => {
    const enriched = enrichedSubjects.find((s) => s.id === subjectId);
    if (!enriched) return false;
    return enriched.status === 'available' || enriched.status === 'failed';
  };

  const getSubjectStatus = (subjectId: string): EnrichedSubject['status'] => {
    const enriched = enrichedSubjects.find((s) => s.id === subjectId);
    return enriched?.status ?? 'available';
  };

  const getLockReason = (subjectId: string): string | undefined => {
    return enrichedSubjects.find((s) => s.id === subjectId)?.lockReason;
  };

  // Validate current selection for conflicts
  const validationErrors: string[] = useMemo(() => {
    const errors: string[] = [];
    for (const id of selectedSubjectIds) {
      const enriched = enrichedSubjects.find((s) => s.id === id);
      if (!enriched) continue;
      if (enriched.status === 'completed') {
        errors.push(`${enriched.code} is already completed and cannot be re-enrolled.`);
      }
      if (enriched.unmetPrerequisites.length > 0) {
        const missing = enriched.unmetPrerequisites.map((p) => p.code).join(', ');
        errors.push(`${enriched.code} requires: ${missing}`);
      }
    }
    return errors;
  }, [selectedSubjectIds, enrichedSubjects]);

  return {
    enrichedSubjects,
    validationErrors,
    isDuplicate,
    canSelect,
    getSubjectStatus,
    getLockReason,
  };
}
