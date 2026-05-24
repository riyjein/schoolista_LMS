-- Faculty Evaluation backend schema for the student evaluation flow.
-- This is intentionally additive: it does not replace the legacy evaluation tables.

create table if not exists faculty_evaluation_courses (
  id text primary key,
  code text not null,
  title text not null,
  instructor text not null,
  section text not null,
  room text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists faculty_evaluation_categories (
  id text primary key,
  title text not null,
  weight integer not null check (weight > 0),
  description text not null,
  sort_order integer not null
);

create table if not exists faculty_evaluation_questions (
  id text primary key,
  category_id text not null references faculty_evaluation_categories(id) on delete cascade,
  question_text text not null,
  sort_order integer not null,
  required boolean not null default true
);

create table if not exists faculty_evaluation_responses (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  course_id text not null references faculty_evaluation_courses(id),
  status text not null check (status in ('draft', 'submitted')),
  comments text not null default '',
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists faculty_evaluation_answers (
  response_id uuid not null references faculty_evaluation_responses(id) on delete cascade,
  question_id text not null references faculty_evaluation_questions(id),
  rating integer not null check (rating between 1 and 5),
  primary key (response_id, question_id)
);

create index if not exists idx_faculty_eval_responses_student
  on faculty_evaluation_responses(student_id);

create index if not exists idx_faculty_eval_responses_course
  on faculty_evaluation_responses(course_id);

create index if not exists idx_faculty_eval_answers_question
  on faculty_evaluation_answers(question_id);

insert into faculty_evaluation_courses (id, code, title, instructor, section, room, active)
values
  ('cs211', 'CS 211', 'Programming 2', 'Prof. Rammne Nicholas Tiongson', 'BSCS-2A', 'CS Lab 1', true),
  ('cs221', 'CS 221', 'Discrete Mathematics', 'Prof. Fleur Rivera', 'BSCS-2A', 'Room 302', true),
  ('cs231', 'CS 231', 'Computer Organization and Architecture', 'Prof. Mary Arroyo', 'BSCS-2A', 'CS Lab 2', true),
  ('pe201', 'PE 201', 'Physical Education 3', 'Prof Lebron James Santos', 'PE-2024-A', 'Gymnasium', true),
  ('eng211', 'ENG 211', 'Purposive Communication', 'Prof. Paul Panti', 'BSCS-2A', 'Room 201', true)
on conflict (id) do update set
  code = excluded.code,
  title = excluded.title,
  instructor = excluded.instructor,
  section = excluded.section,
  room = excluded.room,
  active = excluded.active;

insert into faculty_evaluation_categories (id, title, weight, description, sort_order)
values
  ('non-instructional', 'Non-Instructional Component', 20, 'Professional responsibilities and conduct', 1),
  ('topics', 'Understanding of Topics', 15, 'Clarity, examples, and relevance', 2),
  ('engagement', 'Interest and Engagement', 10, 'Presentation and enthusiasm', 3),
  ('learning-experience', 'Learning Experience', 20, 'Productivity, motivation, performance, and learning environment', 4),
  ('assessment', 'Assessment and Grading', 15, 'Tests, grades, and feedback', 5),
  ('empowerment', 'Student Empowerment', 10, 'Participation and creativity', 6),
  ('technology', 'Technology Integration', 10, 'Use of technology in teaching', 7)
on conflict (id) do update set
  title = excluded.title,
  weight = excluded.weight,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into faculty_evaluation_responses (student_id, course_id, status, comments, submitted_at)
values
  ('student-1', 'cs221', 'submitted', '', now())
on conflict (student_id, course_id) do update set
  status = excluded.status,
  comments = excluded.comments,
  submitted_at = excluded.submitted_at,
  updated_at = now();
