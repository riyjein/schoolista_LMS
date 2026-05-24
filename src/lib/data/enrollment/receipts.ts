import type { ReceiptRecord } from "../../types/enrollment";

export const receipts: ReceiptRecord[] = [];

// In-memory session receipts
export const sessionReceipts: ReceiptRecord[] = [];

export const addSessionReceipt = (receipt: ReceiptRecord): void => {
  sessionReceipts.push(receipt);
};

export const getReceiptsForStudent = (studentId: string): ReceiptRecord[] =>
  [...receipts, ...sessionReceipts].filter((r) => r.studentId === studentId);
