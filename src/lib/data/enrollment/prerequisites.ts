import type { Prerequisite } from '../../types/enrollment';

export const prerequisites: Prerequisite[] = [
  // Programming chain
  { subjectId: 'cs111',  requiresSubjectId: 'ite101' },  // Programming 1 → Intro to Computing
  { subjectId: 'cs211',  requiresSubjectId: 'cs111' },   // Programming 2 → Programming 1
  { subjectId: 'cs212',  requiresSubjectId: 'cs211' },   // Data Structures → Programming 2
  { subjectId: 'cs222',  requiresSubjectId: 'cs211' },   // OOP → Programming 2
  { subjectId: 'cs361',  requiresSubjectId: 'cs212' },   // Programming Languages → Data Structures

  // Math chain
  { subjectId: 'math121', requiresSubjectId: 'math111' }, // Trigonometry → College Algebra
  { subjectId: 'math211', requiresSubjectId: 'math121' }, // Calculus 1 → Trigonometry
  { subjectId: 'math221', requiresSubjectId: 'math211' }, // Calculus 2 → Calculus 1

  // Systems chain
  { subjectId: 'cs231',  requiresSubjectId: 'ite101' },   // Computer Org → Intro to Computing
  { subjectId: 'cs232',  requiresSubjectId: 'cs231' },    // Digital Logic → Computer Org
  { subjectId: 'cs311',  requiresSubjectId: 'cs212' },    // Operating Systems → Data Structures
  { subjectId: 'cs312',  requiresSubjectId: 'cs311' },    // Systems Admin → Operating Systems
  { subjectId: 'cs422',  requiresSubjectId: 'cs332' },    // Systems Integration → SE 2

  // Database chain
  { subjectId: 'cs321',  requiresSubjectId: 'cs212' },    // DBMS → Data Structures
  { subjectId: 'cs322',  requiresSubjectId: 'cs321' },    // Adv DB Design → DBMS

  // Software Engineering chain
  { subjectId: 'cs331',  requiresSubjectId: 'cs222' },    // SE 1 → OOP
  { subjectId: 'cs332',  requiresSubjectId: 'cs331' },    // SE 2 → SE 1
  { subjectId: 'cs421',  requiresSubjectId: 'cs332' },    // Project Mgmt → SE 2

  // Networks chain
  { subjectId: 'cs341',  requiresSubjectId: 'cs231' },    // Computer Networks → Computer Org
  { subjectId: 'cs342',  requiresSubjectId: 'cs341' },    // Network Security → Computer Networks

  // Algorithms & AI chain
  { subjectId: 'cs351',  requiresSubjectId: 'cs212' },    // Analysis of Algo → Data Structures
  { subjectId: 'cs411',  requiresSubjectId: 'cs351' },    // AI → Analysis of Algo
  { subjectId: 'cs412',  requiresSubjectId: 'cs411' },    // Machine Learning → AI

  // Thesis chain
  { subjectId: 'cs441',  requiresSubjectId: 'cs331' },    // Thesis 1 → SE 1
  { subjectId: 'cs442',  requiresSubjectId: 'cs441' },    // Thesis 2 → Thesis 1

  // HCI
  { subjectId: 'cs431',  requiresSubjectId: 'cs222' },    // HCI → OOP

  // Discrete Math used later
  { subjectId: 'cs221',  requiresSubjectId: 'math111' },  // Discrete Math → College Algebra

  // NSTP sequential
  { subjectId: 'nstp102', requiresSubjectId: 'nstp101' }, // NSTP 2 → NSTP 1

  // PE sequential
  { subjectId: 'pe102', requiresSubjectId: 'pe101' },     // PE 2 → PE 1
  { subjectId: 'pe201', requiresSubjectId: 'pe102' },     // PE 3 → PE 2
  { subjectId: 'pe202', requiresSubjectId: 'pe201' },     // PE 4 → PE 3

  // English sequential
  { subjectId: 'eng121', requiresSubjectId: 'eng111' },   // Tech Writing 2 → Tech Writing 1

  // Stats
  { subjectId: 'stat301', requiresSubjectId: 'math221' }, // Statistics → Calculus 2
];

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
