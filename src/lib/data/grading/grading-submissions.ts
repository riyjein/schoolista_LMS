export type SubmissionAction =
  | 'save_draft'
  | 'submit'
  | 'finalize'
  | 'bulk_submit'
  | 'bulk_finalize';

export interface SubmissionLog {
  id: string;
  classId: string;
  instructorId: string;
  action: SubmissionAction;
  affectedStudentIds: string[];
  timestamp: string;
  note?: string;
}

export const submissionLogs: SubmissionLog[] = [];

let _counter = 1;

export function addSubmissionLog(
  classId: string,
  instructorId: string,
  action: SubmissionAction,
  affectedStudentIds: string[],
  note?: string,
): void {
  submissionLogs.push({
    id: `log-${_counter++}`,
    classId,
    instructorId,
    action,
    affectedStudentIds,
    timestamp: new Date().toISOString(),
    note,
  });
}

export function getLogsForClass(classId: string): SubmissionLog[] {
  return submissionLogs.filter((l) => l.classId === classId);
}
