import { NextResponse } from "next/server";

import {
  getEvaluationPayload,
  normalizeAnswers,
  saveDraft,
  validateCourseId,
} from "@/lib/faculty-evaluation/store";

export async function GET() {
  return NextResponse.json(await getEvaluationPayload());
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    courseId?: unknown;
    answers?: unknown;
    comments?: unknown;
  } | null;

  const courseId = typeof body?.courseId === "string" ? body.courseId : "";
  if (!validateCourseId(courseId)) {
    return NextResponse.json(
      { error: "Unknown course evaluation." },
      { status: 400 },
    );
  }

  const answers = normalizeAnswers(body?.answers);
  const comments = typeof body?.comments === "string" ? body.comments : "";

  return NextResponse.json(await saveDraft(courseId, answers, comments));
}
