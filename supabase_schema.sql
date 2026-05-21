  -- Supabase / Postgres schema derived from src/lib/types and src/lib/data.
  -- Notes:
  -- 1. IDs are kept as text to match the existing app fixtures.
  -- 2. Array-like relations are normalized into join tables when they carry FKs.
  -- 3. Derived analytics data in src/lib/data/stakeholders and src/lib/data/program-chair
  --    is intentionally omitted because it is computed from the core tables below.

  create extension if not exists pgcrypto;

  -- Enums
  create type user_role as enum ('student', 'faculty', 'program-chair', 'stakeholder', 'admin');
  create type user_status as enum ('active', 'inactive', 'suspended');

  create type subject_type as enum ('major', 'minor', 'GE', 'elective', 'PE', 'NSTP');
  create type academic_semester as enum ('1st', '2nd', 'Summer');
  create type enrollment_strategy as enum ('major-priority', 'minor-priority', 'balanced');
  create type enrollment_status as enum ('draft', 'submitted', 'approved', 'rejected');
  create type subject_status as enum ('available', 'locked', 'completed', 'failed', 'enrolled', 'duplicate');

  create type attendance_status as enum ('present', 'late', 'absent', 'excused');
  create type day_of_week as enum ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
  create type card_status as enum ('active', 'inactive', 'lost', 'expired');
  create type session_status as enum ('upcoming', 'open', 'closed');
  create type schedule_type as enum ('lecture', 'lab', 'PE');

  create type eval_status as enum ('draft', 'submitted');
  create type question_type as enum ('rating', 'textarea');

  create type grade_status as enum ('draft', 'submitted', 'finalized');
  create type grade_remark as enum ('Passed', 'Failed', 'Incomplete', 'No Grade', 'Dropped');
  create type dl_badge as enum ('summa', 'magna', 'cum-laude', 'none');

  create type announcement_priority as enum ('low', 'medium', 'high', 'urgent');
  create type announcement_status as enum ('draft', 'published', 'archived');
  create type announcement_audience as enum ('all', 'students', 'faculty', 'program-chairs', 'stakeholders');

  create type setting_category as enum (
    'academic',
    'enrollment',
    'grading',
    'attendance',
    'financial',
    'system',
    'notifications'
  );
  create type setting_value_type as enum ('text', 'number', 'boolean', 'select', 'date');

  create type payment_type as enum ('full', 'partial');
  create type payment_status as enum ('paid-in-full', 'partially-paid', 'unpaid', 'overdue');
  create type payment_method as enum ('cash', 'bank-transfer', 'credit-card', 'online');

  create type room_type as enum ('classroom', 'laboratory', 'gymnasium', 'auditorium');
  create type submission_action as enum ('save_draft', 'submit', 'finalize', 'bulk_submit', 'bulk_finalize');

  -- Core identity / catalog
  create table users (
    id text primary key,
    name text not null,
    email text not null unique,
    role user_role not null,
    avatar_initials text not null,
    department text,
    student_number text unique,
    employee_id text unique,
    year_level smallint check (year_level between 1 and 4),
    program text,
    status user_status not null default 'active',
    created_at timestamptz not null default now(),
    last_login timestamptz
  );

  create table courses (
    id text primary key,
    code text not null unique,
    name text not null,
    department text not null,
    total_units integer not null check (total_units >= 0),
    years integer not null check (years > 0)
  );

  create table subjects (
    id text primary key,
    code text not null unique,
    title text not null,
    units integer not null check (units >= 0),
    lec_units integer not null check (lec_units >= 0),
    lab_units integer not null check (lab_units >= 0),
    type subject_type not null,
    department text not null,
    description text not null
  );

  create table rooms (
    id text primary key,
    code text not null unique,
    name text not null unique,
    building text not null,
    capacity integer not null check (capacity > 0),
    type room_type not null
  );

  create table sections (
    id text primary key,
    code text not null unique,
    course_id text not null,
    year_level smallint not null check (year_level between 1 and 4),
    school_year text not null,
    semester academic_semester not null,
    max_students integer not null check (max_students > 0)
  );

  -- Enrollment / curriculum
  create table student_profiles (
    id text primary key,
    user_id text not null unique references users(id) on delete restrict,
    name text not null,
    student_number text not null unique,
    course_id text not null references courses(id) on delete restrict,
    year_level smallint not null check (year_level between 1 and 4),
    current_semester academic_semester not null,
    school_year text not null,
    status text not null check (status in ('regular', 'irregular', 'loa', 'graduated'))
  );

  create table curriculum_entries (
    id text primary key,
    course_id text not null references courses(id) on delete cascade,
    subject_id text not null references subjects(id) on delete cascade,
    year_level smallint not null check (year_level between 1 and 4),
    semester academic_semester not null,
    is_required boolean not null default true,
    unique (course_id, subject_id, year_level, semester)
  );

  create table prerequisites (
    subject_id text not null references subjects(id) on delete cascade,
    requires_subject_id text not null references subjects(id) on delete cascade,
    primary key (subject_id, requires_subject_id),
    check (subject_id <> requires_subject_id)
  );

  create table completed_subjects (
    student_id text not null references student_profiles(id) on delete cascade,
    subject_id text not null references subjects(id) on delete cascade,
    grade numeric(5,2) not null,
    year_level smallint not null check (year_level between 1 and 4),
    semester academic_semester not null,
    school_year text not null,
    passed boolean not null,
    primary key (student_id, subject_id, school_year, semester)
  );

  create table tuition_rates (
    course_id text primary key references courses(id) on delete cascade,
    per_lec_unit numeric(12,2) not null check (per_lec_unit >= 0),
    per_lab_unit numeric(12,2) not null check (per_lab_unit >= 0)
  );

  create table tuition_misc_fees (
    id bigserial primary key,
    course_id text not null references tuition_rates(course_id) on delete cascade,
    name text not null,
    amount numeric(12,2) not null check (amount >= 0),
    unique (course_id, name)
  );

  create table enrollment_records (
    id text primary key,
    reference_number text not null unique,
    student_id text not null references student_profiles(id) on delete cascade,
    course_id text not null references courses(id) on delete restrict,
    year_level smallint not null check (year_level between 1 and 4),
    semester academic_semester not null,
    school_year text not null,
    total_units integer not null check (total_units >= 0),
    status enrollment_status not null,
    submitted_at timestamptz not null,
    receipt_id text unique
  );

  create table enrollment_record_subjects (
    enrollment_id text not null references enrollment_records(id) on delete cascade,
    subject_id text not null references subjects(id) on delete cascade,
    primary key (enrollment_id, subject_id)
  );

  create table receipts (
    id text primary key,
    student_id text not null references student_profiles(id) on delete cascade,
    enrollment_id text not null unique references enrollment_records(id) on delete cascade,
    filename text not null,
    file_size bigint not null check (file_size >= 0),
    uploaded_at timestamptz not null,
    amount numeric(12,2) not null check (amount >= 0),
    reference_number text not null unique,
    status text not null check (status in ('pending', 'verified', 'rejected')),
    preview_url text
  );

  alter table enrollment_records
    add constraint enrollment_records_receipt_fk
    foreign key (receipt_id) references receipts(id) on delete set null;

  create table payment_records (
    id text primary key,
    student_id text not null references student_profiles(id) on delete cascade,
    enrollment_id text not null unique references enrollment_records(id) on delete cascade,
    total_tuition numeric(12,2) not null check (total_tuition >= 0),
    amount_paid numeric(12,2) not null check (amount_paid >= 0),
    remaining_balance numeric(12,2) not null check (remaining_balance >= 0),
    payment_type payment_type not null,
    payment_status payment_status not null,
    due_date date not null,
    last_payment_date date,
    installment_total_installments smallint,
    installment_amount_per_installment numeric(12,2),
    installment_paid_installments smallint,
    installment_next_due_date date
  );

  create table payment_transactions (
    id text primary key,
    payment_record_id text not null references payment_records(id) on delete cascade,
    date date not null,
    amount numeric(12,2) not null check (amount >= 0),
    method payment_method not null,
    reference_number text not null unique,
    receipt_id text references receipts(id) on delete set null
  );

  -- Attendance
  create table instructors (
    id text primary key,
    user_id text not null unique references users(id) on delete restrict,
    name text not null,
    employee_id text not null unique,
    department text not null
  );

  create table class_offerings (
    id text primary key,
    subject_id text not null references subjects(id) on delete restrict,
    instructor_id text not null references instructors(id) on delete restrict,
    section_code text not null references sections(code) on delete restrict,
    school_year text not null,
    semester academic_semester not null,
    room text not null,
    max_students integer not null check (max_students > 0)
  );

  create table class_offering_students (
    class_id text not null references class_offerings(id) on delete cascade,
    student_id text not null references student_profiles(id) on delete cascade,
    primary key (class_id, student_id)
  );

  create table class_schedules (
    id text primary key,
    class_id text not null references class_offerings(id) on delete cascade,
    start_time time not null,
    end_time time not null,
    type schedule_type not null,
    check (end_time > start_time)
  );

  create table class_schedule_days (
    schedule_id text not null references class_schedules(id) on delete cascade,
    day day_of_week not null,
    primary key (schedule_id, day)
  );

  create table attendance_settings (
    id text primary key default 'default',
    opening_buffer_minutes integer not null check (opening_buffer_minutes >= 0),
    late_threshold_minutes integer not null check (late_threshold_minutes >= 0),
    closing_window_minutes integer not null check (closing_window_minutes >= 0)
  );

  create table attendance_sessions (
    id text primary key,
    class_id text not null references class_offerings(id) on delete cascade,
    schedule_id text not null references class_schedules(id) on delete cascade,
    session_date date not null,
    open_time time not null,
    close_time time not null,
    late_after time not null,
    status session_status not null,
    unique (class_id, schedule_id, session_date)
  );

  create table rfid_cards (
    id text primary key,
    student_id text references student_profiles(id) on delete set null,
    card_number text not null unique,
    card_status card_status not null,
    last_tap_time timestamptz
  );

  create table attendance_records (
    id text primary key,
    session_id text not null references attendance_sessions(id) on delete cascade,
    student_id text not null references student_profiles(id) on delete cascade,
    class_id text not null references class_offerings(id) on delete cascade,
    subject_id text not null references subjects(id) on delete restrict,
    instructor_id text not null references instructors(id) on delete restrict,
    section_code text not null,
    record_date date not null,
    time_in time,
    status attendance_status not null,
    remarks text,
    rfid_card_id text references rfid_cards(id) on delete set null,
    unique (session_id, student_id)
  );

  -- Evaluation
  create table evaluation_categories (
    id text primary key,
    label text not null,
    description text not null,
    weight numeric(5,4) not null check (weight >= 0 and weight <= 1),
    color text not null
  );

  create table evaluation_questions (
    id text primary key,
    category_id text not null references evaluation_categories(id) on delete cascade,
    text text not null,
    type question_type not null,
    required boolean not null default true,
    sort_order integer not null,
    unique (category_id, sort_order)
  );

  create table evaluation_records (
    id text primary key,
    student_id text not null references student_profiles(id) on delete cascade,
    class_id text not null references class_offerings(id) on delete cascade,
    instructor_id text not null references instructors(id) on delete restrict,
    subject_id text not null references subjects(id) on delete restrict,
    section_code text not null,
    semester academic_semester not null,
    school_year text not null,
    status eval_status not null,
    submitted_at timestamptz,
    unique (student_id, class_id)
  );

  create table evaluation_answers (
    evaluation_record_id text not null references evaluation_records(id) on delete cascade,
    question_id text not null references evaluation_questions(id) on delete cascade,
    rating integer check (rating between 1 and 5),
    comment text,
    primary key (evaluation_record_id, question_id),
    check (
      (rating is not null and comment is null)
      or (rating is null and comment is not null)
      or (rating is not null and comment is not null)
    )
  );

  create table evaluation_settings (
    id text primary key default 'default',
    rating_scale integer not null check (rating_scale > 0),
    rating_labels jsonb not null,
    min_label text not null,
    max_label text not null
  );

  -- Grading
  create table grade_records (
    id text primary key,
    student_id text not null references student_profiles(id) on delete cascade,
    class_id text not null references class_offerings(id) on delete cascade,
    subject_id text not null references subjects(id) on delete restrict,
    instructor_id text not null references instructors(id) on delete restrict,
    section_code text not null,
    school_year text not null,
    semester academic_semester not null,
    year_level smallint not null check (year_level between 1 and 4),
    prelim_grade numeric(5,2),
    midterm_grade numeric(5,2),
    final_grade numeric(5,2),
    status grade_status not null,
    unique (student_id, class_id)
  );

  create table grading_periods (
    id text primary key,
    label text not null,
    short_label text not null,
    field_name text not null check (field_name in ('prelimGrade', 'midtermGrade', 'finalGrade')),
    sort_order integer not null,
    weight numeric(5,4) not null check (weight >= 0 and weight <= 1),
    unique (field_name)
  );

  create table grade_settings (
    id text primary key default 'default',
    prelim_weight numeric(5,4) not null check (prelim_weight >= 0 and prelim_weight <= 1),
    midterm_weight numeric(5,4) not null check (midterm_weight >= 0 and midterm_weight <= 1),
    final_weight numeric(5,4) not null check (final_weight >= 0 and final_weight <= 1),
    passing_grade numeric(5,2) not null check (passing_grade >= 0)
  );

  create table dl_rules (
    id text primary key default 'default',
    max_gpa numeric(5,2) not null check (max_gpa >= 0),
    cum_laude_max_gpa numeric(5,2) not null check (cum_laude_max_gpa >= 0),
    magna_max_gpa numeric(5,2) not null check (magna_max_gpa >= 0),
    summa_max_gpa numeric(5,2) not null check (summa_max_gpa >= 0),
    min_units integer not null check (min_units >= 0),
    allow_failing boolean not null default false,
    allow_incomplete boolean not null default false
  );

  -- Admin / system
  create table system_settings (
    id text primary key,
    category setting_category not null,
    key text not null unique,
    label text not null,
    description text not null,
    value_jsonb jsonb not null,
    value_type setting_value_type not null,
    options text[],
    is_editable boolean not null default true,
    last_modified_by text references users(id) on delete set null,
    last_modified_at timestamptz
  );

  create table announcements (
    id text primary key,
    title text not null,
    content text not null,
    priority announcement_priority not null,
    status announcement_status not null,
    audience announcement_audience[] not null,
    author_id text not null references users(id) on delete restrict,
    author_name text not null,
    created_at timestamptz not null,
    published_at timestamptz,
    expires_at timestamptz,
    is_pinned boolean not null default false,
    view_count integer not null default 0 check (view_count >= 0)
  );

  create table faculty_loads (
    id text primary key,
    instructor_id text not null references instructors(id) on delete cascade,
    class_id text not null references class_offerings(id) on delete cascade,
    subject_id text not null references subjects(id) on delete restrict,
    section_code text not null,
    school_year text not null,
    semester academic_semester not null,
    room text not null,
    max_students integer not null check (max_students > 0),
    unique (instructor_id, class_id)
  );

  create table submission_logs (
    id text primary key,
    class_id text not null references class_offerings(id) on delete cascade,
    instructor_id text not null references instructors(id) on delete restrict,
    action submission_action not null,
    timestamp timestamptz not null,
    note text
  );

  create table submission_log_students (
    submission_log_id text not null references submission_logs(id) on delete cascade,
    student_id text not null references student_profiles(id) on delete cascade,
    primary key (submission_log_id, student_id)
  );

  -- Helpful indexes for common lookups
  create index idx_student_profiles_course_id on student_profiles(course_id);
  create index idx_student_profiles_user_id on student_profiles(user_id);
  create index idx_enrollment_records_student_id on enrollment_records(student_id);
  create index idx_enrollment_record_subjects_subject_id on enrollment_record_subjects(subject_id);
  create index idx_class_offerings_instructor_id on class_offerings(instructor_id);
  create index idx_class_schedules_class_id on class_schedules(class_id);
  create index idx_attendance_sessions_class_id on attendance_sessions(class_id);
  create index idx_attendance_records_student_id on attendance_records(student_id);
  create index idx_grade_records_student_id on grade_records(student_id);
  create index idx_grade_records_subject_id on grade_records(subject_id);
  create index idx_evaluation_records_student_id on evaluation_records(student_id);
  create index idx_payment_records_student_id on payment_records(student_id);
