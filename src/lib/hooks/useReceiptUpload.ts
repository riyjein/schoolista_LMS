import { useState, useCallback } from 'react';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UseReceiptUploadReturn {
  file: File | null;
  preview: string | null;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  errorMessage: string | null;
  amount: string;
  reference: string;
  setAmount: (v: string) => void;
  setReference: (v: string) => void;
  handleFileDrop: (file: File) => void;
  clearFile: () => void;
  simulateUpload: () => Promise<void>;
}

export function useReceiptUpload(): UseReceiptUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  const MAX_SIZE_MB = 5;

  const handleFileDrop = useCallback((incoming: File) => {
    setErrorMessage(null);
    setUploadStatus('idle');
    setUploadProgress(0);

    if (!ACCEPTED_TYPES.includes(incoming.type)) {
      setErrorMessage('Unsupported file type. Please upload a JPG, PNG, WebP, or PDF.');
      return;
    }

    if (incoming.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    setFile(incoming);

    if (incoming.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(incoming);
    } else {
      setPreview(null);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage(null);
  }, []);

  const simulateUpload = useCallback(async () => {
    if (!file) return;
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate chunked upload over ~2 seconds
    const steps = 20;
    const delay = 100; // ms per step

    for (let i = 1; i <= steps; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
      setUploadProgress(Math.round((i / steps) * 100));
    }

    setUploadStatus('success');
  }, [file]);

  return {
    file,
    preview,
    uploadStatus,
    uploadProgress,
    errorMessage,
    amount,
    reference,
    setAmount,
    setReference,
    handleFileDrop,
    clearFile,
    simulateUpload,
  };
}
