import type { ReceiptRecord } from '../../types/enrollment';

export const receipts: ReceiptRecord[] = [
  {
    id: 'rcpt-2023-1-1',
    studentId: 'student-1',
    enrollmentId: 'enr-2023-1-1',
    filename: 'payment_sem1_2023.jpg',
    fileSize: 245760,
    uploadedAt: '2023-06-15T09:15:00.000Z',
    amount: 22500,
    referenceNumber: 'PAY-2023-00142-01',
    status: 'verified',
  },
  {
    id: 'rcpt-2023-1-2',
    studentId: 'student-1',
    enrollmentId: 'enr-2023-1-2',
    filename: 'gcash_receipt_nov2023.png',
    fileSize: 189432,
    uploadedAt: '2023-11-10T10:30:00.000Z',
    amount: 22500,
    referenceNumber: 'PAY-2023-00142-02',
    status: 'verified',
  },
];

// In-memory session receipts
export const sessionReceipts: ReceiptRecord[] = [];

export const addSessionReceipt = (receipt: ReceiptRecord): void => {
  sessionReceipts.push(receipt);
};

export const getReceiptsForStudent = (studentId: string): ReceiptRecord[] =>
  [...receipts, ...sessionReceipts].filter((r) => r.studentId === studentId);
