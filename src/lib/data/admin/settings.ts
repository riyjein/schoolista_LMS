// ─── Types ────────────────────────────────────────────────────────────────────

export interface SystemSetting {
  id: string;
  category: SettingCategory;
  key: string;
  label: string;
  description: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select' | 'date';
  options?: string[];
  isEditable: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export type SettingCategory =
  | 'academic'
  | 'enrollment'
  | 'grading'
  | 'attendance'
  | 'financial'
  | 'system'
  | 'notifications';

export interface SettingsByCategory {
  category: SettingCategory;
  label: string;
  settings: SystemSetting[];
}

// ─── System Settings Data ─────────────────────────────────────────────────────

export const systemSettings: SystemSetting[] = [
  // Academic Settings
  {
    id: 'set-1',
    category: 'academic',
    key: 'current_school_year',
    label: 'Current School Year',
    description: 'The active academic year for the system',
    value: '2024-2025',
    type: 'text',
    isEditable: true,
    lastModifiedBy: 'admin-1',
    lastModifiedAt: '2024-06-15',
  },
  {
    id: 'set-2',
    category: 'academic',
    key: 'current_semester',
    label: 'Current Semester',
    description: 'The active semester for the system',
    value: '1st',
    type: 'select',
    options: ['1st', '2nd', 'Summer'],
    isEditable: true,
    lastModifiedBy: 'admin-1',
    lastModifiedAt: '2024-08-20',
  },
  {
    id: 'set-3',
    category: 'academic',
    key: 'passing_grade',
    label: 'Passing Grade',
    description: 'Minimum grade required to pass a subject',
    value: 75,
    type: 'number',
    isEditable: true,
    lastModifiedBy: 'u4',
    lastModifiedAt: '2023-05-10',
  },
  {
    id: 'set-4',
    category: 'academic',
    key: 'deans_list_gpa',
    label: "Dean's List Minimum GPA",
    description: "Minimum GPA required for Dean's List eligibility",
    value: 80,
    type: 'number',
    isEditable: true,
    lastModifiedBy: 'u4',
    lastModifiedAt: '2023-05-10',
  },

  // Enrollment Settings
  {
    id: 'set-5',
    category: 'enrollment',
    key: 'enrollment_start_date',
    label: 'Enrollment Start Date',
    description: 'When enrollment period begins',
    value: '2024-11-01',
    type: 'date',
    isEditable: true,
    lastModifiedBy: 'admin-1',
    lastModifiedAt: '2024-10-15',
  },
  {
    id: 'set-6',
    category: 'enrollment',
    key: 'enrollment_end_date',
    label: 'Enrollment End Date',
    description: 'When enrollment period ends',
    value: '2024-12-15',
    type: 'date',
    isEditable: true,
    lastModifiedBy: 'admin-1',
    lastModifiedAt: '2024-10-15',
  },
  {
    id: 'set-7',
    category: 'enrollment',
    key: 'max_units_regular',
    label: 'Maximum Units (Regular)',
    description: 'Maximum units a regular student can enroll in',
    value: 21,
    type: 'number',
    isEditable: true,
  },
  {
    id: 'set-8',
    category: 'enrollment',
    key: 'min_units_fulltime',
    label: 'Minimum Units (Full-time)',
    description: 'Minimum units required for full-time status',
    value: 15,
    type: 'number',
    isEditable: true,
  },

  // Grading Settings
  {
    id: 'set-9',
    category: 'grading',
    key: 'prelim_weight',
    label: 'Prelim Weight (%)',
    description: 'Weight of preliminary grades in final computation',
    value: 33.33,
    type: 'number',
    isEditable: true,
  },
  {
    id: 'set-10',
    category: 'grading',
    key: 'midterm_weight',
    label: 'Midterm Weight (%)',
    description: 'Weight of midterm grades in final computation',
    value: 33.33,
    type: 'number',
    isEditable: true,
  },
  {
    id: 'set-11',
    category: 'grading',
    key: 'final_weight',
    label: 'Final Weight (%)',
    description: 'Weight of final grades in final computation',
    value: 33.34,
    type: 'number',
    isEditable: true,
  },
  {
    id: 'set-12',
    category: 'grading',
    key: 'grade_submission_deadline_days',
    label: 'Grade Submission Deadline (Days)',
    description: 'Days after exam period to submit final grades',
    value: 7,
    type: 'number',
    isEditable: true,
  },

  // Attendance Settings
  {
    id: 'set-13',
    category: 'attendance',
    key: 'attendance_required_percentage',
    label: 'Required Attendance (%)',
    description: 'Minimum attendance percentage to pass',
    value: 75,
    type: 'number',
    isEditable: true,
  },
  {
    id: 'set-14',
    category: 'attendance',
    key: 'late_minutes_threshold',
    label: 'Late Threshold (Minutes)',
    description: 'Minutes after start time before marked late',
    value: 15,
    type: 'number',
    isEditable: true,
  },

  // Financial Settings
  {
    id: 'set-15',
    category: 'financial',
    key: 'tuition_per_unit',
    label: 'Tuition Per Unit',
    description: 'Cost per academic unit',
    value: 1500,
    type: 'number',
    isEditable: true,
    lastModifiedBy: 'u5',
    lastModifiedAt: '2024-03-01',
  },
  {
    id: 'set-16',
    category: 'financial',
    key: 'late_payment_penalty',
    label: 'Late Payment Penalty (%)',
    description: 'Percentage penalty for late payments',
    value: 5,
    type: 'number',
    isEditable: true,
  },
  {
    id: 'set-17',
    category: 'financial',
    key: 'payment_deadline_days',
    label: 'Payment Deadline (Days)',
    description: 'Days after enrollment to complete payment',
    value: 30,
    type: 'number',
    isEditable: true,
  },

  // System Settings
  {
    id: 'set-18',
    category: 'system',
    key: 'system_name',
    label: 'System Name',
    description: 'Name of the learning management system',
    value: 'University LMS',
    type: 'text',
    isEditable: true,
  },
  {
    id: 'set-19',
    category: 'system',
    key: 'maintenance_mode',
    label: 'Maintenance Mode',
    description: 'Enable system maintenance mode',
    value: false,
    type: 'boolean',
    isEditable: true,
  },
  {
    id: 'set-20',
    category: 'system',
    key: 'session_timeout_minutes',
    label: 'Session Timeout (Minutes)',
    description: 'User session timeout duration',
    value: 30,
    type: 'number',
    isEditable: true,
  },

  // Notification Settings
  {
    id: 'set-21',
    category: 'notifications',
    key: 'email_notifications',
    label: 'Email Notifications',
    description: 'Enable email notifications',
    value: true,
    type: 'boolean',
    isEditable: true,
  },
  {
    id: 'set-22',
    category: 'notifications',
    key: 'grade_release_notification',
    label: 'Grade Release Notifications',
    description: 'Notify students when grades are posted',
    value: true,
    type: 'boolean',
    isEditable: true,
  },
  {
    id: 'set-23',
    category: 'notifications',
    key: 'enrollment_reminder_days',
    label: 'Enrollment Reminder (Days Before)',
    description: 'Days before deadline to send enrollment reminders',
    value: 7,
    type: 'number',
    isEditable: true,
  },
];

// ─── Group Settings by Category ───────────────────────────────────────────────

export const settingsByCategory: SettingsByCategory[] = [
  {
    category: 'academic',
    label: 'Academic Settings',
    settings: systemSettings.filter((s) => s.category === 'academic'),
  },
  {
    category: 'enrollment',
    label: 'Enrollment Settings',
    settings: systemSettings.filter((s) => s.category === 'enrollment'),
  },
  {
    category: 'grading',
    label: 'Grading Settings',
    settings: systemSettings.filter((s) => s.category === 'grading'),
  },
  {
    category: 'attendance',
    label: 'Attendance Settings',
    settings: systemSettings.filter((s) => s.category === 'attendance'),
  },
  {
    category: 'financial',
    label: 'Financial Settings',
    settings: systemSettings.filter((s) => s.category === 'financial'),
  },
  {
    category: 'system',
    label: 'System Settings',
    settings: systemSettings.filter((s) => s.category === 'system'),
  },
  {
    category: 'notifications',
    label: 'Notification Settings',
    settings: systemSettings.filter((s) => s.category === 'notifications'),
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getSettingByKey = (key: string): SystemSetting | undefined =>
  systemSettings.find((s) => s.key === key);

export const getSettingsByCategory = (category: SettingCategory): SystemSetting[] =>
  systemSettings.filter((s) => s.category === category);
