import { useState } from 'react';
import { RFIDScannerTab } from './tabs/RFIDScannerTab';
import { AttendanceCalendarTab } from './tabs/AttendanceCalendarTab';
import { AttendanceHistoryTab } from './tabs/AttendanceHistoryTab';
import { cn } from '@/app/components/ui/utils';
import { CreditCard, CalendarDays, ClipboardList } from 'lucide-react';

// Demo: student-1 (Maria Santos) is the logged-in student
const CURRENT_STUDENT_ID = 'student-1';

type TabId = 'rfid' | 'calendar' | 'history';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'rfid', label: 'RFID Scanner', icon: CreditCard },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'history', label: 'History', icon: ClipboardList },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<TabId>('rfid');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            RFID simulation, attendance calendar, and history for 2024-2025 1st Semester.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border bg-card p-1 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeTab === id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'rfid' && <RFIDScannerTab />}
        {activeTab === 'calendar' && <AttendanceCalendarTab studentId={CURRENT_STUDENT_ID} />}
        {activeTab === 'history' && <AttendanceHistoryTab studentId={CURRENT_STUDENT_ID} />}
      </div>
    </div>
  );
}
