import type { EvalCategory, EvalSettings } from '../../types/evaluation';

export const evalSettings: EvalSettings = {
  ratingScale: 5,
  ratingLabels: { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' },
  minLabel: 'Poor',
  maxLabel: 'Excellent',
};

export const evalCategories: EvalCategory[] = [
  {
    id: 'cat-teach',
    label: 'Teaching Effectiveness',
    description: 'How well the instructor delivers course content and facilitates learning.',
    weight: 0.30,
    color: 'bg-blue-500',
  },
  {
    id: 'cat-comm',
    label: 'Communication',
    description: 'Clarity of instruction, feedback quality, and approachability.',
    weight: 0.20,
    color: 'bg-purple-500',
  },
  {
    id: 'cat-mgmt',
    label: 'Class Management',
    description: 'Organization, pacing, and control of the classroom environment.',
    weight: 0.20,
    color: 'bg-teal-500',
  },
  {
    id: 'cat-prof',
    label: 'Professionalism',
    description: 'Subject mastery, punctuality, fairness, and professional conduct.',
    weight: 0.15,
    color: 'bg-orange-500',
  },
  {
    id: 'cat-engage',
    label: 'Engagement & Motivation',
    description: 'Ability to inspire student participation and foster a positive atmosphere.',
    weight: 0.15,
    color: 'bg-rose-500',
  },
];
