import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type CourseStatus = "draft" | "not-started" | "submitted";

export type EvaluationCourse = {
  id: string;
  code: string;
  title: string;
  instructor: string;
  section: string;
  room: string;
  status: CourseStatus;
};

export type EvaluationCategory = {
  id: string;
  title: string;
  weight: number;
  description: string;
  questions: string[];
};

export type AnswerMap = Record<string, number>;

export type StudentEvaluationState = {
  answersByCourse: Record<string, AnswerMap>;
  commentsByCourse: Record<string, string>;
  courseStatuses: Record<string, CourseStatus>;
  submittedAtByCourse: Record<string, string>;
};

export type EvaluationPayload = StudentEvaluationState & {
  courses: EvaluationCourse[];
  categories: EvaluationCategory[];
  questionIds: string[];
  student: {
    id: string;
    name: string;
    role: "Student";
  };
};

export const evaluationCourses: EvaluationCourse[] = [
  {
    id: "cs211",
    code: "CS 211",
    title: "Programming 2",
    instructor: "Prof. Rammne Nicholas Tiongson",
    section: "BSCS-2A",
    room: "CS Lab 1",
    status: "draft",
  },
  {
    id: "cs221",
    code: "CS 221",
    title: "Discrete Mathematics",
    instructor: "Prof. Fleur Rivera",
    section: "BSCS-2A",
    room: "Room 302",
    status: "submitted",
  },
  {
    id: "cs231",
    code: "CS 231",
    title: "Computer Organization and Architecture",
    instructor: "Prof. Mary Arroyo",
    section: "BSCS-2A",
    room: "CS Lab 2",
    status: "not-started",
  },
  {
    id: "pe201",
    code: "PE 201",
    title: "Physical Education 3",
    instructor: "Prof Lebron James Santos",
    section: "PE-2024-A",
    room: "Gymnasium",
    status: "not-started",
  },
  {
    id: "eng211",
    code: "ENG 211",
    title: "Purposive Communication",
    instructor: "Prof. Paul Panti",
    section: "BSCS-2A",
    room: "Room 201",
    status: "not-started",
  },
];

export const evaluationCategories: EvaluationCategory[] = [
  {
    id: "non-instructional",
    title: "Non-Instructional Component",
    weight: 20,
    description: "Professional responsibilities and conduct",
    questions: [
      "The faculty member observes professional ethics in all class interactions.",
      "The faculty member starts and ends classes according to the published schedule.",
      "The faculty member is available during consultation hours or through approved channels.",
      "The faculty member responds to academic concerns in a reasonable time.",
      "The faculty member treats students with dignity and respect.",
      "The faculty member follows university policies and class guidelines.",
      "The faculty member maintains a learning environment free from discrimination.",
      "The faculty member manages class records and announcements clearly.",
      "The faculty member demonstrates preparedness for every meeting.",
      "The faculty member handles student information with confidentiality.",
      "The faculty member models professionalism expected in the discipline.",
    ],
  },
  {
    id: "topics",
    title: "Understanding of Topics",
    weight: 15,
    description: "Clarity, examples, and relevance",
    questions: [
      "The faculty member demonstrates strong mastery of the subject matter.",
      "The faculty member explains complex topics in understandable terms.",
      "The faculty member uses examples that connect concepts to real situations.",
      "The faculty member answers questions accurately and constructively.",
    ],
  },
  {
    id: "engagement",
    title: "Interest and Engagement",
    weight: 10,
    description: "Presentation and enthusiasm",
    questions: [
      "The faculty member presents lessons in a way that sustains attention.",
      "The faculty member encourages active student participation.",
      "The faculty member shows enthusiasm for the course content.",
    ],
  },
  {
    id: "learning-experience",
    title: "Learning Experience",
    weight: 20,
    description: "Productivity, motivation, performance, and learning environment",
    questions: [
      "The faculty member provides activities that help students practice key skills.",
      "The faculty member connects activities to course outcomes.",
      "The faculty member sets clear expectations for class performance.",
      "The faculty member balances lecture, practice, and discussion effectively.",
      "The faculty member motivates students to improve their work.",
      "The faculty member uses class time productively.",
      "The faculty member gives learning materials that support the lesson.",
      "The faculty member creates a safe environment for asking questions.",
      "The faculty member monitors whether students are keeping up with lessons.",
      "The faculty member gives opportunities to apply feedback.",
      "The faculty member helps students understand their progress.",
      "The faculty member makes the course workload manageable and purposeful.",
    ],
  },
  {
    id: "assessment",
    title: "Assessment and Grading",
    weight: 15,
    description: "Tests, grades, and feedback",
    questions: [
      "The faculty member explains grading criteria before assessments.",
      "The faculty member designs assessments aligned with lessons and outcomes.",
      "The faculty member grades student work fairly and consistently.",
      "The faculty member returns feedback within a useful time frame.",
      "The faculty member explains errors and gives guidance for improvement.",
    ],
  },
  {
    id: "empowerment",
    title: "Student Empowerment",
    weight: 10,
    description: "Participation and creativity",
    questions: [
      "The faculty member encourages students to share ideas respectfully.",
      "The faculty member supports independent thinking and problem solving.",
      "The faculty member recognizes student effort and improvement.",
      "The faculty member gives space for creativity where appropriate.",
    ],
  },
  {
    id: "technology",
    title: "Technology Integration",
    weight: 10,
    description: "Use of technology in teaching",
    questions: [
      "The faculty member uses learning platforms or tools effectively.",
      "The faculty member shares digital materials in an organized way.",
      "The faculty member uses technology to support interaction or practice.",
      "The faculty member gives clear instructions for technology-based tasks.",
      "The faculty member handles technical limitations with practical alternatives.",
    ],
  },
];

