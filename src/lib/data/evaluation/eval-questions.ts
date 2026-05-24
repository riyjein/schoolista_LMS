import type { EvalQuestion } from "../../types/evaluation";

export const evalQuestions: EvalQuestion[] = [];

export const getQuestionsByCategory = (categoryId: string) =>
  evalQuestions.filter((q) => q.categoryId === categoryId);

export const getRatingQuestions = () =>
  evalQuestions.filter((q) => q.type === "rating" && q.required);
