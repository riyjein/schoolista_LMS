import { useState, useCallback, useMemo } from 'react';
import type { EvalAnswer } from '../../types/evaluation';
import { evalQuestions, getRatingQuestions } from '../../data/evaluation/eval-questions';
import { evalCategories } from '../../data/evaluation/eval-settings';

type AnswerMap = Record<string, number | string>;

function answersToMap(answers: EvalAnswer[]): AnswerMap {
  const map: AnswerMap = {};
  for (const a of answers) {
    if (a.rating !== undefined) map[a.questionId] = a.rating;
    if (a.comment !== undefined) map[a.questionId] = a.comment;
  }
  return map;
}

function mapToAnswers(map: AnswerMap): EvalAnswer[] {
  return Object.entries(map).map(([questionId, value]) =>
    typeof value === 'number'
      ? { questionId, rating: value }
      : { questionId, comment: value as string },
  );
}

export interface UseEvaluationFormReturn {
  answers: AnswerMap;
  setRating: (questionId: string, value: number) => void;
  setComment: (questionId: string, value: string) => void;
  getAnswer: (questionId: string) => number | string | undefined;
  toAnswers: () => EvalAnswer[];
  answeredCount: number;
  requiredCount: number;
  progressPercent: number;
  isComplete: boolean;
  isDirty: boolean;
  reset: () => void;
  categoryProgress: { categoryId: string; label: string; answered: number; total: number }[];
}

export function useEvaluationForm(initialAnswers: EvalAnswer[] = []): UseEvaluationFormReturn {
  const [answers, setAnswers] = useState<AnswerMap>(() => answersToMap(initialAnswers));
  const [isDirty, setIsDirty] = useState(false);

  const setRating = useCallback((questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setIsDirty(true);
  }, []);

  const setComment = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setIsDirty(true);
  }, []);

  const getAnswer = useCallback(
    (questionId: string): number | string | undefined => answers[questionId],
    [answers],
  );

  const toAnswers = useCallback(() => mapToAnswers(answers), [answers]);

  const requiredQuestions = useMemo(() => getRatingQuestions(), []);

  const answeredCount = useMemo(
    () => requiredQuestions.filter((q) => answers[q.id] !== undefined).length,
    [answers, requiredQuestions],
  );

  const requiredCount = requiredQuestions.length;
  const progressPercent = requiredCount > 0 ? Math.round((answeredCount / requiredCount) * 100) : 0;
  const isComplete = answeredCount === requiredCount;

  const categoryProgress = useMemo(() =>
    evalCategories.map((cat) => {
      const catRequired = evalQuestions.filter((q) => q.categoryId === cat.id && q.type === 'rating' && q.required);
      const answered = catRequired.filter((q) => answers[q.id] !== undefined).length;
      return { categoryId: cat.id, label: cat.label, answered, total: catRequired.length };
    }), [answers]);

  const reset = useCallback(() => {
    setAnswers(answersToMap(initialAnswers));
    setIsDirty(false);
  }, [initialAnswers]);

  return {
    answers, setRating, setComment, getAnswer, toAnswers,
    answeredCount, requiredCount, progressPercent, isComplete, isDirty, reset,
    categoryProgress,
  };
}
