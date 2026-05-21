import type { Prerequisite } from "../../types/enrollment";

export const prerequisites: Prerequisite[] = [];

export const getPrerequisitesForSubject = (subjectId: string): string[] =>
  prerequisites
    .filter((p) => p.subjectId === subjectId)
    .map((p) => p.requiresSubjectId);

export const getAllPrerequisiteChain = (subjectId: string): string[] => {
  const visited = new Set<string>();
  const queue = [subjectId];
  const result: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const directPrereqs = getPrerequisitesForSubject(current);
    for (const prereqId of directPrereqs) {
      if (!visited.has(prereqId)) {
        visited.add(prereqId);
        result.push(prereqId);
        queue.push(prereqId);
      }
    }
  }

  return result;
};