export const evaluationQuestionIds = evaluationCategories.flatMap((category) =>
  category.questions.map((_, index) => `${category.id}-${index}`),
);

const student = {
  id: "student-1",
  name: "Maria Santos",
  role: "Student" as const,
};

const storePath = path.join(
  process.cwd(),
  ".data",
  "faculty-evaluation-store.json",
);

type EvaluationResponseRow = {
  id: string;
  course_id: string;
  status: "draft" | "submitted";
  comments: string | null;
  submitted_at: string | null;
};

type EvaluationAnswerRow = {
  response_id: string;
  question_id: string;
  rating: number;
};

function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

function createEvaluationSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  return createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const seedDraftAnswers = evaluationQuestionIds
  .slice(0, 11)
  .reduce<AnswerMap>((answers, id, index) => {
    answers[id] = index % 4 === 0 ? 5 : 4;
    return answers;
  }, {});

function defaultState(): StudentEvaluationState {
  return {
    answersByCourse: {
      cs211: seedDraftAnswers,
    },
    commentsByCourse: {},
    courseStatuses: Object.fromEntries(
      evaluationCourses.map((course) => [course.id, course.status]),
    ),
    submittedAtByCourse: {},
  };
}

async function ensureStoreDirectory() {
  await mkdir(path.dirname(storePath), { recursive: true });
}

function getQuestionRows() {
  return evaluationCategories.flatMap((category) =>
    category.questions.map((questionText, index) => ({
      id: `${category.id}-${index}`,
      category_id: category.id,
      question_text: questionText,
      sort_order: index + 1,
      required: true,
    })),
  );
}

async function seedSupabaseCatalog() {
  const supabase = createEvaluationSupabaseClient();
  if (!supabase) {
    return false;
  }

  const { error: courseError } = await supabase
    .from("faculty_evaluation_courses")
    .upsert(
      evaluationCourses.map((course) => ({
        id: course.id,
        code: course.code,
        title: course.title,
        instructor: course.instructor,
        section: course.section,
        room: course.room,
        active: true,
      })),
      { onConflict: "id" },
    );

  if (courseError) {
    return false;
  }

  const { error: categoryError } = await supabase
    .from("faculty_evaluation_categories")
    .upsert(
      evaluationCategories.map((category, index) => ({
        id: category.id,
        title: category.title,
        weight: category.weight,
        description: category.description,
        sort_order: index + 1,
      })),
      { onConflict: "id" },
    );

  if (categoryError) {
    return false;
  }

  const { error: questionError } = await supabase
    .from("faculty_evaluation_questions")
    .upsert(getQuestionRows(), { onConflict: "id" });

  return !questionError;
}

async function readSupabaseState(): Promise<StudentEvaluationState | null> {
  const supabase = createEvaluationSupabaseClient();
  if (!supabase || !(await seedSupabaseCatalog())) {
    return null;
  }

  const { data: responses, error: responsesError } = await supabase
    .from("faculty_evaluation_responses")
    .select("id, course_id, status, comments, submitted_at")
    .eq("student_id", student.id);

  if (responsesError) {
    return null;
  }

  const responseRows = (responses ?? []) as EvaluationResponseRow[];
  const responseIds = responseRows.map((response) => response.id);
  const answersByResponseId: Record<string, AnswerMap> = {};

  if (responseIds.length > 0) {
    const { data: answers, error: answersError } = await supabase
      .from("faculty_evaluation_answers")
      .select("response_id, question_id, rating")
      .in("response_id", responseIds);

    if (answersError) {
      return null;
    }

    for (const answer of (answers ?? []) as EvaluationAnswerRow[]) {
      answersByResponseId[answer.response_id] ??= {};
      answersByResponseId[answer.response_id][answer.question_id] =
        answer.rating;
    }
  }

  const state = defaultState();

  for (const response of responseRows) {
    state.courseStatuses[response.course_id] = response.status;
    state.commentsByCourse[response.course_id] = response.comments ?? "";
    state.answersByCourse[response.course_id] =
      answersByResponseId[response.id] ?? {};
    if (response.submitted_at) {
      state.submittedAtByCourse[response.course_id] = response.submitted_at;
    }
  }

  return state;
}

