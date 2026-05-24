Implement the Grades Domain of a frontend-only university LMS.

ONLY IMPLEMENT:
- grade tables
- GPA computation
- remarks
- Dean’s List qualification logic
- faculty grade encoding

DO NOT IMPLEMENT:
- transcript generation
- ranking systems
- curriculum evaluation
- graduation clearance
- analytics dashboards
- notifications
- backend/database integration
- real-time syncing

The grades domain must integrate with existing LMS schemas and relationships.

Connect to:
- students
- subjects
- classes
- sections
- instructors
- enrollment records
- grading periods
- grade records

Use relational mock datasets and reusable hooks.

-----------------------------------
GRADE TABLES
-----------------------------------

Implement dynamic grade tables for:
- student view
- faculty view

Faculty must be able to:
- encode grades
- edit grades
- save draft grades
- finalize grades

Students must only:
- view grades
- view GPA
- view remarks
- view DL qualification

Grade table fields:
- student
- subject
- section
- instructor
- units
- prelim grade
- midterm grade
- final grade
- overall grade
- remarks

Support:
- sortable columns
- searchable rows
- filtering
- pagination
- sticky headers

-----------------------------------
FACULTY GRADE ENCODING
-----------------------------------

Faculty can only manage:
- assigned classes
- assigned sections
- handled subjects

Validation rules:
- prevent invalid grade ranges
- prevent duplicate records
- prevent editing finalized grades
- validate enrolled students only

Support:
- bulk grade entry
- inline editing
- draft state
- finalized state

Grade statuses:
- Draft
- Submitted
- Finalized

-----------------------------------
GRADE COMPUTATION
-----------------------------------

Implement automatic grade computation.

The system must:
- compute overall grades
- compute weighted grades
- compute GPA dynamically

Support configurable grading weights.

Example:
- Prelim = 30%
- Midterm = 30%
- Final = 40%

GPA computation must:
- multiply grades by units
- compute weighted averages
- update live

Support:
- semester GPA
- cumulative GPA

-----------------------------------
REMARKS LOGIC
-----------------------------------

Automatically generate remarks.

Examples:
- Passed
- Failed
- Incomplete
- Dropped

Remarks must depend on:
- final grade
- completion status
- subject state

Support configurable passing thresholds.

-----------------------------------
DEAN’S LIST LOGIC
-----------------------------------

Implement automatic Dean’s List qualification.

Validation examples:
- minimum GPA threshold
- no failing grades
- no incomplete grades
- minimum unit load

The system must:
- compute eligibility dynamically
- show qualification badges
- explain disqualifications

Example:
"Disqualified due to failing grade in Calculus"

-----------------------------------
RELATIONSHIP-AWARE LOGIC
-----------------------------------

The system must resolve relationships between:
- students
- enrolled subjects
- instructors
- sections
- grading periods
- grade records

Rules:
- only enrolled students receive grades
- faculty only access assigned classes
- GPA uses enrolled subjects only
- DL evaluation uses finalized grades only

-----------------------------------
DATA REQUIREMENTS
-----------------------------------

Create relational datasets.

Recommended files:
- grades.ts
- grading-periods.ts
- grade-settings.ts
- gpa-rules.ts
- dl-rules.ts
- instructor-loads.ts

-----------------------------------
REQUIRED HOOKS
-----------------------------------

Implement:
- useGradeTable
- useGradeComputation
- useGPAComputation
- useRemarksLogic
- useDLQualification
- useFacultyGradeEncoding

Hooks must contain:
- grade computations
- validation logic
- GPA calculations
- filtering
- memoized selectors
- relationship resolution

-----------------------------------
UI REQUIREMENTS
-----------------------------------

Build:
- faculty grading table
- student grades page
- GPA summary cards
- DL qualification indicators
- grade status badges

Use:
- responsive tables
- sticky headers
- inline editing
- dialogs
- loading states
- empty states
- searchable filters
- grade highlights

-----------------------------------
VALIDATIONS
-----------------------------------

Implement:
- grade range validation
- duplicate grade prevention
- finalized grade locking
- enrolled student validation
- GPA validation
- DL qualification checks

-----------------------------------
EXPECTED OUTPUT
-----------------------------------

Generate:
- grades domain architecture
- relational mock datasets
- reusable hooks
- faculty grading system
- student grades pages
- GPA computation engine
- remarks logic
- DL qualification logic
- scalable frontend-only grading module

Focus on:
- relationship-aware grading logic
- realistic academic grading behavior
- maintainable frontend architecture
- reusable code organization
- future backend migration readiness