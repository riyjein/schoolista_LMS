import { useCallback } from 'react';
import type { GradeRemark } from '../../types/grades';

export function useRemarksLogic() {
  const getRemarkColor = useCallback((remark: GradeRemark): string => {
    switch (remark) {
      case 'Passed': return 'text-green-700 bg-green-50 border-green-200';
      case 'Failed': return 'text-red-700 bg-red-50 border-red-200';
      case 'Incomplete': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Dropped': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'No Grade': return 'text-muted-foreground bg-muted border-border';
    }
  }, []);

  const isCompletionRemark = useCallback(
    (remark: GradeRemark): boolean => remark === 'Passed' || remark === 'Failed',
    [],
  );

  return { getRemarkColor, isCompletionRemark };
}
