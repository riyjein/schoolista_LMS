import { useCallback } from 'react';
import type { AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import {
  attendanceRecords,
  addAttendanceRecord,
  getRecordsForStudent,
  getRecordsForSession,
  getRecordForStudentSession,
} from '../../data/attendance/attendance-records';
import { classOfferings } from '../../data/attendance/class-offerings';

let _logCounter = 10000;

function nextRecordId(): string {
  _logCounter++;
  return `rec-demo-${_logCounter}`;
}

export interface LogAttendanceInput {
  sessionId: string;
  studentId: string;
  classId: string;
  date: string;
  timeIn: string;
  status: AttendanceStatus;
  rfidCardId?: string;
  remarks?: string;
}

export function useAttendanceLogger() {
  const logAttendance = useCallback((input: LogAttendanceInput): AttendanceRecord => {
    const offering = classOfferings.find((o) => o.id === input.classId);

    const record: AttendanceRecord = {
      id: nextRecordId(),
      sessionId: input.sessionId,
      studentId: input.studentId,
      classId: input.classId,
      subjectId: offering?.subjectId ?? '',
      instructorId: offering?.instructorId ?? '',
      sectionCode: offering?.sectionCode ?? '',
      date: input.date,
      timeIn: input.timeIn,
      status: input.status,
      rfidCardId: input.rfidCardId,
      remarks: input.remarks,
    };

    addAttendanceRecord(record);
    return record;
  }, []);

  const isAlreadyLogged = useCallback(
    (studentId: string, sessionId: string): boolean =>
      !!getRecordForStudentSession(studentId, sessionId),
    [],
  );

  const getAllRecords = useCallback(() => [...attendanceRecords], []);

  return {
    logAttendance,
    isAlreadyLogged,
    getRecordsForStudent,
    getRecordsForSession,
    getRecordForStudentSession,
    getAllRecords,
  };
}
