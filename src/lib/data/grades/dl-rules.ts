import type { DLRules } from '../../types/grades';

export const dlRules: DLRules = {
  maxGPA: 1.75,        // overall ceiling for any DL recognition
  cumLaudeMaxGPA: 1.75,
  magnaMaxGPA: 1.50,
  summaMaxGPA: 1.25,
  minUnits: 15,
  allowFailing: false,
  allowIncomplete: false,
};
