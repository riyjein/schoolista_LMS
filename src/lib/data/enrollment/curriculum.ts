import type { CurriculumEntry, YearLevel, Semester } from '../../types/enrollment';

export const curriculum: CurriculumEntry[] = [
  // ── BSCS Year 1, Semester 1 ──────────────────────────────────────────────
  { id: 'cur-bscs-1-1-ite101',  courseId: 'bscs', subjectId: 'ite101',  yearLevel: 1, semester: '1st', isRequired: true },
  { id: 'cur-bscs-1-1-math111', courseId: 'bscs', subjectId: 'math111', yearLevel: 1, semester: '1st', isRequired: true },
  { id: 'cur-bscs-1-1-eng111',  courseId: 'bscs', subjectId: 'eng111',  yearLevel: 1, semester: '1st', isRequired: true },
  { id: 'cur-bscs-1-1-pe101',   courseId: 'bscs', subjectId: 'pe101',   yearLevel: 1, semester: '1st', isRequired: true },
  { id: 'cur-bscs-1-1-nstp101', courseId: 'bscs', subjectId: 'nstp101', yearLevel: 1, semester: '1st', isRequired: true },
  { id: 'cur-bscs-1-1-huma111', courseId: 'bscs', subjectId: 'huma111', yearLevel: 1, semester: '1st', isRequired: true },

  // ── BSCS Year 1, Semester 2 ──────────────────────────────────────────────
  { id: 'cur-bscs-1-2-cs111',   courseId: 'bscs', subjectId: 'cs111',   yearLevel: 1, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-1-2-math121', courseId: 'bscs', subjectId: 'math121', yearLevel: 1, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-1-2-eng121',  courseId: 'bscs', subjectId: 'eng121',  yearLevel: 1, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-1-2-pe102',   courseId: 'bscs', subjectId: 'pe102',   yearLevel: 1, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-1-2-nstp102', courseId: 'bscs', subjectId: 'nstp102', yearLevel: 1, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-1-2-sci111',  courseId: 'bscs', subjectId: 'sci111',  yearLevel: 1, semester: '2nd', isRequired: true },

  // ── BSCS Year 2, Semester 1 ──────────────────────────────────────────────
  { id: 'cur-bscs-2-1-cs211',   courseId: 'bscs', subjectId: 'cs211',   yearLevel: 2, semester: '1st', isRequired: true },
  { id: 'cur-bscs-2-1-cs221',   courseId: 'bscs', subjectId: 'cs221',   yearLevel: 2, semester: '1st', isRequired: true },
  { id: 'cur-bscs-2-1-cs231',   courseId: 'bscs', subjectId: 'cs231',   yearLevel: 2, semester: '1st', isRequired: true },
  { id: 'cur-bscs-2-1-math211', courseId: 'bscs', subjectId: 'math211', yearLevel: 2, semester: '1st', isRequired: true },
  { id: 'cur-bscs-2-1-pe201',   courseId: 'bscs', subjectId: 'pe201',   yearLevel: 2, semester: '1st', isRequired: true },
  { id: 'cur-bscs-2-1-eng211',  courseId: 'bscs', subjectId: 'eng211',  yearLevel: 2, semester: '1st', isRequired: true },

  // ── BSCS Year 2, Semester 2 ──────────────────────────────────────────────
  { id: 'cur-bscs-2-2-cs212',   courseId: 'bscs', subjectId: 'cs212',   yearLevel: 2, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-2-2-cs222',   courseId: 'bscs', subjectId: 'cs222',   yearLevel: 2, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-2-2-cs232',   courseId: 'bscs', subjectId: 'cs232',   yearLevel: 2, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-2-2-math221', courseId: 'bscs', subjectId: 'math221', yearLevel: 2, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-2-2-pe202',   courseId: 'bscs', subjectId: 'pe202',   yearLevel: 2, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-2-2-sts201',  courseId: 'bscs', subjectId: 'sts201',  yearLevel: 2, semester: '2nd', isRequired: true },

  // ── BSCS Year 3, Semester 1 ──────────────────────────────────────────────
  { id: 'cur-bscs-3-1-cs311',   courseId: 'bscs', subjectId: 'cs311',   yearLevel: 3, semester: '1st', isRequired: true },
  { id: 'cur-bscs-3-1-cs321',   courseId: 'bscs', subjectId: 'cs321',   yearLevel: 3, semester: '1st', isRequired: true },
  { id: 'cur-bscs-3-1-cs331',   courseId: 'bscs', subjectId: 'cs331',   yearLevel: 3, semester: '1st', isRequired: true },
  { id: 'cur-bscs-3-1-cs341',   courseId: 'bscs', subjectId: 'cs341',   yearLevel: 3, semester: '1st', isRequired: true },
  { id: 'cur-bscs-3-1-cs351',   courseId: 'bscs', subjectId: 'cs351',   yearLevel: 3, semester: '1st', isRequired: true },
  { id: 'cur-bscs-3-1-stat301', courseId: 'bscs', subjectId: 'stat301', yearLevel: 3, semester: '1st', isRequired: true },

  // ── BSCS Year 3, Semester 2 ──────────────────────────────────────────────
  { id: 'cur-bscs-3-2-cs312',   courseId: 'bscs', subjectId: 'cs312',   yearLevel: 3, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-3-2-cs322',   courseId: 'bscs', subjectId: 'cs322',   yearLevel: 3, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-3-2-cs332',   courseId: 'bscs', subjectId: 'cs332',   yearLevel: 3, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-3-2-cs342',   courseId: 'bscs', subjectId: 'cs342',   yearLevel: 3, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-3-2-cs361',   courseId: 'bscs', subjectId: 'cs361',   yearLevel: 3, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-3-2-sosc301', courseId: 'bscs', subjectId: 'sosc301', yearLevel: 3, semester: '2nd', isRequired: true },

  // ── BSCS Year 4, Semester 1 ──────────────────────────────────────────────
  { id: 'cur-bscs-4-1-cs411',   courseId: 'bscs', subjectId: 'cs411',   yearLevel: 4, semester: '1st', isRequired: true },
  { id: 'cur-bscs-4-1-cs421',   courseId: 'bscs', subjectId: 'cs421',   yearLevel: 4, semester: '1st', isRequired: true },
  { id: 'cur-bscs-4-1-cs431',   courseId: 'bscs', subjectId: 'cs431',   yearLevel: 4, semester: '1st', isRequired: true },
  { id: 'cur-bscs-4-1-cs441',   courseId: 'bscs', subjectId: 'cs441',   yearLevel: 4, semester: '1st', isRequired: true },
  { id: 'cur-bscs-4-1-cs451',   courseId: 'bscs', subjectId: 'cs451',   yearLevel: 4, semester: '1st', isRequired: false },
  { id: 'cur-bscs-4-1-cs461',   courseId: 'bscs', subjectId: 'cs461',   yearLevel: 4, semester: '1st', isRequired: false },

  // ── BSCS Year 4, Semester 2 ──────────────────────────────────────────────
  { id: 'cur-bscs-4-2-cs412',   courseId: 'bscs', subjectId: 'cs412',   yearLevel: 4, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-4-2-cs422',   courseId: 'bscs', subjectId: 'cs422',   yearLevel: 4, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-4-2-cs432',   courseId: 'bscs', subjectId: 'cs432',   yearLevel: 4, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-4-2-cs442',   courseId: 'bscs', subjectId: 'cs442',   yearLevel: 4, semester: '2nd', isRequired: true },
  { id: 'cur-bscs-4-2-cs452',   courseId: 'bscs', subjectId: 'cs452',   yearLevel: 4, semester: '2nd', isRequired: false },
];

export const getCurriculumForCourse = (
  courseId: string,
  yearLevel?: YearLevel,
  semester?: Semester,
): CurriculumEntry[] =>
  curriculum.filter(
    (c) =>
      c.courseId === courseId &&
      (yearLevel === undefined || c.yearLevel === yearLevel) &&
      (semester === undefined || c.semester === semester),
  );

export const getPreviousCurriculumEntries = (
  courseId: string,
  upToYear: YearLevel,
  upToSemester: Semester,
): CurriculumEntry[] => {
  const semesterOrder: Record<Semester, number> = { '1st': 1, '2nd': 2, Summer: 3 };
  return curriculum.filter((c) => {
    if (c.courseId !== courseId) return false;
    if (c.yearLevel < upToYear) return true;
    if (c.yearLevel === upToYear && semesterOrder[c.semester] < semesterOrder[upToSemester]) return true;
    return false;
  });
};
