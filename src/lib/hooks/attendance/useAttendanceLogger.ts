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
import { insertRow } from '../../supabase/queries';

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
    // Supabase CRUD goes here: insert the attendance row and let the unique
    // (session_id, student_id) constraint protect against duplicate taps.
    void insertRow('attendance_records', {
      id: record.id,
      session_id: record.sessionId,
      student_id: record.studentId,
      class_id: record.classId,
      subject_id: record.subjectId,
      instructor_id: record.instructorId,
      section_code: record.sectionCode,
      record_date: record.date,
      time_in: record.timeIn,
      status: record.status,
      remarks: record.remarks ?? null,
      rfid_card_id: record.rfidCardId ?? null,
    });
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
