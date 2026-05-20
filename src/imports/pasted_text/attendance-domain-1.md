You’re a Front-end developer tasked to Implement the Attendance Domain of a frontend-only university LMS.

ONLY IMPLEMENT:
- RFID simulation
- attendance logging
- attendance calendar
- attendance history

DO NOT IMPLEMENT:
- biometrics
- facial recognition
- NFC hardware
- real RFID readers
- payroll
- grading integration
- notifications
- analytics dashboards
- backend/database integration
- real-time sockets

The attendance domain must integrate with existing LMS schemas and relationships.

Connect to:
- students
- classes
- subjects
- schedules
- instructors
- enrollment records
- sections
- attendance records

Use relational mock datasets and reusable hooks.

-----------------------------------
RFID SIMULATION
-----------------------------------

Implement a realistic RFID tap flow.

Flow:
- student taps RFID card
- resolve student record
- validate enrolled class
- validate active schedule
- create attendance record

Support:
- valid RFID
- unknown RFID
- duplicate taps
- invalid schedules
- late detection

UI:
- RFID scanner panel
- tap animation
- scanning states
- success/error feedback
- student preview card
- attendance status badges

RFID dataset:
- RFID id
- student id
- card number
- card status
- tap timestamp

-----------------------------------
ATTENDANCE LOGGING
-----------------------------------

Attendance records must connect to:
- student
- subject
- instructor
- class schedule
- section
- attendance session

Attendance fields:
- attendance id
- student id
- subject id
- class id
- instructor id
- section id
- date
- time-in
- status
- remarks

Statuses:
- Present
- Late
- Absent
- Excused

Validations:
- student is enrolled
- active schedule exists
- attendance not yet logged
- valid attendance window

Prevent duplicate taps within the same session.

-----------------------------------
ATTENDANCE SESSION LOGIC
-----------------------------------

Tie attendance sessions to schedules.

Example:
CS101
Monday
9:00 AM - 10:30 AM

Attendance rules:
- too early → invalid
- outside schedule → invalid
- beyond threshold → Late

Configurable:
- opening buffer
- late threshold
- closing window

-----------------------------------
ATTENDANCE CALENDAR
-----------------------------------

Create attendance calendar views.

Requirements:
- monthly view
- weekly view
- attendance per day
- subject filters

Status indicators:
- Present
- Late
- Absent
- Excused

Interactions:
- click date to view logs
- hover summaries
- legends
- subject filtering

Support:
- student view
- instructor view

-----------------------------------
ATTENDANCE HISTORY
-----------------------------------

Implement searchable attendance history.

Support:
- filtering
- searching
- sorting
- pagination
- grouped logs

Filters:
- subject
- date range
- status
- instructor
- section

Each row:
- date
- subject
- instructor
- section
- time-in
- status
- remarks

Include:
- attendance percentage
- absence counts
- late counts

-----------------------------------
RELATIONSHIP-AWARE LOGIC
-----------------------------------

The system must resolve relationships between:
- enrolled students
- schedules
- instructors
- sections
- attendance sessions

Rules:
- only enrolled students can tap
- attendance tied to enrolled section
- instructor view only shows handled classes
- attendance records linked to correct schedules

-----------------------------------
DATA REQUIREMENTS
-----------------------------------

Create relational datasets.

Recommended files:
- attendance-records.ts
- attendance-sessions.ts
- attendance-settings.ts
- rfid-cards.ts
- schedules.ts
- class-offerings.ts

-----------------------------------
REQUIRED HOOKS
-----------------------------------

Implement:
- useRFIDScanner
- useAttendanceLogger
- useAttendanceValidation
- useAttendanceCalendar
- useAttendanceHistory
- useAttendanceSessions

Hooks must contain:
- derived logic
- relationship validation
- attendance computation
- filtering
- memoized selectors

-----------------------------------
UI REQUIREMENTS
-----------------------------------

Build:
- RFID scanner panel
- attendance logs table
- attendance calendar
- attendance history page
- attendance session indicators

Use:
- sticky filters
- searchable tables
- responsive layouts
- loading states
- empty states
- badges
- dialogs
- hover cards
- legends

-----------------------------------
VALIDATIONS
-----------------------------------

Implement:
- duplicate attendance prevention
- schedule validation
- enrolled student validation
- active session validation
- invalid RFID handling
- late detection
- attendance window validation

-----------------------------------
EXPECTED OUTPUT
-----------------------------------

Generate:
- attendance domain architecture
- relational mock datasets
- reusable hooks
- attendance pages
- RFID simulation flow
- attendance validation logic
- attendance calendar
- searchable attendance history
- scalable frontend-only attendance module

Focus on:
- relationship-aware attendance logic
- realistic academic attendance behavior
- reusable frontend architecture
- maintainable code organization
- future backend migration readiness 

