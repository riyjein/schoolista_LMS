import type { EvalRecord, EvalAnswer } from '../../types/evaluation';

function ans(
  ratingMap: Record<string, number>,
  commentMap: Record<string, string> = {},
): EvalAnswer[] {
  return [
    ...Object.entries(ratingMap).map(([questionId, rating]) => ({ questionId, rating })),
    ...Object.entries(commentMap).map(([questionId, comment]) => ({ questionId, comment })),
  ];
}

// ── Pre-seeded submitted evaluations ────────────────────────────────────────
// student-2 (Jose Reyes): evaluated all 5 classes
// student-3 (Ana Dela Cruz): evaluated class-1 through class-4
// student-1 (Maria Santos): has a draft for class-1 only

export const evalRecords: EvalRecord[] = [

  // ── student-2 × class-1 (inst-1, CS211) — submitted ───────────────────────
  {
    id: 'eval-c1-s2',
    studentId: 'student-2', classId: 'class-1', instructorId: 'inst-1',
    subjectId: 'cs211', sectionCode: 'BSCS-2A', semester: '1st', schoolYear: '2024-2025',
    status: 'submitted', submittedAt: '2024-10-20T09:00:00',
    answers: ans(
      { 'q-teach-1': 5, 'q-teach-2': 5, 'q-teach-3': 4,
        'q-comm-1': 5, 'q-comm-2': 4, 'q-comm-3': 5,
        'q-mgmt-1': 4, 'q-mgmt-2': 5, 'q-mgmt-3': 4,
        'q-prof-1': 5, 'q-prof-2': 5, 'q-prof-3': 5,
        'q-engage-1': 5, 'q-engage-2': 4, 'q-engage-3': 5 },
      { 'q-engage-c': 'Prof. Cruz is an excellent teacher who really cares about student success!' },
    ),
  },

  // ── student-3 × class-1 (inst-1, CS211) — submitted ───────────────────────
  {
    id: 'eval-c1-s3',
    studentId: 'student-3', classId: 'class-1', instructorId: 'inst-1',
    subjectId: 'cs211', sectionCode: 'BSCS-2A', semester: '1st', schoolYear: '2024-2025',
    status: 'submitted', submittedAt: '2024-10-21T10:00:00',
    answers: ans(
      { 'q-teach-1': 4, 'q-teach-2': 3, 'q-teach-3': 4,
        'q-comm-1': 3, 'q-comm-2': 4, 'q-comm-3': 3,
        'q-mgmt-1': 4, 'q-mgmt-2': 3, 'q-mgmt-3': 4,
        'q-prof-1': 4, 'q-prof-2': 4, 'q-prof-3': 4,
        'q-engage-1': 3, 'q-engage-2': 3, 'q-engage-3': 4 },
      { 'q-teach-c': 'Could slow down when explaining complex topics.' },
    ),
  },

  // ── student-2 × class-2 (inst-2, CS221) — submitted ──────────────────────
  {
    id: 'eval-c2-s2',
    studentId: 'student-2', classId: 'class-2', instructorId: 'inst-2',
    subjectId: 'cs221', sectionCode: 'BSCS-2A', semester: '1st', schoolYear: '2024-2025',
    status: 'submitted', submittedAt: '2024-10-20T09:30:00',
    answers: ans({
      'q-teach-1': 4, 'q-teach-2': 4, 'q-teach-3': 5,
      'q-comm-1': 4, 'q-comm-2': 5, 'q-comm-3': 4,
      'q-mgmt-1': 5, 'q-mgmt-2': 4, 'q-mgmt-3': 4,
      'q-prof-1': 4, 'q-prof-2': 4, 'q-prof-3': 5,
      'q-engage-1': 4, 'q-engage-2': 5, 'q-engage-3': 4,
    }),
  },

  // ── student-3 × class-2 (inst-2, CS221) — submitted ──────────────────────
  {
    id: 'eval-c2-s3',
    studentId: 'student-3', classId: 'class-2', instructorId: 'inst-2',
    subjectId: 'cs221', sectionCode: 'BSCS-2A', semester: '1st', schoolYear: '2024-2025',
    status: 'submitted', submittedAt: '2024-10-21T11:00:00',
    answers: ans({
      'q-teach-1': 4, 'q-teach-2': 3, 'q-teach-3': 4,
      'q-comm-1': 4, 'q-comm-2': 4, 'q-comm-3': 3,
      'q-mgmt-1': 3, 'q-mgmt-2': 4, 'q-mgmt-3': 3,
      'q-prof-1': 4, 'q-prof-2': 3, 'q-prof-3': 4,
      'q-engage-1': 3, 'q-engage-2': 4, 'q-engage-3': 4,
    }),
  },

  // ── student-2 × class-3 (inst-3, CS231) — submitted ──────────────────────
  {
    id: 'eval-c3-s2',
    studentId: 'student-2', classId: 'class-3', instructorId: 'inst-3',
    subjectId: 'cs231', sectionCode: 'BSCS-2A', semester: '1st', schoolYear: '2024-2025',
    status: 'submitted', submittedAt: '2024-10-20T10:00:00',
    answers: ans({
      'q-teach-1': 5, 'q-teach-2': 4, 'q-teach-3': 5,
      'q-comm-1': 4, 'q-comm-2': 4, 'q-comm-3': 4,
      'q-mgmt-1': 4, 'q-mgmt-2': 4, 'q-mgmt-3': 5,
      'q-prof-1': 5, 'q-prof-2': 5, 'q-prof-3': 4,
      'q-engage-1': 5, 'q-engage-2': 4, 'q-engage-3': 4,
    }),
  },

  // ── student-3 × class-3 (inst-3, CS231) — submitted ──────────────────────
  {
    id: 'eval-c3-s3',
    studentId: 'student-3', classId: 'class-3', instructorId: 'inst-3',
    subjectId: 'cs231', sectionCode: 'BSCS-2A', semester: '1st', schoolYear: '2024-2025',
    status: 'submitted', submittedAt: '2024-10-21T12:00:00',
    answers: ans({
      'q-teach-1': 4, 'q-teach-2': 4, 'q-teach-3': 3,
      'q-comm-1': 3, 'q-comm-2': 3, 'q-comm-3': 4,
      'q-mgmt-1': 4, 'q-mgmt-2': 3, 'q-mgmt-3': 4,
      'q-prof-1': 4, 'q-prof-2': 4, 'q-prof-3': 3,
      'q-engage-1': 3, 'q-engage-2': 4, 'q-engage-3': 3,
    }),
  },

  // ── student-2 × class-4 (inst-4, PE201) — submitted ──────────────────────
  {
    id: 'eval-c4-s2',
    studentId: 'student-2', classId: 'class-4', instructorId: 'inst-4',
    subjectId: 'pe201', sectionCode: 'PE-2024-A', semester: '1st', schoolYear: '2024-2025',
    status: 'submitted', submittedAt: '2024-10-20T11:00:00',
    answers: ans(
      { 'q-teach-1': 4, 'q-teach-2': 4, 'q-teach-3': 4,
        'q-comm-1': 5, 'q-comm-2': 4, 'q-comm-3': 4,
        'q-mgmt-1': 5, 'q-mgmt-2': 5, 'q-mgmt-3': 5,
        'q-prof-1': 4, 'q-prof-2': 5, 'q-prof-3': 5,
        'q-engage-1': 5, 'q-engage-2': 5, 'q-engage-3': 5 },
      { 'q-engage-c': 'Coach Bautista makes PE really fun and engaging!' },
    ),
  },

  // ── student-3 × class-4 (inst-4, PE201) — submitted ──────────────────────
  {
    id: 'eval-c4-s3',
    studentId: 'student-3', classId: 'class-4', instructorId: 'inst-4',
    subjectId: 'pe201', sectionCode: 'PE-2024-A', semester: '1st', schoolYear: '2024-2025',
    status: 'submitted', submittedAt: '2024-10-21T13:00:00',
    answers: ans({
      'q-teach-1': 3, 'q-teach-2': 4, 'q-teach-3': 3,
      'q-comm-1': 4, 'q-comm-2': 3, 'q-comm-3': 4,
      'q-mgmt-1': 4, 'q-mgmt-2': 4, 'q-mgmt-3': 5,
      'q-prof-1': 4, 'q-prof-2': 4, 'q-prof-3': 4,
      'q-engage-1': 5, 'q-engage-2': 4, 'q-engage-3': 4,
    }),
  },

  // ── student-2 × class-5 (inst-2, ENG211) — submitted ─────────────────────
  {
    id: 'eval-c5-s2',
    studentId: 'student-2', classId: 'class-5', instructorId: 'inst-2',
    subjectId: 'eng211', sectionCode: 'BSCS-2A', semester: '1st', schoolYear: '2024-2025',
    status: 'submitted', submittedAt: '2024-10-20T12:00:00',
    answers: ans(
      { 'q-teach-1': 5, 'q-teach-2': 5, 'q-teach-3': 5,
        'q-comm-1': 5, 'q-comm-2': 5, 'q-comm-3': 4,
        'q-mgmt-1': 4, 'q-mgmt-2': 5, 'q-mgmt-3': 5,
        'q-prof-1': 5, 'q-prof-2': 4, 'q-prof-3': 5,
        'q-engage-1': 4, 'q-engage-2': 5, 'q-engage-3': 5 },
      { 'q-comm-c': 'Dr. Reyes gives very clear writing instructions and helpful comments.' },
    ),
  },

  // ── student-1 × class-1 (inst-1, CS211) — DRAFT (partially filled) ────────
  {
    id: 'eval-c1-s1-draft',
    studentId: 'student-1', classId: 'class-1', instructorId: 'inst-1',
    subjectId: 'cs211', sectionCode: 'BSCS-2A', semester: '1st', schoolYear: '2024-2025',
    status: 'draft',
    answers: ans({ 'q-teach-1': 4, 'q-teach-2': 4, 'q-teach-3': 5, 'q-comm-1': 5, 'q-comm-2': 4 }),
  },
];

export const getEvalRecord = (studentId: string, classId: string): EvalRecord | undefined =>
  evalRecords.find((r) => r.studentId === studentId && r.classId === classId);

export const getEvalsByInstructor = (instructorId: string): EvalRecord[] =>
  evalRecords.filter((r) => r.instructorId === instructorId && r.status === 'submitted');

export const getEvalsByStudent = (studentId: string): EvalRecord[] =>
  evalRecords.filter((r) => r.studentId === studentId);

export const addEvalRecord = (record: EvalRecord): void => {
  evalRecords.push(record);
};

export const updateEvalRecord = (id: string, updates: Partial<EvalRecord>): void => {
  const idx = evalRecords.findIndex((r) => r.id === id);
  if (idx !== -1) Object.assign(evalRecords[idx], updates);
};
