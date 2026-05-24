Scope (ONLY IMPLEMENT THESE)

Enrollment Features
- Subject selection
- Prerequisite validation
- Unit computation
- Duplicate subject detection
- Enrollment summary
- Receipt upload mock flow
- Suggested enrollment generation

DO NOT implement:
- grading
- schedules
- professor assignment
- real payment gateways
- transcript generation
- authentication
- notifications
- admin analytics
- backend/database integration

System Architecture Requirements

The enrollment domain must behave like a real registrar system despite being frontend-only.

All logic must be:
- relationship-aware
- rule-driven
- modular
- scalable
- reusable

The system should simulate real academic enrollment constraints using mock datasets and intelligent frontend validation.

Data Architecture Requirements

Create structured frontend mock datasets inside:

/data

Recommended datasets:
- courses.ts
- curriculum.ts
- subjects.ts
- prerequisites.ts
- completed-subjects.ts
- tuition-rates.ts
- students.ts
- enrollment-history.ts
- receipts.ts

All entities must be relational.

Example relationships:
- curriculum subjects belong to course/year
- subjects may have prerequisites
- subjects may be major/minor
- students have completed subjects
- enrollment history affects duplicate detection

Enrollment Flow (Refined)

STEP 1 — Student Context Selection

The student selects:
- course (default = BS Computer Science)
- year level
- semester

UI Requirements:
- modern wizard/stepper interface
- responsive card/grid layouts
- searchable dropdowns
- progress indicator

STEP 2 — Completed Subjects Selection

The student sees all previously available subjects and selects completed subjects.

Requirements:
- grouped by year/semester
- “Select All Passed Subjects” shortcut

subject status indicators:
- completed
- failed
- unavailable
- locked by prerequisite

- persistent frontend state

Must support:
- manual selection
- bulk selection
- deselection

Relationship-Aware Enrollment Logic

Implement advanced enrollment intelligence.

Prerequisite Validation

The system must:
- validate prerequisites dynamically
- lock unavailable subjects
- explain WHY a subject is locked
- visually indicate prerequisite chains

Example:
Data Structures requires Programming 2

If prerequisite is incomplete:
- disable enrollment
- show warning tooltip/message

Duplicate Subject Detection

The system must prevent:
- enrolling already completed subjects
- enrolling already enrolled subjects
- duplicate selections

Must show:
- inline warnings
- conflict badges
- automatic filtering

Unit Computation Engine

Create a dynamic unit calculator.

Must:
- compute total units live
- enforce min/max unit constraints
- warn overload/underload

Example:
Minimum: 15
Maximum: 24

UI:
- sticky enrollment summary panel
- real-time updates

Smart Subject Recommendation Engine

The system should generate intelligent suggested subjects based on:
- completed subjects
- prerequisite chains
- subject availability
- preferred enrollment strategy

Enrollment Strategy Selector

Student chooses:

Major Priority

Focus on major/core subjects first.

Pros:
- faster progression in core curriculum
- prepares for advanced subjects earlier

Cons:
- heavier academic load

Minor Priority

Focus on general education/minor subjects first.

Pros:
- lighter workload
- easier semester management

Cons:
- delays core progression

Balanced

Mix of major and minor subjects.

Pros:
- balanced workload
- flexible progression

Cons:
- slower specialization

Suggested Enrollment Behavior

After strategy selection:
- auto-generate recommended subjects
- intelligently fill unit limits
- prioritize unlocked subjects only

IMPORTANT:
- suggestions are editable
- students can add/remove subjects manually
- all validations must still apply

Enrollment Summary Page

After approval, display a complete enrollment summary.

Must include:
- selected subjects
- subject type (major/minor)
- units per subject
- total units
- tuition breakdown
- miscellaneous fees
- estimated total cost

Use mock tuition data.

Example:
₱1,500 per unit
misc fees

Receipt Upload Mock Flow

After enrollment summary:

Student uploads:
- mock receipt image
- payment proof

Requirements:
- drag-and-drop upload UI
- image preview
- mock upload progress
- frontend persistence only

IMPORTANT:
Uploaded receipt metadata must persist inside frontend datasets/hooks because this will later feed the Financial Reports domain.

Store:
- student id
- receipt filename
- amount
- timestamp
- enrollment reference

NO real cloud upload.

Final Enrollment State

After submission:
- mark student as enrolled
- generate mock enrollment record
- persist in frontend state/data layer
- show success confirmation page

Include:
- enrollment reference number
- downloadable mock receipt
- printable summary layout

Technical Requirements

Must use:
- reusable hooks
- strict TypeScript types
- modular architecture
- feature-based folders

Suggested structure:

/features/enrollment
  /components
  /hooks
  /utils
  /types
  /data
  /schemas

Required Hooks

Examples:
- useEnrollmentFlow
- useSubjectValidation
- useUnitComputation
- useEnrollmentSuggestions
- useReceiptUpload
- useEnrollmentSummary

Validation Rules

Implement:
- prerequisite checking
- duplicate prevention
- unit constraints
- enrollment conflicts
- invalid subject filtering

Expected Output

Generate:
- complete frontend architecture
- TypeScript types
- mock datasets
- hooks logic
- reusable components
- enrollment flow pages
- realistic mock behavior
- scalable frontend-only LMS enrollment system

Focus heavily on:
- relationship-aware logic
- maintainable architecture
- realistic registrar behavior
- production-quality frontend patterns
- future backend migration readiness