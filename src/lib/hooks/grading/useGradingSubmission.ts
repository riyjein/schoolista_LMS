import { useState, useCallback } from 'react';

export type DialogAction = 'submit' | 'finalize' | 'bulk_submit' | 'bulk_finalize';

export interface SubmissionDialogState {
  isOpen: boolean;
  action: DialogAction | null;
  targetRecordId: string | null;
  targetStudentName: string | null;
  isProcessing: boolean;
}

const CLOSED: SubmissionDialogState = {
  isOpen: false,
  action: null,
  targetRecordId: null,
  targetStudentName: null,
  isProcessing: false,
};

export interface UseGradingSubmissionReturn {
  dialog: SubmissionDialogState;
  requestSubmit: (recordId: string, studentName: string) => void;
  requestFinalize: (recordId: string, studentName: string) => void;
  requestBulkSubmit: () => void;
  requestBulkFinalize: () => void;
  confirm: (onConfirm: () => void | string[]) => Promise<void>;
  cancel: () => void;
}

export function useGradingSubmission(): UseGradingSubmissionReturn {
  const [dialog, setDialog] = useState<SubmissionDialogState>(CLOSED);

  const requestSubmit = useCallback((recordId: string, studentName: string) => {
    setDialog({ isOpen: true, action: 'submit', targetRecordId: recordId, targetStudentName: studentName, isProcessing: false });
  }, []);

  const requestFinalize = useCallback((recordId: string, studentName: string) => {
    setDialog({ isOpen: true, action: 'finalize', targetRecordId: recordId, targetStudentName: studentName, isProcessing: false });
  }, []);

  const requestBulkSubmit = useCallback(() => {
    setDialog({ isOpen: true, action: 'bulk_submit', targetRecordId: null, targetStudentName: null, isProcessing: false });
  }, []);

  const requestBulkFinalize = useCallback(() => {
    setDialog({ isOpen: true, action: 'bulk_finalize', targetRecordId: null, targetStudentName: null, isProcessing: false });
  }, []);

  const confirm = useCallback(async (onConfirm: () => void | string[]) => {
    setDialog((prev) => ({ ...prev, isProcessing: true }));
    // Simulate brief processing delay for UX
    await new Promise((r) => setTimeout(r, 600));
    onConfirm();
    setDialog(CLOSED);
  }, []);

  const cancel = useCallback(() => setDialog(CLOSED), []);

  return { dialog, requestSubmit, requestFinalize, requestBulkSubmit, requestBulkFinalize, confirm, cancel };
}
