import type { AttendanceSettings } from '../../types/attendance';

export const attendanceSettings: AttendanceSettings = {
  openingBufferMinutes: 10,  // scanner opens 10 min before class
  lateThresholdMinutes: 15,  // > 15 min after start = Late
  closingWindowMinutes: 30,  // scanner closes 30 min after class ends
};
