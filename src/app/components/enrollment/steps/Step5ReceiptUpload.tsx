import { useCallback, useRef } from 'react';
import { Upload, X, FileImage, CheckCircle2, Loader2, AlertCircle, Receipt } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { cn } from '@/app/components/ui/utils';
import type { UseReceiptUploadReturn } from '@/lib/hooks/useReceiptUpload';

interface Step5Props {
  receiptUpload: UseReceiptUploadReturn;
  estimatedTotal: number;
  onNext: () => void;
  onBack: () => void;
  onFileChange: (file: File | null, preview: string | null) => void;
}

export function Step5ReceiptUpload({
  receiptUpload,
  estimatedTotal,
  onNext,
  onBack,
  onFileChange,
}: Step5Props) {
  const {
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
  } = receiptUpload;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped) {
        handleFileDrop(dropped);
        // Create preview for parent state
        if (dropped.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => onFileChange(dropped, ev.target?.result as string);
          reader.readAsDataURL(dropped);
        } else {
          onFileChange(dropped, null);
        }
      }
    },
    [handleFileDrop, onFileChange],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) {
        handleFileDrop(selected);
        if (selected.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => onFileChange(selected, ev.target?.result as string);
          reader.readAsDataURL(selected);
        } else {
          onFileChange(selected, null);
        }
      }
    },
    [handleFileDrop, onFileChange],
  );

  const handleUpload = async () => {
    await simulateUpload();
  };

  const handleClear = () => {
    clearFile();
    onFileChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatPeso = (v: number) =>
    `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-semibold text-slate-800">Payment Receipt Upload</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload your proof of payment to complete the enrollment process.
        </p>
      </div>

      {/* Payment reference */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <Receipt className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Estimated Amount Due</p>
          <p className="text-xl font-bold text-[var(--color-primary)]">{formatPeso(estimatedTotal)}</p>
        </div>
      </div>

      {/* Drop zone */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-blue-50/40 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <Upload className="w-7 h-7 text-slate-400 group-hover:text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Drag & drop your receipt here</p>
              <p className="text-sm text-slate-400 mt-1">or click to browse files</p>
            </div>
            <p className="text-xs text-slate-400">Supports: JPG, PNG, WebP, PDF &bull; Max 5 MB</p>
          </div>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          {/* File header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100">
            <FileImage className="w-5 h-5 text-slate-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image preview */}
          {preview && (
            <div className="relative bg-slate-50 h-64 flex items-center justify-center overflow-hidden">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {/* Upload progress */}
          {uploadStatus === 'uploading' && (
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading... {uploadProgress}%
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 p-4 bg-emerald-50 border-t border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-700 font-medium">Receipt uploaded successfully</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Payment details form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Payment Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount Paid (₱)</Label>
            <Input
              type="number"
              placeholder={estimatedTotal.toString()}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Payment Reference No.</Label>
            <Input
              placeholder="e.g. GCash ref, bank receipt no."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Enter the transaction reference number from your payment receipt.
        </p>
      </div>

      {/* Upload button (if not uploaded yet) */}
      {file && uploadStatus === 'idle' && (
        <Button
          onClick={handleUpload}
          className="w-full bg-[var(--color-primary)] hover:opacity-90 text-white gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Receipt
        </Button>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back to Summary
        </Button>
        <Button
          onClick={onNext}
          disabled={!file || uploadStatus !== 'success'}
          className={cn(
            'flex-1 gap-2',
            uploadStatus === 'success'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-[var(--color-primary)] hover:opacity-90 text-white',
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          Submit Enrollment
        </Button>
      </div>
    </div>
  );
}
