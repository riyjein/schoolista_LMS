import { useCallback } from 'react';
import type { ScanResult, AttendanceSession } from '../../types/attendance';
import { getCardByNumber } from '../../data/attendance/rfid-cards';
import { classOfferings } from '../../data/attendance/class-offerings';
import { getRecordForStudentSession } from '../../data/attendance/attendance-records';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface ValidationInput {
  cardNumber: string;
  session: AttendanceSession;
  simulatedTime: string; // HH:mm
}

export function useAttendanceValidation() {
  const validateTap = useCallback((input: ValidationInput): ScanResult => {
    const { cardNumber, session, simulatedTime } = input;

    // 1. Resolve card
    const card = getCardByNumber(cardNumber);
    if (!card || !card.studentId) {
      return { code: 'unknown-card', success: false, message: 'Unknown RFID card. Card not registered in the system.' };
    }

    // 2. Check card status
    if (card.cardStatus !== 'active') {
      return {
        code: 'inactive-card',
        success: false,
        message: `Card is ${card.cardStatus}. Please report to the registrar.`,
      };
    }

    const { studentId } = card;

    // 3. Confirm student is enrolled in this class
    const offering = classOfferings.find((o) => o.id === session.classId);
    if (!offering || !offering.enrolledStudentIds.includes(studentId)) {
      return {
        code: 'no-class',
        success: false,
        message: 'Student is not enrolled in this class.',
        studentId,
      };
    }

    // 4. Check attendance window
    const tapMinutes = timeToMinutes(simulatedTime);
    const openMinutes = timeToMinutes(session.openTime);
    const closeMinutes = timeToMinutes(session.closeTime);
    const lateMinutes = timeToMinutes(session.lateAfter);

    if (tapMinutes < openMinutes) {
      return {
        code: 'too-early',
        success: false,
        message: `Scanner opens at ${session.openTime}. Too early to tap.`,
        studentId,
      };
    }

    if (tapMinutes > closeMinutes) {
      return {
        code: 'session-closed',
        success: false,
        message: `Attendance window has closed at ${session.closeTime}.`,
        studentId,
      };
    }

    // 5. Duplicate check
    // When this moves fully to Supabase, prefer a direct query against the
    // attendance_records unique key instead of the local in-memory lookup.
    const existing = getRecordForStudentSession(studentId, session.id);
    if (existing) {
      return {
        code: 'already-logged',
        success: false,
        message: `Attendance already recorded at ${existing.timeIn}.`,
        studentId,
        timeIn: existing.timeIn,
        status: existing.status,
      };
    }

    // 6. Determine status
    const status = tapMinutes > lateMinutes ? 'late' : 'present';
    const timeIn = minutesToTime(tapMinutes);

    return {
      code: status,
      success: true,
      message: status === 'present' ? 'Attendance recorded — Present.' : 'Attendance recorded — Late.',
      studentId,
      timeIn,
      status,
    };
  }, []);

  return { validateTap };
}
