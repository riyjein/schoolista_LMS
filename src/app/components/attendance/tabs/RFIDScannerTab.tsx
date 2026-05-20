import { useState } from 'react';
import { useRFIDScanner, type DemoDay } from '@/lib/hooks/attendance/useRFIDScanner';
import { SessionIndicator } from '../components/SessionIndicator';
import { StudentPreviewCard } from '../components/StudentPreviewCard';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { cn } from '@/app/components/ui/utils';
import { CreditCard, Wifi, RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

const DEMO_DAYS: { value: DemoDay; label: string }[] = [
  { value: 'Mon', label: 'Monday (Sep 16)' },
  { value: 'Tue', label: 'Tuesday (Sep 17)' },
  { value: 'Wed', label: 'Wednesday (Sep 18)' },
];

const DEMO_CARDS = [
  { number: '2300014201', label: 'Maria Santos — Active' },
  { number: '2300014202', label: 'Student 2 — Active' },
  { number: '2300014203', label: 'Student 3 — Active' },
  { number: '9999000001', label: 'Lost Card (Error demo)' },
  { number: '0000000000', label: 'Unknown Card (Error demo)' },
];

export function RFIDScannerTab() {
  const scanner = useRFIDScanner();
  const [useCustomCard, setUseCustomCard] = useState(false);

  const canTap = !!scanner.selectedSession && !!scanner.cardNumber.trim() && !scanner.scanning;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left — Configuration Panel */}
      <div className="space-y-5">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold">Demo Configuration</h3>

          {/* Day selector */}
          <div className="space-y-2">
            <Label>Simulated Day</Label>
            <div className="flex gap-2">
              {DEMO_DAYS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => scanner.setSelectedDay(d.value)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    scanner.selectedDay === d.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  {d.value}
                </button>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              {DEMO_DAYS.find((d) => d.value === scanner.selectedDay)?.label}
            </p>
          </div>

          {/* Session selector */}
          <div className="mt-4 space-y-2">
            <Label>Select Session</Label>
            <div className="space-y-2">
              {scanner.availableSessions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No sessions available for this day.</p>
              ) : (
                scanner.availableSessions.map((session) => (
                  <SessionIndicator
                    key={session.id}
                    session={session}
                    isSelected={scanner.selectedSession?.id === session.id}
                    onClick={() => {
                      scanner.setSelectedSession(
                        scanner.selectedSession?.id === session.id ? null : session,
                      );
                      scanner.resetScan();
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold">Card Input</h3>

          {/* Arrival mode */}
          <div className="mb-4 space-y-2">
            <Label>Arrival Mode</Label>
            <div className="flex gap-2">
              {(['on-time', 'late'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => scanner.setArrivalMode(mode)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors',
                    scanner.arrivalMode === mode
                      ? mode === 'on-time'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  {mode === 'on-time' ? 'On Time' : 'Late'}
                </button>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              {scanner.arrivalMode === 'on-time'
                ? 'Tap simulated 5 min after scanner opens (Present)'
                : 'Tap simulated 5 min after late threshold (Late)'}
            </p>
          </div>

          {/* Card picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>RFID Card Number</Label>
              <button
                onClick={() => { setUseCustomCard((v) => !v); scanner.setCardNumber(''); }}
                className="text-muted-foreground hover:text-foreground text-xs underline"
              >
                {useCustomCard ? 'Use preset cards' : 'Enter custom number'}
              </button>
            </div>

            {useCustomCard ? (
              <Input
                placeholder="Enter card number"
                value={scanner.cardNumber}
                onChange={(e) => scanner.setCardNumber(e.target.value)}
                maxLength={20}
              />
            ) : (
              <Select value={scanner.cardNumber} onValueChange={scanner.setCardNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a demo card..." />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_CARDS.map((c) => (
                    <SelectItem key={c.number} value={c.number}>
                      <span className="font-mono">{c.number}</span>
                      <span className="text-muted-foreground ml-2">— {c.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Right — Scanner Panel */}
      <div className="space-y-5">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col items-center gap-5">
            {/* Scanner visual */}
            <div className={cn(
              'relative flex h-40 w-40 items-center justify-center rounded-full border-4 transition-all duration-500',
              scanner.scanning
                ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-200 animate-pulse'
                : scanner.scanResult?.success
                  ? 'border-green-400 bg-green-50 shadow-lg shadow-green-200'
                  : scanner.scanResult
                    ? 'border-red-400 bg-red-50 shadow-lg shadow-red-200'
                    : 'border-border bg-muted',
            )}>
              {scanner.scanning ? (
                <Wifi className="h-16 w-16 text-blue-400 animate-ping" style={{ animationDuration: '0.8s' }} />
              ) : (
                <CreditCard className={cn(
                  'h-16 w-16 transition-colors',
                  scanner.scanResult?.success ? 'text-green-500'
                    : scanner.scanResult ? 'text-red-400'
                      : 'text-muted-foreground',
                )} />
              )}
            </div>

            <div className="text-center">
              <p className="font-semibold">
                {scanner.scanning
                  ? 'Scanning...'
                  : scanner.scanResult
                    ? scanner.scanResult.success ? 'Tap Successful' : 'Tap Failed'
                    : 'Ready to Scan'}
              </p>
              {scanner.selectedSession ? (
                <p className="text-muted-foreground mt-1 text-sm">
                  Session: {scanner.getSubjectCode(scanner.selectedSession.classId)}
                </p>
              ) : (
                <p className="text-muted-foreground mt-1 text-sm">Select a session above</p>
              )}
            </div>

            {/* Tap button */}
            <Button
              size="lg"
              disabled={!canTap}
              onClick={() => scanner.handleTap()}
              className="w-full"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Tap Card
            </Button>

            {scanner.scanResult && (
              <Button variant="ghost" size="sm" onClick={scanner.resetScan} className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Scan result */}
        {scanner.scanResult && (
          <StudentPreviewCard
            result={scanner.scanResult}
            studentName={scanner.scanResult.studentName}
            studentNumber={scanner.scanResult.studentNumber}
          />
        )}

        {/* Legend */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium">Demo Card Reference</p>
          <div className="space-y-1">
            {DEMO_CARDS.map((c) => (
              <div key={c.number} className="flex items-center justify-between gap-2 text-sm">
                <span className="font-mono text-xs text-blue-600">{c.number}</span>
                <span className="text-muted-foreground text-xs">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
