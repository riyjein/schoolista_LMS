import type { Subject } from '../../types/enrollment';

export const subjects: Subject[] = [];

export const getSubjectById = (id: string): Subject | undefined =>
  subjects.find((s) => s.id === id);

export const getSubjectsByIds = (ids: string[]): Subject[] =>
  subjects.filter((s) => ids.includes(s.id));


