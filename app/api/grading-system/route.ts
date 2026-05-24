import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type GradeStatus = "draft" | "submitted" | "finalized";

type ClassOffering = {
  id: string;
  subject_id: string;
  instructor_id: string;
  section_code: string;
  school_year: string;
  semester: "1st" | "2nd" | "summer";
  room: string;
  max_students: number;
};

type StudentProfile = {
  id: string;
  name: string;
  student_number: string;
  year_level: number;
};

type GradeRecord = {
  id: string;
  class_id: string;
  student_id: string;
  subject_id: string;
  instructor_id: string;
  section_code: string;
  school_year: string;
  semester: "1st" | "2nd" | "summer";
  year_level: number;
  prelim_grade: number | null;
  midterm_grade: number | null;
  final_grade: number | null;
  status: GradeStatus;
};

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase URL or publishable key.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, number));
}

export async function GET() {
  try {
    const db = supabase();

    const { data: classData, error: classError } = await db
      .from("class_offerings")
      .select("*")
      .order("id");

    if (classError) throw classError;

    const classes = (classData ?? []) as ClassOffering[];
    const classIds = classes.map((item) => item.id);
    const subjectIds = [...new Set(classes.map((item) => item.subject_id))];
    const instructorIds = [...new Set(classes.map((item) => item.instructor_id))];

    const [
      { data: enrollmentData, error: enrollmentError },
      { data: studentData, error: studentError },
      { data: gradeData, error: gradeError },
      { data: subjectData, error: subjectError },
      { data: instructorData, error: instructorError },
    ] = await Promise.all([
      classIds.length
        ? db.from("class_offering_students").select("*").in("class_id", classIds)
        : Promise.resolve({ data: [], error: null }),
      db.from("student_profiles").select("id,name,student_number,year_level").order("student_number"),
      classIds.length
        ? db.from("grade_records").select("*").in("class_id", classIds)
        : Promise.resolve({ data: [], error: null }),
      subjectIds.length
        ? db.from("subjects").select("id,code,title,units").in("id", subjectIds)
        : Promise.resolve({ data: [], error: null }),
      instructorIds.length
        ? db.from("instructors").select("id,name").in("id", instructorIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (enrollmentError) throw enrollmentError;
    if (studentError) throw studentError;
    if (gradeError) throw gradeError;
    if (subjectError) throw subjectError;
    if (instructorError) throw instructorError;

    const students = (studentData ?? []) as StudentProfile[];
    const gradeRecords = (gradeData ?? []) as GradeRecord[];
    const enrollments = (enrollmentData ?? []) as { class_id: string; student_id: string }[];

    return NextResponse.json({
      classes,
      enrollments,
      students,
      grades: gradeRecords,
      subjects: subjectData ?? [],
      instructors: instructorData ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load grading data." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const db = supabase();
    const body = (await request.json()) as {
      classId?: string;
      studentId?: string;
      prelimGrade?: unknown;
      midtermGrade?: unknown;
      finalGrade?: unknown;
      status?: GradeStatus;
      action?: "save" | "submit" | "finalize";
      actorRole?: "teacher" | "admin" | "student";
    };

    if (!body.classId || !body.studentId) {
      return NextResponse.json(
        { error: "classId and studentId are required." },
        { status: 400 },
      );
    }

    const action = body.action ?? "save";
    const actorRole = body.actorRole ?? "teacher";

    if (actorRole === "student") {
      return NextResponse.json(
        { error: "Students can only view grades." },
        { status: 403 },
      );
    }

    if (action === "finalize" && actorRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can finalize submitted grades." },
        { status: 403 },
      );
    }

    if (action === "submit" && actorRole !== "teacher") {
      return NextResponse.json(
        { error: "Only teachers can request grade submission." },
        { status: 403 },
      );
    }

    if (action === "save" && actorRole !== "teacher" && actorRole !== "admin") {
      return NextResponse.json(
        { error: "Only teachers and admins can edit grades." },
        { status: 403 },
      );
    }

    const { data: classRow, error: classError } = await db
      .from("class_offerings")
      .select("*")
      .eq("id", body.classId)
      .single();
    if (classError) throw classError;

    const { data: studentRow, error: studentError } = await db
      .from("student_profiles")
      .select("id,year_level")
      .eq("id", body.studentId)
      .single();
    if (studentError) throw studentError;

    const { data: existingGrade, error: existingGradeError } = await db
      .from("grade_records")
      .select("status")
      .eq("class_id", body.classId)
      .eq("student_id", body.studentId)
      .maybeSingle();
    if (existingGradeError) throw existingGradeError;

    if (existingGrade?.status === "finalized" && actorRole !== "admin") {
      return NextResponse.json(
        { error: "Finalized grades are locked." },
        { status: 403 },
      );
    }

    const hasCompleteGrades =
      toNumber(body.prelimGrade) !== null &&
      toNumber(body.midtermGrade) !== null &&
      toNumber(body.finalGrade) !== null;

    if (action === "finalize" && !hasCompleteGrades) {
      return NextResponse.json(
        { error: "Complete grades are required before finalizing." },
        { status: 409 },
      );
    }

    const nextStatus: GradeStatus =
      action === "submit"
        ? "submitted"
        : action === "finalize"
          ? "finalized"
          : actorRole === "admin"
            ? existingGrade?.status ?? "draft"
            : "draft";

    const payload = {
      id: `grade-${body.classId}-${body.studentId}`,
      class_id: body.classId,
      student_id: body.studentId,
      subject_id: classRow.subject_id,
      instructor_id: classRow.instructor_id,
      section_code: classRow.section_code,
      school_year: classRow.school_year,
      semester: classRow.semester,
      year_level: studentRow.year_level,
      prelim_grade: toNumber(body.prelimGrade),
      midterm_grade: toNumber(body.midtermGrade),
      final_grade: toNumber(body.finalGrade),
      status: nextStatus,
    };

    const { data, error } = await db
      .from("grade_records")
      .upsert(payload, { onConflict: "student_id,class_id" })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ grade: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save grade." },
      { status: 500 },
    );
  }
}
