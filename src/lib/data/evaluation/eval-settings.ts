import type { EvalCategory, EvalSettings } from "../../types/evaluation";

export const evalSettings: EvalSettings = {
  ratingScale: 5,
  ratingLabels: {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  },
  minLabel: "Poor",
  maxLabel: "Excellent",
};

export const evalCategories: EvalCategory[] = [];
