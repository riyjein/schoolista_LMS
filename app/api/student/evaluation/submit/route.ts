import { NextResponse } from "next/server";

import {
  normalizeAnswers,
  submitEvaluation,
  validateCourseId,
} from "@/lib/faculty-evaluation/store";

export async function POST(request: Request) {
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
  const result = await submitEvaluation(courseId, answers, comments);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: "Evaluation is incomplete.",
        requirements: result.requirements,
        payload: result.payload,
      },
      { status: 422 },
    );
  }

  return NextResponse.json(result.payload);
}
