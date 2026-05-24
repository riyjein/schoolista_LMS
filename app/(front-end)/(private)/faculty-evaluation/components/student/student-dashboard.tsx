"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Menu,
  MessageSquareText,
  PenLine,
  Save,
  Search,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";

type CourseStatus = "draft" | "not-started" | "submitted";
type ViewMode = "dashboard" | "form" | "review" | "success";

type Course = {
  id: string;
  code: string;
  title: string;
  instructor: string;
  section: string;
  room: string;
  status: CourseStatus;
};

type EvaluationCategory = {
  id: string;
  title: string;
  weight: number;
  description: string;
  questions: string[];
};

const courses: Course[] = [
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

const categories: EvaluationCategory[] = [
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

const questionIds = categories.flatMap((category) =>
  category.questions.map((_, index) => `${category.id}-${index}`),
);

type AnswerMap = Record<string, number>;
const emptyAnswers: AnswerMap = {};

type BackendEvaluationPayload = {
  answersByCourse: Record<string, AnswerMap>;
  commentsByCourse: Record<string, string>;
  courseStatuses: Record<string, CourseStatus>;
  submittedAtByCourse: Record<string, string>;
};

const seedDraftAnswers = questionIds
  .slice(0, 11)
  .reduce<AnswerMap>((answers, id, index) => {
    answers[id] = index % 4 === 0 ? 5 : 4;
    return answers;
  }, {});

const statusLabel: Record<CourseStatus, string> = {
  draft: "Draft",
  "not-started": "Not Started",
  submitted: "Submitted",
};

function StatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-medium",
        status === "draft" && "border-amber-300 bg-amber-50 text-amber-800",
        status === "not-started" && "border-slate-200 bg-slate-50 text-slate-600",
        status === "submitted" && "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
    >
      {status === "draft" ? (
        <PenLine className="size-3" />
      ) : status === "submitted" ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <span className="size-2 rounded-full border border-current" />
      )}
      {statusLabel[status]}
    </span>
  );
}

function ProgressBar({ value, color = "bg-blue-600" }: { value: number; color?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full transition-all duration-300", color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function RatingControl({
  value,
  onChange,
}: {
  value?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:flex sm:gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={cn(
            "flex h-9 min-w-10 items-center justify-center gap-1 rounded-md border text-sm font-semibold transition",
            value === rating
              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50",
          )}
          aria-label={`Rate ${rating}`}
        >
          {rating}
          <Star className={cn("size-3.5", value === rating && "fill-current")} />
        </button>
      ))}
    </div>
  );
}

