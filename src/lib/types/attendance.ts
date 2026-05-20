export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
export type CardStatus = 'active' | 'inactive' | 'lost' | 'expired';
export type SessionStatus = 'upcoming' | 'open' | 'closed';
export type ScheduleType = 'lecture' | 'lab' | 'PE';

export type ScanResultCode =
  | 'present'
  | 'late'
  | 'no-class'
  | 'already-logged'
  | 'unknown-card'
  | 'inactive-card'
  | 'too-early'
  | 'session-closed';

export interface Instructor {
  id: string;
  userId: string;
  name: string;
  employeeId: string;
  department: string;
}

export interface ClassOffering {
  id: string;
  subjectId: string;
  instructorId: string;
  sectionCode: string;
  schoolYear: string;
  semester: string;
  room: string;
  maxStudents: number;
  enrolledStudentIds: string[];
}

export interface ClassSchedule {
  id: string;
  classId: string;
  days: DayOfWeek[];
  startTime: string; // HH:mm 24h
  endTime: string;   // HH:mm 24h
  type: ScheduleType;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  scheduleId: string;
  date: string;       // YYYY-MM-DD
  openTime: string;   // HH:mm — attendance window opens
  closeTime: string;  // HH:mm — attendance window closes
  lateAfter: string;  // HH:mm — taps after this = Late
  status: SessionStatus;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  classId: string;
  subjectId: string;
  instructorId: string;
  sectionCode: string;
  date: string;      // YYYY-MM-DD
  timeIn: string;    // HH:mm
  status: AttendanceStatus;
  remarks?: string;
  rfidCardId?: string;
}

export interface RFIDCard {
  id: string;
  studentId: string;
  cardNumber: string;
  cardStatus: CardStatus;
  lastTapTime?: string;
}

export interface AttendanceSettings {
  openingBufferMinutes: number;  // minutes before class start that scanner opens
  lateThresholdMinutes: number;  // minutes after start before marked Late
  closingWindowMinutes: number;  // minutes after class end when session closes
}

// Derived / UI types

export interface EnrichedAttendanceRecord extends AttendanceRecord {
  subjectCode: string;
  subjectTitle: string;
  instructorName: string;
  sessionStartTime: string;
  sessionEndTime: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number; // (present + late + excused) / total * 100
}

export interface DayAttendance {
  date: string;
  records: EnrichedAttendanceRecord[];
  hasAbsence: boolean;
  hasLate: boolean;
  hasPresent: boolean;
  hasExcused: boolean;
}

export interface ScanResult {
  code: ScanResultCode;
  success: boolean;
  message: string;
  studentId?: string;
  studentName?: string;
  studentNumber?: string;
  subjectTitle?: string;
  subjectCode?: string;
  timeIn?: string;
  status?: AttendanceStatus;
  record?: AttendanceRecord;
}
