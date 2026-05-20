import type { TuitionRate } from '../../types/enrollment';

export const tuitionRates: TuitionRate[] = [
  {
    courseId: 'bscs',
    perLecUnit: 850,
    perLabUnit: 1200,
    miscFees: [
      { name: 'Registration Fee',       amount: 500 },
      { name: 'Library Fee',             amount: 350 },
      { name: 'Computer Lab Fee',        amount: 800 },
      { name: 'Student Development Fee', amount: 250 },
      { name: 'Medical & Dental Fee',    amount: 200 },
      { name: 'Athletics Fee',           amount: 150 },
      { name: 'Student Publication Fee', amount: 100 },
    ],
  },
  {
    courseId: 'bsit',
    perLecUnit: 800,
    perLabUnit: 1150,
    miscFees: [
      { name: 'Registration Fee',       amount: 500 },
      { name: 'Library Fee',             amount: 350 },
      { name: 'Computer Lab Fee',        amount: 750 },
      { name: 'Student Development Fee', amount: 250 },
      { name: 'Medical & Dental Fee',    amount: 200 },
      { name: 'Athletics Fee',           amount: 150 },
      { name: 'Student Publication Fee', amount: 100 },
    ],
  },
  {
    courseId: 'bsis',
    perLecUnit: 800,
    perLabUnit: 1150,
    miscFees: [
      { name: 'Registration Fee',       amount: 500 },
      { name: 'Library Fee',             amount: 350 },
      { name: 'Computer Lab Fee',        amount: 750 },
      { name: 'Student Development Fee', amount: 250 },
      { name: 'Medical & Dental Fee',    amount: 200 },
      { name: 'Athletics Fee',           amount: 150 },
      { name: 'Student Publication Fee', amount: 100 },
    ],
  },
  {
    courseId: 'bsme',
    perLecUnit: 950,
    perLabUnit: 1400,
    miscFees: [
      { name: 'Registration Fee',       amount: 500 },
      { name: 'Library Fee',             amount: 350 },
      { name: 'Engineering Lab Fee',     amount: 1200 },
      { name: 'Student Development Fee', amount: 250 },
      { name: 'Medical & Dental Fee',    amount: 200 },
      { name: 'Athletics Fee',           amount: 150 },
      { name: 'Student Publication Fee', amount: 100 },
    ],
  },
  {
    courseId: 'bsce',
    perLecUnit: 950,
    perLabUnit: 1400,
    miscFees: [
      { name: 'Registration Fee',       amount: 500 },
      { name: 'Library Fee',             amount: 350 },
      { name: 'Engineering Lab Fee',     amount: 1200 },
      { name: 'Student Development Fee', amount: 250 },
      { name: 'Medical & Dental Fee',    amount: 200 },
      { name: 'Athletics Fee',           amount: 150 },
      { name: 'Student Publication Fee', amount: 100 },
    ],
  },
];

export const getTuitionRateForCourse = (courseId: string): TuitionRate | undefined =>
  tuitionRates.find((r) => r.courseId === courseId);