async function saveSupabaseEvaluation(
  courseId: string,
  answers: AnswerMap,
  comments: string,
  status: "draft" | "submitted",
): Promise<StudentEvaluationState | null> {
  const supabase = createEvaluationSupabaseClient();
  if (!supabase || !(await seedSupabaseCatalog())) {
    return null;
  }

  const { data: response, error: responseError } = await supabase
    .from("faculty_evaluation_responses")
    .upsert(
      {
        student_id: student.id,
        course_id: courseId,
        status,
        comments,
        submitted_at: status === "submitted" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,course_id" },
    )
    .select("id")
    .single();

  if (responseError || !response?.id) {
    return null;
  }

  const responseId = String(response.id);
  const { error: deleteError } = await supabase
    .from("faculty_evaluation_answers")
    .delete()
    .eq("response_id", responseId);

  if (deleteError) {
    return null;
  }

  const rows = Object.entries(answers).map(([questionId, rating]) => ({
    response_id: responseId,
    question_id: questionId,
    rating,
  }));

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("faculty_evaluation_answers")
      .insert(rows);

    if (insertError) {
      return null;
    }
  }

  return readSupabaseState();
}

export function validateCourseId(courseId: string) {
  return evaluationCourses.some((course) => course.id === courseId);
}

export function normalizeAnswers(answers: unknown): AnswerMap {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return {};
  }

  return Object.entries(answers).reduce<AnswerMap>((normalized, [id, value]) => {
    if (!evaluationQuestionIds.includes(id)) {
      return normalized;
    }

    const rating = Number(value);
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      normalized[id] = rating;
    }

    return normalized;
  }, {});
}

export function getMissingRequirements(answers: AnswerMap, comments: string) {
  const missingQuestionIds = evaluationQuestionIds.filter((id) => !answers[id]);
  const missingComments = comments.trim().length === 0;

  return {
    isComplete: missingQuestionIds.length === 0 && !missingComments,
    missingQuestionIds,
    missingComments,
  };
}

export async function readEvaluationState(): Promise<StudentEvaluationState> {
  const supabaseState = await readSupabaseState();
  if (supabaseState) {
    return supabaseState;
  }

  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<StudentEvaluationState>;
    const fallback = defaultState();

    return {
      answersByCourse: parsed.answersByCourse ?? fallback.answersByCourse,
      commentsByCourse: parsed.commentsByCourse ?? fallback.commentsByCourse,
      courseStatuses: {
        ...fallback.courseStatuses,
        ...(parsed.courseStatuses ?? {}),
      },
      submittedAtByCourse:
        parsed.submittedAtByCourse ?? fallback.submittedAtByCourse,
    };
  } catch {
    return defaultState();
  }
}

export async function writeEvaluationState(state: StudentEvaluationState) {
  await ensureStoreDirectory();
  await writeFile(storePath, JSON.stringify(state, null, 2), "utf8");
}

export async function getEvaluationPayload(): Promise<EvaluationPayload> {
  const state = await readEvaluationState();

  return {
    ...state,
    courses: evaluationCourses,
    categories: evaluationCategories,
    questionIds: evaluationQuestionIds,
    student,
  };
}

export async function saveDraft(
  courseId: string,
  answers: AnswerMap,
  comments: string,
) {
  const supabaseState = await saveSupabaseEvaluation(
    courseId,
    answers,
    comments,
    "draft",
  );
  if (supabaseState) {
    return {
      ...supabaseState,
      courses: evaluationCourses,
      categories: evaluationCategories,
      questionIds: evaluationQuestionIds,
      student,
    };
  }

  const state = await readEvaluationState();

  state.answersByCourse[courseId] = answers;
  state.commentsByCourse[courseId] = comments;
  if (state.courseStatuses[courseId] !== "submitted") {
    state.courseStatuses[courseId] = "draft";
  }

  await writeEvaluationState(state);
  return getEvaluationPayload();
}

export async function submitEvaluation(
  courseId: string,
  answers: AnswerMap,
  comments: string,
) {
  const requirements = getMissingRequirements(answers, comments);
  if (!requirements.isComplete) {
    return {
      ok: false as const,
      requirements,
      payload: await getEvaluationPayload(),
    };
  }

  const supabaseState = await saveSupabaseEvaluation(
    courseId,
    answers,
    comments,
    "submitted",
  );
  if (supabaseState) {
    return {
      ok: true as const,
      requirements,
      payload: {
        ...supabaseState,
        courses: evaluationCourses,
        categories: evaluationCategories,
        questionIds: evaluationQuestionIds,
        student,
      },
    };
  }

  const state = await readEvaluationState();
  state.answersByCourse[courseId] = answers;
  state.commentsByCourse[courseId] = comments;
  state.courseStatuses[courseId] = "submitted";
  state.submittedAtByCourse[courseId] = new Date().toISOString();

  await writeEvaluationState(state);

  return {
    ok: true as const,
    requirements,
    payload: await getEvaluationPayload(),
  };
}
