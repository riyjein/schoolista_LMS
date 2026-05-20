import type { AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import { attendanceSessions } from './attendance-sessions';

const CLASS_DETAILS: Record<string, {
  subjectId: string;
  instructorId: string;
  sectionCode: string;
  startTime: string;
}> = {
  'class-1': { subjectId: 'cs211', instructorId: 'inst-1', sectionCode: 'BSCS-2A', startTime: '09:00' },
  'class-2': { subjectId: 'cs221', instructorId: 'inst-2', sectionCode: 'BSCS-2A', startTime: '10:00' },
  'class-3': { subjectId: 'cs231', instructorId: 'inst-3', sectionCode: 'BSCS-2A', startTime: '11:00' },
  'class-4': { subjectId: 'pe201', instructorId: 'inst-4', sectionCode: 'PE-2024-A', startTime: '14:00' },
  'class-5': { subjectId: 'eng211', instructorId: 'inst-2', sectionCode: 'BSCS-2A', startTime: '13:00' },
};

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function deriveStatus(idx: number): { status: AttendanceStatus; minuteOffset: number; remarks?: string } {
  if (idx % 20 === 0) return { status: 'excused', minuteOffset: 0, remarks: 'Medical certificate submitted' };
  if (idx % 7 === 0) return { status: 'absent', minuteOffset: 0 };
  if (idx % 5 === 0) return { status: 'late', minuteOffset: 15 + (idx % 10) };
  return { status: 'present', minuteOffset: -4 + (idx % 8) };
}

function generateStudentRecords(studentId: string, rfidCardId: string, idxOffset = 0): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let idx = 1 + idxOffset;

  for (const session of attendanceSessions) {
    const details = CLASS_DETAILS[session.classId];
    if (!details) { idx++; continue; }

    const { status, minuteOffset, remarks } = deriveStatus(idx);
    const isPresent = status === 'present' || status === 'late';
    const timeIn = isPresent ? addMinutes(details.startTime, minuteOffset) : '--:--';

    records.push({
      id: `rec-${studentId}-${String(idx - idxOffset).padStart(4, '0')}`,
      sessionId: session.id,
      studentId,
      classId: session.classId,
      subjectId: details.subjectId,
      instructorId: details.instructorId,
      sectionCode: details.sectionCode,
      date: session.date,
      timeIn,
      status,
      remarks,
      rfidCardId: isPresent ? rfidCardId : undefined,
    });
    idx++;
  }

  return records;
}

// Mutable store — new records pushed here during RFID demo sessions
// idxOffset creates distinct attendance patterns per student
export const attendanceRecords: AttendanceRecord[] = [
  ...generateStudentRecords('student-1', 'rfid-1', 0),   // ~85% attendance rate
  ...generateStudentRecords('student-2', 'rfid-2', 3),   // ~92% attendance (high performer)
  ...generateStudentRecords('student-3', 'rfid-3', 11),  // ~78% attendance (at risk)
];

export const getRecordsForStudent = (studentId: string): AttendanceRecord[] =>
  attendanceRecords.filter((r) => r.studentId === studentId);

export const getRecordsForSession = (sessionId: string): AttendanceRecord[] =>
  attendanceRecords.filter((r) => r.sessionId === sessionId);

export const getRecordForStudentSession = (studentId: string, sessionId: string): AttendanceRecord | undefined =>
  attendanceRecords.find((r) => r.studentId === studentId && r.sessionId === sessionId);

export const getRecordsForClass = (classId: string, studentId?: string): AttendanceRecord[] =>
  attendanceRecords.filter(
    (r) => r.classId === classId && (!studentId || r.studentId === studentId),
  );

export const addAttendanceRecord = (record: AttendanceRecord): void => {
  attendanceRecords.push(record);
};
