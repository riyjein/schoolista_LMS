import { useMemo } from 'react';
import { getSubjectsByIds } from '../data/enrollment/subjects';
import { MIN_UNITS, MAX_UNITS, OVERLOAD_THRESHOLD } from '../types/enrollment';

export interface UnitComputationResult {
  totalUnits: number;
  lecUnits: number;
  labUnits: number;
  isUnderload: boolean;
  isOverload: boolean;
  isAtLimit: boolean;
  isValid: boolean;
  remainingToMin: number;
  remainingToMax: number;
  percentFilled: number;
  warnings: string[];
}

export function useUnitComputation(selectedSubjectIds: string[]): UnitComputationResult {
  return useMemo(() => {
    const selected = getSubjectsByIds(selectedSubjectIds);

    const lecUnits = selected.reduce((sum, s) => sum + s.lecUnits, 0);
    const labUnits = selected.reduce((sum, s) => sum + s.labUnits, 0);
    const totalUnits = lecUnits + labUnits;

    const isUnderload = totalUnits > 0 && totalUnits < MIN_UNITS;
    const isOverload = totalUnits > MAX_UNITS;
    const isAtLimit = totalUnits === MAX_UNITS;
    const isValid = totalUnits >= MIN_UNITS && totalUnits <= MAX_UNITS;

    const remainingToMin = Math.max(0, MIN_UNITS - totalUnits);
    const remainingToMax = Math.max(0, MAX_UNITS - totalUnits);
    const percentFilled = Math.min(100, (totalUnits / MAX_UNITS) * 100);

    const warnings: string[] = [];
    if (isUnderload) {
      warnings.push(`You have ${totalUnits} units. Minimum required is ${MIN_UNITS}. Add ${remainingToMin} more unit(s).`);
    }
    if (isOverload) {
      warnings.push(`You have ${totalUnits} units, exceeding the maximum of ${MAX_UNITS}. Remove ${totalUnits - MAX_UNITS} unit(s).`);
    }
    if (totalUnits >= OVERLOAD_THRESHOLD && totalUnits <= MAX_UNITS) {
      warnings.push(`You are enrolled in ${totalUnits} units. This is a heavy load — please ensure you can manage the workload.`);
    }

    return {
      totalUnits,
      lecUnits,
      labUnits,
      isUnderload,
      isOverload,
      isAtLimit,
      isValid,
      remainingToMin,
      remainingToMax,
      percentFilled,
      warnings,
    };
  }, [selectedSubjectIds]);
}
