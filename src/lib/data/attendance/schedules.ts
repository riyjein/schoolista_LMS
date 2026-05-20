import type { ClassSchedule } from '../../types/attendance';

export const classSchedules: ClassSchedule[] = [
  // CS 211 — Programming 2 (MWF 9:00-10:00)
  {
    id: 'sched-1',
    classId: 'class-1',
    days: ['Mon', 'Wed', 'Fri'],
    startTime: '09:00',
    endTime: '10:00',
    type: 'lecture',
  },
  // CS 221 — Discrete Mathematics (TTh 10:00-11:30)
  {
    id: 'sched-2',
    classId: 'class-2',
    days: ['Tue', 'Thu'],
    startTime: '10:00',
    endTime: '11:30',
    type: 'lecture',
  },
  // CS 231 — Computer Organization (MWF 11:00-12:00)
  {
    id: 'sched-3',
    classId: 'class-3',
    days: ['Mon', 'Wed', 'Fri'],
    startTime: '11:00',
    endTime: '12:00',
    type: 'lecture',
  },
  // PE 201 — Physical Education 3 (W 14:00-16:00)
  {
    id: 'sched-4',
    classId: 'class-4',
    days: ['Wed'],
    startTime: '14:00',
    endTime: '16:00',
    type: 'PE',
  },
  // ENG 211 — Purposive Communication (TTh 13:00-14:30)
  {
    id: 'sched-5',
    classId: 'class-5',
    days: ['Tue', 'Thu'],
    startTime: '13:00',
    endTime: '14:30',
    type: 'lecture',
  },
];

export const getSchedulesByClass = (classId: string): ClassSchedule[] =>
  classSchedules.filter((s) => s.classId === classId);

export const getScheduleById = (id: string): ClassSchedule | undefined =>
  classSchedules.find((s) => s.id === id);

/** Returns which schedule (if any) is active for a given class on a given day name */
export const getScheduleForDay = (
  classId: string,
  dayName: string,
): ClassSchedule | undefined =>
  classSchedules.find(
    (s) => s.classId === classId && s.days.includes(dayName as ClassSchedule['days'][0]),
  );
