import type { EvalQuestion } from '../../types/evaluation';

export const evalQuestions: EvalQuestion[] = [
  // ── Teaching Effectiveness ──────────────────────────────────────────────────
  { id: 'q-teach-1', categoryId: 'cat-teach', order: 1, type: 'rating', required: true,
    text: 'The instructor explains concepts clearly and in an understandable manner.' },
  { id: 'q-teach-2', categoryId: 'cat-teach', order: 2, type: 'rating', required: true,
    text: 'The instructor uses appropriate and effective teaching methods for the subject.' },
  { id: 'q-teach-3', categoryId: 'cat-teach', order: 3, type: 'rating', required: true,
    text: 'The instructor provides relevant real-world examples and practical applications.' },
  { id: 'q-teach-c', categoryId: 'cat-teach', order: 4, type: 'textarea', required: false,
    text: 'Additional comments on Teaching Effectiveness (optional).' },

  // ── Communication ───────────────────────────────────────────────────────────
  { id: 'q-comm-1', categoryId: 'cat-comm', order: 1, type: 'rating', required: true,
    text: 'The instructor communicates lesson objectives and expectations clearly.' },
  { id: 'q-comm-2', categoryId: 'cat-comm', order: 2, type: 'rating', required: true,
    text: 'The instructor is approachable and receptive to student questions.' },
  { id: 'q-comm-3', categoryId: 'cat-comm', order: 3, type: 'rating', required: true,
    text: 'The instructor provides timely and constructive feedback on student work.' },
  { id: 'q-comm-c', categoryId: 'cat-comm', order: 4, type: 'textarea', required: false,
    text: 'Additional comments on Communication (optional).' },

  // ── Class Management ────────────────────────────────────────────────────────
  { id: 'q-mgmt-1', categoryId: 'cat-mgmt', order: 1, type: 'rating', required: true,
    text: 'The instructor manages class time efficiently and adheres to the schedule.' },
  { id: 'q-mgmt-2', categoryId: 'cat-mgmt', order: 2, type: 'rating', required: true,
    text: 'The instructor maintains an organized and structured learning environment.' },
  { id: 'q-mgmt-3', categoryId: 'cat-mgmt', order: 3, type: 'rating', required: true,
    text: 'The instructor ensures active student participation and on-task behavior.' },
  { id: 'q-mgmt-c', categoryId: 'cat-mgmt', order: 4, type: 'textarea', required: false,
    text: 'Additional comments on Class Management (optional).' },

  // ── Professionalism ─────────────────────────────────────────────────────────
  { id: 'q-prof-1', categoryId: 'cat-prof', order: 1, type: 'rating', required: true,
    text: 'The instructor demonstrates in-depth mastery of the subject matter.' },
  { id: 'q-prof-2', categoryId: 'cat-prof', order: 2, type: 'rating', required: true,
    text: 'The instructor is consistently punctual and prepared for each class session.' },
  { id: 'q-prof-3', categoryId: 'cat-prof', order: 3, type: 'rating', required: true,
    text: 'The instructor maintains professional conduct and fair treatment of all students.' },
  { id: 'q-prof-c', categoryId: 'cat-prof', order: 4, type: 'textarea', required: false,
    text: 'Additional comments on Professionalism (optional).' },

  // ── Engagement & Motivation ─────────────────────────────────────────────────
  { id: 'q-engage-1', categoryId: 'cat-engage', order: 1, type: 'rating', required: true,
    text: 'The instructor motivates students to actively engage with the course material.' },
  { id: 'q-engage-2', categoryId: 'cat-engage', order: 2, type: 'rating', required: true,
    text: 'The instructor fosters a positive, inclusive, and supportive classroom environment.' },
  { id: 'q-engage-3', categoryId: 'cat-engage', order: 3, type: 'rating', required: true,
    text: 'Overall, I am satisfied with this instructor\'s teaching performance.' },
  { id: 'q-engage-c', categoryId: 'cat-engage', order: 4, type: 'textarea', required: false,
    text: 'Additional comments on Engagement & Motivation (optional).' },
];

export const getQuestionsByCategory = (categoryId: string) =>
  evalQuestions.filter((q) => q.categoryId === categoryId);

export const getRatingQuestions = () =>
  evalQuestions.filter((q) => q.type === 'rating' && q.required);