function EvaluationGuide() {
  return (
    <aside className="hidden w-88 shrink-0 border-r border-slate-200 bg-white px-4 py-6 xl:block">
      <div className="sticky top-4 space-y-5 text-sm">
        <div>
          <p className="font-semibold text-slate-900">Evaluation categories</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Complete all rating questions and the comments field before submitting.
          </p>
        </div>

        <ol className="space-y-3">
          {categories.map((category, index) => (
            <li key={category.id} className="flex gap-3">
              <span className="mt-0.5 text-slate-400">{index + 1}.</span>
              <div>
                <p className="font-semibold text-slate-900">
                  {category.title} ({category.weight}% weight) -{" "}
                  {category.questions.length}
                </p>
                <p className="leading-5 text-slate-600">
                  questions about {category.description.toLowerCase()}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="border-t border-slate-200 pt-4">
          <p className="font-semibold text-slate-900">Total Questions:</p>
          <ul className="mt-3 space-y-2 text-slate-700">
            <li className="flex gap-2">
              <span>-</span>
              <span>44 rating questions (all required)</span>
            </li>
            <li className="flex gap-2">
              <span>-</span>
              <span>1 required comments/suggestions textarea field</span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
          <p className="font-medium">Faculty evaluation flow</p>
          <p className="mt-1 text-xs leading-5">
            Students may save drafts, continue later, review answers, and submit
            once every requirement is complete.
          </p>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-4 px-4 lg:px-6">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>

        <div className="relative hidden flex-1 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none ring-blue-200 transition focus:border-blue-400 focus:ring-4"
            placeholder="Search modules, students, or courses..."
          />
        </div>

        <button
          type="button"
          className="hidden h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 md:inline-flex"
        >
          <GraduationCap className="size-4 text-blue-700" />
          Student
          <ChevronRight className="size-4 rotate-90 text-slate-400" />
        </button>

        <button
          type="button"
          className="relative inline-flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-amber-500" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">Maria Santos</p>
            <p className="text-xs text-blue-700">Student</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white shadow-sm">
            MS
          </div>
        </div>
      </div>
    </header>
  );
}

export default function StudentDashboard() {
  const [courseStatuses, setCourseStatuses] = useState<Record<string, CourseStatus>>(
    Object.fromEntries(courses.map((course) => [course.id, course.status])),
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [answersByCourse, setAnswersByCourse] = useState<Record<string, AnswerMap>>({
    cs211: seedDraftAnswers,
  });
  const [commentsByCourse, setCommentsByCourse] = useState<Record<string, string>>({});
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [backendMessage, setBackendMessage] = useState("Loading evaluation data...");
  const [isSaving, setIsSaving] = useState(false);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const currentAnswers = selectedCourseId
    ? answersByCourse[selectedCourseId] ?? emptyAnswers
    : emptyAnswers;
  const currentComments = selectedCourseId ? commentsByCourse[selectedCourseId] ?? "" : "";
  const answeredCount = Object.keys(currentAnswers).length;
  const submittedCount = Object.values(courseStatuses).filter(
    (status) => status === "submitted",
  ).length;
  const draftCount = Object.values(courseStatuses).filter((status) => status === "draft").length;
  const activeCategory = categories[activeCategoryIndex];
  const activeQuestionIds = activeCategory.questions.map(
    (_, index) => `${activeCategory.id}-${index}`,
  );
  const activeAnswered = activeQuestionIds.filter((id) => currentAnswers[id]).length;
  const isLastCategory = activeCategoryIndex === categories.length - 1;
  const isComplete = answeredCount === questionIds.length && currentComments.trim().length > 0;

  const selectedCourseStatus = selectedCourseId
    ? courseStatuses[selectedCourseId]
    : "not-started";

  const categoryProgress = useMemo(
    () =>
      categories.map((category) => {
        const ids = category.questions.map((_, index) => `${category.id}-${index}`);
        return {
          id: category.id,
          answered: ids.filter((id) => currentAnswers[id]).length,
          total: ids.length,
        };
      }),
    [currentAnswers],
  );

  const applyBackendPayload = (payload: BackendEvaluationPayload) => {
    setAnswersByCourse(payload.answersByCourse);
    setCommentsByCourse(payload.commentsByCourse);
    setCourseStatuses((previous) => ({
      ...previous,
      ...payload.courseStatuses,
    }));
  };

  useEffect(() => {
    let cancelled = false;

    async function loadEvaluation() {
      try {
        const response = await fetch("/api/student/evaluation", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Unable to load evaluation data.");
        }

        const payload = (await response.json()) as BackendEvaluationPayload;
        if (!cancelled) {
          applyBackendPayload(payload);
          setBackendMessage("Evaluation data synced.");
        }
      } catch {
        if (!cancelled) {
          setBackendMessage("Using offline evaluation data.");
        }
      }
    }

    loadEvaluation();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateAnswer = (questionId: string, value: number) => {
    if (!selectedCourseId || selectedCourseStatus === "submitted") {
      return;
    }

    setAnswersByCourse((previous) => ({
      ...previous,
      [selectedCourseId]: {
        ...(previous[selectedCourseId] ?? {}),
        [questionId]: value,
      },
    }));

    setCourseStatuses((previous) => ({
      ...previous,
      [selectedCourseId]: previous[selectedCourseId] === "submitted" ? "submitted" : "draft",
    }));
  };

  const updateComments = (value: string) => {
    if (!selectedCourseId || selectedCourseStatus === "submitted") {
      return;
    }

    setCommentsByCourse((previous) => ({
      ...previous,
      [selectedCourseId]: value,
    }));

    setCourseStatuses((previous) => ({
      ...previous,
      [selectedCourseId]: previous[selectedCourseId] === "submitted" ? "submitted" : "draft",
    }));
  };

  const openEvaluation = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveCategoryIndex(0);
    setViewMode("form");
  };

  const saveDraft = async () => {
    if (!selectedCourseId || selectedCourseStatus === "submitted") {
      return;
    }

    setIsSaving(true);
    setBackendMessage("Saving draft...");

    try {
      const response = await fetch("/api/student/evaluation", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          answers: currentAnswers,
          comments: currentComments,
        }),
      });

      if (!response.ok) {
        throw new Error("Draft save failed.");
      }

      applyBackendPayload((await response.json()) as BackendEvaluationPayload);
      setBackendMessage("Draft saved.");
      setViewMode("dashboard");
    } catch {
      setBackendMessage("Draft could not be saved. Your answers remain on this page.");
    } finally {
      setIsSaving(false);
    }
  };

  const submitEvaluation = async () => {
    if (!selectedCourseId || !isComplete) {
      return;
    }

    setIsSaving(true);
    setBackendMessage("Submitting evaluation...");

    try {
      const response = await fetch("/api/student/evaluation/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          answers: currentAnswers,
          comments: currentComments,
        }),
      });

      if (!response.ok) {
        throw new Error("Submit failed.");
      }

      applyBackendPayload((await response.json()) as BackendEvaluationPayload);
      setBackendMessage("Evaluation submitted.");
      setViewMode("success");
    } catch {
      setBackendMessage("Evaluation could not be submitted. Please review the required fields.");
    } finally {
      setIsSaving(false);
    }
  };

  if (viewMode === "success") {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopBar />
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center px-4 py-10">
          <section className="w-full rounded-lg border border-emerald-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-9" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-slate-950">
              Evaluation submitted
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Thank you for evaluating {selectedCourse.instructor} for{" "}
              {selectedCourse.code}. Your responses are recorded anonymously and
              included only in aggregated reports.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setViewMode("dashboard")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="size-4" />
                Back to evaluations
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextCourse = courses.find(
                    (course) => courseStatuses[course.id] !== "submitted",
                  );
                  if (nextCourse) {
                    openEvaluation(nextCourse.id);
                  } else {
                    setViewMode("dashboard");
                  }
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
              >
                Continue next
                <ChevronRight className="size-4" />
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (viewMode === "review") {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopBar />
        <div className="flex">
          <EvaluationGuide />

          <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode("form")}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
                >
                  <ChevronLeft className="size-4" />
                  Back to answers
                </button>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Review Submission
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-950">
                      {selectedCourse.code} - {selectedCourse.title}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedCourse.instructor} - {selectedCourse.section} -{" "}
                      {selectedCourse.room}
                    </p>
                  </div>
                  <StatusBadge status={selectedCourseStatus} />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h2 className="text-lg font-bold text-slate-950">
                    Completion checklist
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Confirm every required category is complete before submitting.
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {categories.map((category, index) => {
                    const progress = categoryProgress[index];
                    const complete = progress.answered === progress.total;

                    return (
                      <div
                        key={category.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-950">
                            {category.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {progress.answered}/{progress.total} ratings -{" "}
                            {category.weight}% weight
                          </p>
                        </div>
                        <span
                          className={cn(
                            "inline-flex h-7 w-fit items-center gap-1.5 rounded-full border px-3 text-xs font-semibold",
                            complete
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700",
                          )}
                        >
                          {complete ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : (
                            <AlertCircle className="size-3.5" />
                          )}
                          {complete ? "Complete" : "Needs answers"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Required comments
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {currentComments.trim() || "No comments provided yet."}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-7 w-fit items-center gap-1.5 rounded-full border px-3 text-xs font-semibold",
                      currentComments.trim()
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700",
                    )}
                  >
                    {currentComments.trim() ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <AlertCircle className="size-3.5" />
                    )}
                    {currentComments.trim() ? "Ready" : "Missing"}
                  </span>
                </div>
              </section>

              <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ShieldCheck className="size-4 text-blue-700" />
                  Final submissions cannot be edited in this prototype flow.
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setViewMode("form")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <PenLine className="size-4" />
                    Edit Answers
                  </button>
                  <button
                    type="button"
                    onClick={submitEvaluation}
                    disabled={!isComplete || isSaving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Send className="size-4" />
                    {isSaving ? "Submitting..." : "Submit Evaluation"}
                  </button>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (viewMode === "form") {
    const missingComments = currentComments.trim().length === 0;

    return (
      <div className="min-h-screen bg-slate-50">
        <TopBar />
        <div className="flex">
          <EvaluationGuide />

          <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => setViewMode("dashboard")}
                      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
                    >
                      <ChevronLeft className="size-4" />
                      Back to course list
                    </button>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <BookOpen className="size-4" />
                      Faculty Evaluation
                    </div>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                      {selectedCourse.code} - {selectedCourse.title}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedCourse.instructor} - {selectedCourse.section} -{" "}
                      {selectedCourse.room}
                    </p>
                  </div>

                  <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 lg:w-80">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-slate-900">Form progress</span>
                      <span className="text-slate-500">
                        {answeredCount}/44 ratings
                      </span>
                    </div>
                    <ProgressBar value={(answeredCount / questionIds.length) * 100} />
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <MessageSquareText className="size-3.5" />
                      Comments are required before final submission.
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {backendMessage}
                    </p>
                  </div>
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <nav className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Categories
                  </p>
                  <div className="space-y-1">
                    {categories.map((category, index) => {
                      const progress = categoryProgress[index];
                      const isActive = index === activeCategoryIndex;
                      const isDone = progress.answered === progress.total;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setActiveCategoryIndex(index)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm transition",
                            isActive
                              ? "bg-blue-50 text-blue-800"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                              isDone
                                ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                                : isActive
                                  ? "border-blue-200 bg-white text-blue-800"
                                  : "border-slate-200 bg-white text-slate-500",
                            )}
                          >
                            {isDone ? <Check className="size-4" /> : index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {category.title}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {progress.answered}/{progress.total} - {category.weight}%
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </nav>

                <section className="space-y-5">
                  <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Category {activeCategoryIndex + 1} of {categories.length}
                          </p>
                          <h2 className="mt-1 text-xl font-bold text-slate-950">
                            {activeCategory.title}
                          </h2>
                          <p className="mt-1 text-sm text-slate-600">
                            {activeCategory.description}
                          </p>
                        </div>
                        <div className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                          <span className="font-semibold text-slate-950">
                            {activeAnswered}/{activeCategory.questions.length}
                          </span>{" "}
                          <span className="text-slate-500">answered</span>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {activeCategory.questions.map((question, index) => {
                        const questionId = `${activeCategory.id}-${index}`;
                        return (
                          <div key={questionId} className="p-5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="max-w-2xl">
                                <p className="text-sm font-semibold text-slate-900">
                                  <span className="text-blue-700">
                                    Q{index + 1}.
                                  </span>{" "}
                                  {question}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  1 means strongly disagree, 5 means strongly agree.
                                </p>
                              </div>
                              <RatingControl
                                value={currentAnswers[questionId]}
                                onChange={(value) => updateAnswer(questionId, value)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {isLastCategory && (
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                      <label
                        htmlFor="evaluation-comments"
                        className="text-sm font-semibold text-slate-950"
                      >
                        Comments and suggestions
                      </label>
                      <p className="mt-1 text-sm text-slate-600">
                        Share specific strengths, concerns, or suggestions for improving
                        the learning experience.
                      </p>
                      <textarea
                        id="evaluation-comments"
                        rows={5}
                        value={currentComments}
                        onChange={(event) => updateComments(event.target.value)}
                        placeholder="Type your comments here..."
                        className="mt-3 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-blue-200 transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            missingComments ? "text-amber-700" : "text-emerald-700",
                          )}
                        >
                          {missingComments ? (
                            <AlertCircle className="size-3.5" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          Required
                        </span>
                        <span className="text-slate-500">
                          {currentComments.length} characters
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <ShieldCheck className="size-4 text-blue-700" />
                      Responses are anonymized in reports.
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={saveDraft}
                        disabled={selectedCourseStatus === "submitted" || isSaving}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Save className="size-4" />
                        {isSaving ? "Saving..." : "Save Draft"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCategoryIndex((value) => Math.max(0, value - 1))}
                        disabled={activeCategoryIndex === 0}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft className="size-4" />
                        Previous
                      </button>
                      {isLastCategory ? (
                        <button
                          type="button"
                          onClick={() => setViewMode("review")}
                          disabled={!isComplete || isSaving}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <CheckCircle2 className="size-4" />
                          Review
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveCategoryIndex((value) =>
                              Math.min(categories.length - 1, value + 1),
                            )
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
                        >
                          Next
                          <ChevronRight className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="flex">
        <EvaluationGuide />

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-5">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Pending</p>
                  <Clock3 className="size-4 text-slate-400" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-950">
                  {courses.length - submittedCount - draftCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">classes not started</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-amber-700">In Draft</p>
                  <PenLine className="size-4 text-amber-600" />
                </div>
                <p className="mt-3 text-3xl font-bold text-amber-700">{draftCount}</p>
                <p className="mt-1 text-xs text-slate-500">saved evaluation</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-emerald-700">Submitted</p>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                </div>
                <p className="mt-3 text-3xl font-bold text-emerald-700">
                  {submittedCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">completed evaluations</p>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-950">Overall Completion</span>
                <span className="text-slate-500">
                  {submittedCount} / {courses.length} submitted
                </span>
              </div>
              <ProgressBar value={(submittedCount / courses.length) * 100} color="bg-emerald-500" />
              <p className="mt-3 text-xs text-slate-500">{backendMessage}</p>
            </section>

            <section className="space-y-3">
              {courses.map((course) => {
                const status = courseStatuses[course.id];
                const answers = answersByCourse[course.id] ?? {};
                const answerCount = Object.keys(answers).length;

                return (
                  <article
                    key={course.id}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <BookOpen className="size-4 shrink-0 text-slate-500" />
                          <h2 className="truncate text-base font-bold text-slate-950">
                            {course.code} - {course.title}
                          </h2>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{course.instructor}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {course.section} - {course.room}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 md:items-end">
                        <StatusBadge status={status} />
                        <button
                          type="button"
                          onClick={() => openEvaluation(course.id)}
                          className={cn(
                            "inline-flex h-10 min-w-[7.5rem] items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm transition",
                            status === "draft"
                              ? "bg-amber-600 text-white hover:bg-amber-700"
                              : status === "submitted"
                                ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                : "bg-blue-700 text-white hover:bg-blue-800",
                          )}
                        >
                          {status === "draft" ? (
                            <>
                              <PenLine className="size-4" />
                              Continue
                            </>
                          ) : status === "submitted" ? (
                            <>
                              <CheckCircle2 className="size-4" />
                              View
                            </>
                          ) : (
                            <>
                              <ChevronRight className="size-4" />
                              Evaluate
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {status === "draft" && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <div className="mb-2 flex justify-between text-xs text-slate-500">
                          <span>Draft progress</span>
                          <span>{answerCount}/44 questions</span>
                        </div>
                        <ProgressBar value={(answerCount / questionIds.length) * 100} color="bg-amber-500" />
                      </div>
                    )}
                  </article>
                );
              })}
            </section>

            <p className="pb-8 text-center text-xs text-slate-500">
              Evaluations are used to improve faculty performance. All responses
              are aggregated anonymously.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
