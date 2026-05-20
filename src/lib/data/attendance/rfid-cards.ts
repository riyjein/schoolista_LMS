import type { RFIDCard } from '../../types/attendance';

export const rfidCards: RFIDCard[] = [
  {
    id: 'rfid-1',
    studentId: 'student-1',
    cardNumber: '2300014201',
    cardStatus: 'active',
    lastTapTime: '2024-09-27T09:02:00',
  },
  {
    id: 'rfid-2',
    studentId: 'student-2',
    cardNumber: '2300014202',
    cardStatus: 'active',
    lastTapTime: '2024-09-27T09:01:00',
  },
  {
    id: 'rfid-3',
    studentId: 'student-3',
    cardNumber: '2300014203',
    cardStatus: 'active',
    lastTapTime: '2024-09-27T09:04:00',
  },
  // Lost/inactive card for demo
  {
    id: 'rfid-4',
    studentId: 'student-1',
    cardNumber: '9999000001',
    cardStatus: 'lost',
  },
  // Unknown card (no student) — triggers "unknown card" error
  {
    id: 'rfid-5',
    studentId: '',
    cardNumber: '0000000000',
    cardStatus: 'inactive',
  },
];

// In-session tap log (session-scoped, reset per session)
export const sessionTapLog: Map<string, string> = new Map(); // cardNumber → recordId

export const getCardByNumber = (cardNumber: string): RFIDCard | undefined =>
  rfidCards.find((c) => c.cardNumber === cardNumber);

export const getActiveCardForStudent = (studentId: string): RFIDCard | undefined =>
  rfidCards.find((c) => c.studentId === studentId && c.cardStatus === 'active');
