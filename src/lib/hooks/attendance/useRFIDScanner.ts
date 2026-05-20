import { useState, useCallback, useMemo } from 'react';
import type { AttendanceSession, ScanResult } from '../../types/attendance';
import { getDemoSessionsForDay } from '../../data/attendance/attendance-sessions';
import { rfidCards } from '../../data/attendance/rfid-cards';
import { studentProfiles } from '../../data/enrollment/students';
import { subjects } from '../../data/enrollment/subjects';
import { classOfferings } from '../../data/attendance/class-offerings';
import { useAttendanceValidation } from './useAttendanceValidation';
import { useAttendanceLogger } from './useAttendanceLogger';

export type DemoDay = 'Mon' | 'Tue' | 'Wed';
export type ArrivalMode = 'on-time' | 'late';

function buildSimulatedTime(session: AttendanceSession, mode: ArrivalMode): string {
  // on-time → 5 min after open, late → 5 min after lateAfter
  const target = mode === 'on-time' ? session.openTime : session.lateAfter;
  const [h, m] = target.split(':').map(Number);
  const total = h * 60 + m + 5;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export interface RFIDScannerState {
  selectedDay: DemoDay;
  selectedSession: AttendanceSession | null;
  cardNumber: string;
  arrivalMode: ArrivalMode;
  scanning: boolean;
  scanResult: ScanResult | null;
  availableSessions: AttendanceSession[];
  demoCards: typeof rfidCards;
}

export interface UseRFIDScannerReturn extends RFIDScannerState {
  setSelectedDay: (day: DemoDay) => void;
  setSelectedSession: (session: AttendanceSession | null) => void;
  setCardNumber: (num: string) => void;
  setArrivalMode: (mode: ArrivalMode) => void;
  handleTap: () => Promise<void>;
  resetScan: () => void;
  getStudentName: (studentId: string) => string;
  getSubjectTitle: (classId: string) => string;
  getSubjectCode: (classId: string) => string;
}

export function useRFIDScanner(): UseRFIDScannerReturn {
  const [selectedDay, setSelectedDayState] = useState<DemoDay>('Mon');
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [arrivalMode, setArrivalMode] = useState<ArrivalMode>('on-time');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const { validateTap } = useAttendanceValidation();
  const { logAttendance } = useAttendanceLogger();

  const availableSessions = useMemo(() => getDemoSessionsForDay(selectedDay), [selectedDay]);

  const setSelectedDay = useCallback((day: DemoDay) => {
    setSelectedDayState(day);
    setSelectedSession(null);
    setScanResult(null);
  }, []);

  const getStudentName = useCallback((studentId: string): string => {
    const profile = studentProfiles.find((s) => s.id === studentId);
    return profile?.name ?? 'Unknown Student';
  }, []);

  const getSubjectTitle = useCallback((classId: string): string => {
    const offering = classOfferings.find((o) => o.id === classId);
    if (!offering) return 'Unknown Subject';
    const subject = subjects.find((s) => s.id === offering.subjectId);
    return subject?.title ?? 'Unknown Subject';
  }, []);

  const getSubjectCode = useCallback((classId: string): string => {
    const offering = classOfferings.find((o) => o.id === classId);
    if (!offering) return '---';
    const subject = subjects.find((s) => s.id === offering.subjectId);
    return subject?.code ?? '---';
  }, []);

  const handleTap = useCallback(async () => {
    if (!selectedSession || !cardNumber.trim()) return;

    setScanning(true);
    setScanResult(null);

    // Simulate hardware scan delay
    await new Promise((r) => setTimeout(r, 900));

    const simulatedTime = buildSimulatedTime(selectedSession, arrivalMode);
    const result = validateTap({ cardNumber: cardNumber.trim(), session: selectedSession, simulatedTime });

    if (result.success && result.studentId && result.status && result.timeIn) {
      const card = rfidCards.find((c) => c.cardNumber === cardNumber.trim());
      logAttendance({
        sessionId: selectedSession.id,
        studentId: result.studentId,
        classId: selectedSession.classId,
        date: selectedSession.date,
        timeIn: result.timeIn,
        status: result.status,
        rfidCardId: card?.id,
      });

      const student = studentProfiles.find((s) => s.id === result.studentId);
      const offering = classOfferings.find((o) => o.id === selectedSession.classId);
      const subject = subjects.find((s) => s.id === offering?.subjectId);

      result.studentName = student?.name;
      result.studentNumber = student?.studentNumber;
      result.subjectTitle = subject?.title;
      result.subjectCode = subject?.code;
    }

    setScanning(false);
    setScanResult(result);
  }, [selectedSession, cardNumber, arrivalMode, validateTap, logAttendance]);

  const resetScan = useCallback(() => {
    setScanResult(null);
    setCardNumber('');
  }, []);

  return {
    selectedDay,
    selectedSession,
    cardNumber,
    arrivalMode,
    scanning,
    scanResult,
    availableSessions,
    demoCards: rfidCards,
    setSelectedDay,
    setSelectedSession,
    setCardNumber,
    setArrivalMode,
    handleTap,
    resetScan,
    getStudentName,
    getSubjectTitle,
    getSubjectCode,
  };
}
