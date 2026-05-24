"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Save,
  Search,
  TriangleAlert,
} from "lucide-react";

type GradeStatus = "draft" | "submitted" | "finalized";
type GradeKey = "prelimGrade" | "midtermGrade" | "finalGrade";
type ActorRole = "teacher" | "admin" | "student";

type ClassOffering = {
  id: string;
  subject_id: string;
  instructor_id: string;
  section_code: string;
  school_year: string;
  semester: string;
  room: string;
};

type StudentProfile = {
  id: string;
  name: string;
  student_number: string;
  year_level: number;
};

type Subject = {
  id: string;
  code: string;
  title: string;
  units: number;
};

type Instructor = {
  id: string;
  name: string;
};

type GradeRecord = {
  id: string;
  class_id: string;
  student_id: string;
  prelim_grade: number | null;
  midterm_grade: number | null;
  final_grade: number | null;
  status: GradeStatus;
};

type GradeRow = {
  studentId: string;
  studentNo: string;
  name: string;
  prelimGrade: number | "";
  midtermGrade: number | "";
  finalGrade: number | "";
  status: GradeStatus;
};

const navItems = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Grading System", icon: GraduationCap, active: true },
  { label: "Student Reports", icon: FileText },
  { label: "Class Performance", icon: BarChart3 },
  { label: "Attendance", icon: Calendar },
];

function finalGrade(row: GradeRow) {
  if (row.prelimGrade === "" || row.midtermGrade === "" || row.finalGrade === "") {
    return null;
  }

  return row.prelimGrade * 0.3 + row.midtermGrade * 0.3 + row.finalGrade * 0.4;
}

function displayGrade(value: number | "") {
  return value === "" ? "" : String(value);
}

export default function GradingSystemPage() {
  const [classes, setClasses] = useState<ClassOffering[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [enrollments, setEnrollments] = useState<{ class_id: string; student_id: string }[]>([]);
  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actorRole, setActorRole] = useState<ActorRole>("teacher");

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/grading-system", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load grading data.");
      }

      setClasses(data.classes ?? []);
      setSubjects(data.subjects ?? []);
      setInstructors(data.instructors ?? []);
      setStudents(data.students ?? []);
      setEnrollments(data.enrollments ?? []);
      setGradeRecords(data.grades ?? []);
      setSelectedInstructorId((current) => current || data.instructors?.[0]?.id || data.classes?.[0]?.instructor_id || "");
      setSelectedClassId((current) => current || data.classes?.[0]?.id || "");
      setSelectedStudentId((current) => current || data.students?.find((student: StudentProfile) => student.id === "u7")?.id || data.students?.[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load grading data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const instructorClasses = useMemo(
    () =>
      selectedInstructorId
        ? classes.filter((item) => item.instructor_id === selectedInstructorId)
        : classes,
    [classes, selectedInstructorId],
  );

  const selectedClass = classes.find((item) => item.id === selectedClassId);
  const selectedSubject = subjects.find((item) => item.id === selectedClass?.subject_id);
  const selectedInstructor = instructors.find((item) => item.id === selectedClass?.instructor_id);

  useEffect(() => {
    if (!instructorClasses.length) {
      setSelectedClassId("");
      return;
    }

    if (!instructorClasses.some((item) => item.id === selectedClassId)) {
      setSelectedClassId(instructorClasses[0].id);
    }
  }, [instructorClasses, selectedClassId]);

  const rows = useMemo<GradeRow[]>(() => {
    const enrolledIds = enrollments
      .filter((item) => item.class_id === selectedClassId)
      .map((item) => item.student_id);

    const classStudents = enrolledIds.length
      ? students.filter((student) => enrolledIds.includes(student.id))
      : students;

    return classStudents.map((student) => {
      const record = gradeRecords.find(
        (grade) => grade.class_id === selectedClassId && grade.student_id === student.id,
      );

      return {
        studentId: student.id,
        studentNo: student.student_number,
        name: student.name,
        prelimGrade: record?.prelim_grade ?? "",
        midtermGrade: record?.midterm_grade ?? "",
        finalGrade: record?.final_grade ?? "",
        status: record?.status ?? "draft",
      };
    });
  }, [enrollments, gradeRecords, selectedClassId, students]);

  const summary = useMemo(() => {
    const finals = rows.map(finalGrade).filter((grade): grade is number => grade !== null);
    const passing = finals.filter((grade) => grade >= 75).length;
    const average = finals.length ? finals.reduce((sum, grade) => sum + grade, 0) / finals.length : 0;

    return {
      total: rows.length,
      passing,
      failing: finals.length - passing,
      average,
    };
  }, [rows]);

  const studentGradeRows = useMemo(() => {
    return gradeRecords
      .filter((record) => record.student_id === selectedStudentId && record.status === "finalized")
      .map((record) => {
        const classInfo = classes.find((item) => item.id === record.class_id);
        const subject = subjects.find((item) => item.id === classInfo?.subject_id);
        const row: GradeRow = {
          studentId: record.student_id,
          studentNo: "",
          name: subject?.title ?? classInfo?.section_code ?? record.class_id,
          prelimGrade: record.prelim_grade ?? "",
          midtermGrade: record.midterm_grade ?? "",
          finalGrade: record.final_grade ?? "",
          status: record.status,
        };

        return {
          ...row,
          classId: record.class_id,
          subjectCode: subject?.code ?? record.class_id,
          subjectTitle: subject?.title ?? "Class Grade",
          sectionCode: classInfo?.section_code ?? "",
          overall: finalGrade(row),
        };
      });
  }, [classes, gradeRecords, selectedStudentId, subjects]);

  const studentAverage = useMemo(() => {
    const grades = studentGradeRows
      .map((row) => row.overall)
      .filter((grade): grade is number => grade !== null);

    return grades.length ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
  }, [studentGradeRows]);

  const studentGpa = useMemo(() => {
    if (!studentAverage) return 0;
    if (studentAverage >= 97) return 1.0;
    if (studentAverage >= 94) return 1.25;
    if (studentAverage >= 91) return 1.5;
    if (studentAverage >= 88) return 1.75;
    if (studentAverage >= 85) return 2.0;
    if (studentAverage >= 82) return 2.25;
    if (studentAverage >= 79) return 2.5;
    if (studentAverage >= 76) return 2.75;
    if (studentAverage >= 75) return 3.0;
    return 5.0;
  }, [studentAverage]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId);

  function updateLocal(studentId: string, key: GradeKey, value: string) {
    const numeric = value === "" ? null : Math.max(0, Math.min(100, Number(value)));
    setGradeRecords((current) => {
      const existing = current.find(
        (grade) => grade.class_id === selectedClassId && grade.student_id === studentId,
      );

      if (existing) {
        return current.map((grade) =>
          grade.class_id === selectedClassId && grade.student_id === studentId
            ? {
                ...grade,
                [key === "prelimGrade" ? "prelim_grade" : key === "midtermGrade" ? "midterm_grade" : "final_grade"]: numeric,
                status: grade.status === "finalized" ? "finalized" : "draft",
              }
            : grade,
        );
      }

      return [
        ...current,
        {
          id: `local-${selectedClassId}-${studentId}`,
          class_id: selectedClassId,
          student_id: studentId,
          prelim_grade: key === "prelimGrade" ? numeric : null,
          midterm_grade: key === "midtermGrade" ? numeric : null,
          final_grade: key === "finalGrade" ? numeric : null,
          status: "draft",
        },
      ];
    });
  }

  async function saveRow(row: GradeRow, action: "save" | "submit" | "finalize") {
    setSavingId(row.studentId);
    setError(null);

    try {
      const response = await fetch("/api/grading-system", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          studentId: row.studentId,
          prelimGrade: row.prelimGrade,
          midtermGrade: row.midtermGrade,
          finalGrade: row.finalGrade,
          action,
          actorRole,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save grade.");
      }

      setGradeRecords((current) => {
        const withoutSaved = current.filter(
          (grade) => !(grade.class_id === selectedClassId && grade.student_id === row.studentId),
        );
        return [...withoutSaved, data.grade];
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save grade.");
    } finally {
      setSavingId(null);
    }
  }

  if (actorRole === "student") {
    return (
      <main className="min-h-screen bg-[#f6f7f9] px-6 py-10 text-[#001b3f]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Grades</h1>
              <p className="mt-2 text-slate-600">
                View your finalized grades and performance across all subjects
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {selectedStudent?.name ?? "Student"} · {selectedStudent?.student_number ?? ""}
              </p>
            </div>
            <select
              value={actorRole}
              onChange={(event) => setActorRole(event.target.value as ActorRole)}
              className="h-9 w-fit rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm"
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
          </div>

          <section className="mb-6 rounded-lg border border-[#ffc400] bg-[#2449c9] p-6 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/75">Overall GPA</p>
                <p className="mt-3 text-6xl font-light text-[#ffc400]">
                  {studentGpa ? studentGpa.toFixed(2) : "-"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/75">Overall Average</p>
                <p className="mt-3 text-4xl font-light text-emerald-300">
                  {studentAverage ? `${studentAverage.toFixed(1)}%` : "-"}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">
            <h2 className="font-bold">Grade Breakdown</h2>
            <p className="mt-2 text-slate-600">Detailed view of your finalized grades</p>

            <div className="mt-7 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="px-2 py-3 text-left font-semibold">Subject</th>
                    <th className="px-2 py-3 text-center font-semibold">Prelim</th>
                    <th className="px-2 py-3 text-center font-semibold">Midterm</th>
                    <th className="px-2 py-3 text-center font-semibold">Final</th>
                    <th className="px-2 py-3 text-center font-semibold">Overall</th>
                    <th className="px-2 py-3 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGradeRows.map((row) => (
                    <tr key={row.classId} className="border-b border-slate-100">
                      <td className="px-2 py-3 font-bold">
                        {row.subjectCode}
                        <div className="text-xs font-medium text-slate-500">{row.subjectTitle}</div>
                      </td>
                      <td className="px-2 py-3 text-center">{row.prelimGrade}</td>
                      <td className="px-2 py-3 text-center">{row.midtermGrade}</td>
                      <td className="px-2 py-3 text-center">{row.finalGrade}</td>
                      <td className="px-2 py-3 text-center font-bold text-[#ffc400]">
                        {row.overall?.toFixed(1) ?? "-"}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Finalized
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!studentGradeRows.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        No finalized grades are available for your account yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            {studentGradeRows.map((row) => (
              <article key={row.classId} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold">{row.subjectCode}</h3>
                <p className="mt-2 text-slate-600">Grade Details</p>
                <div className="mt-6 space-y-4">
                  {[
                    ["Prelim (30%)", row.prelimGrade],
                    ["Midterm (30%)", row.midtermGrade],
                    ["Final (40%)", row.finalGrade],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-600">{label}</span>
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-[#ffc400]"
                            style={{ width: `${typeof value === "number" ? value : 0}%` }}
                          />
                        </div>
                        <span className="w-10 text-right font-bold">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
                  <span className="font-bold">Overall Grade</span>
                  <span className="text-2xl font-bold text-[#ffc400]">{row.overall?.toFixed(1) ?? "-"}</span>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#001b3f]">
      <div className="grid min-h-screen grid-cols-[254px_minmax(0,1fr)]">
        <aside className="flex min-h-screen flex-col bg-[#223f98] text-white">
          <div className="flex h-[98px] items-center gap-3 border-b border-white/10 px-6">
            <BookOpen className="h-8 w-8 text-[#ffc400]" strokeWidth={2.2} />
            <div>
              <div className="text-lg font-bold tracking-wide">OLOPSC</div>
              <div className="text-xs font-bold text-[#ffc400]">Schoolista</div>
            </div>
          </div>

          <nav className="flex-1 space-y-3 px-3 py-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`flex h-11 w-full items-center gap-3 rounded-lg px-4 text-left text-sm font-semibold transition ${
                    item.active ? "bg-[#ffc400] text-[#001b3f]" : "text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-[#294bcb] p-3 text-sm">
              <GraduationCap className="h-5 w-5 text-[#ffc400]" />
              <div>
                <div className="text-xs text-white/80">Logged in as</div>
                <div className="font-semibold capitalize">{actorRole}</div>
              </div>
            </div>
            <button className="flex h-10 w-full items-center justify-center text-white/90">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="flex h-[74px] items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
            <label className="relative block w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#223f98] focus:bg-white"
                placeholder="Search students, reports, or courses..."
              />
            </label>

            <div className="flex items-center gap-6">
              <div className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#ffc400] text-xs font-bold">
                  3
                </span>
              </div>
              <div className="text-right text-sm">
                <div className="font-bold">{selectedInstructor?.name ?? "Professor"}</div>
                <div className="text-xs capitalize text-slate-500">{actorRole}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffc400] text-sm font-bold">
                DSM
              </div>
            </div>
          </header>

          <div className="px-6 py-7">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Grading System</h1>
                <p className="mt-2 text-base text-slate-600">
                  Manage and calculate student grades from Supabase
                </p>
              </div>
              <div className="flex gap-3">
                <select
                  value={actorRole}
                  onChange={(event) => setActorRole(event.target.value as ActorRole)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm"
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </select>
                <select
                  value={selectedInstructorId}
                  onChange={(event) => setSelectedInstructorId(event.target.value)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm"
                >
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedClassId}
                  onChange={(event) => setSelectedClassId(event.target.value)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm"
                >
                  {instructorClasses.map((item) => {
                    const subject = subjects.find((subjectItem) => subjectItem.id === item.subject_id);
                    return (
                      <option key={item.id} value={item.id}>
                        {subject?.code ?? item.id} - {item.section_code}
                      </option>
                    );
                  })}
                </select>
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold shadow-sm">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <section className="mb-6 grid gap-4 md:grid-cols-4">
              {[
                ["Total Students", summary.total, "text-[#001b3f]"],
                ["Passing", summary.passing, "text-[#00a447]"],
                ["Failing", summary.failing, "text-[#ff2438]"],
                ["Class Average", `${summary.average.toFixed(1)}%`, "text-[#001b3f]"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-6">
                  <p className="text-sm text-slate-600">{label}</p>
                  <p className={`mt-3 text-2xl ${color}`}>{value}</p>
                </div>
              ))}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
              <div className="mb-6">
                <h2 className="font-bold">Student Grades</h2>
                <p className="mt-2 text-slate-600">
                  {selectedSubject
                    ? `${selectedSubject.code} - ${selectedSubject.title}`
                    : "Click on any grade to edit. Final grade is auto-calculated."}
                </p>
                <p className="mt-2 text-sm font-medium text-[#223f98]">
                  {actorRole === "teacher" &&
                    "Teacher mode: edit grades, save drafts, then request submission."}
                  {actorRole === "admin" &&
                    "Admin mode: review submitted grades and finalize accepted records."}
                </p>
              </div>

              {loading ? (
                <div className="flex min-h-56 items-center justify-center text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading Supabase students and grades...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[940px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600">
                        <th className="px-2 py-3 text-left font-semibold">ID</th>
                        <th className="px-2 py-3 text-left font-semibold">Student Name</th>
                        <th className="px-2 py-3 text-center font-semibold">Prelim<br />(30%)</th>
                        <th className="px-2 py-3 text-center font-semibold">Midterm<br />(30%)</th>
                        <th className="px-2 py-3 text-center font-semibold">Final<br />(40%)</th>
                        <th className="px-2 py-3 text-center font-semibold">Final Grade</th>
                        <th className="px-2 py-3 text-center font-semibold">Status</th>
                        <th className="px-2 py-3 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const grade = finalGrade(row);
                        const pass = grade !== null && grade >= 75;
                        const hasGrade = grade !== null;
                        const locked = row.status === "finalized";
                        const saving = savingId === row.studentId;
                        const canTeacherEdit = actorRole === "teacher" && !locked;
                        const canAdminEdit = actorRole === "admin";
                        const canTeacherSubmit =
                          actorRole === "teacher" && !locked && hasGrade;
                        const canAdminFinalize = actorRole === "admin" && hasGrade;

                        return (
                          <tr
                            key={row.studentId}
                            className={`border-b border-slate-100 ${hasGrade && !pass ? "bg-[#fff1f1]" : ""}`}
                          >
                            <td className="px-2 py-3">{row.studentNo}</td>
                            <td className="px-2 py-3 font-bold">
                              <span className="inline-flex items-center gap-2">
                                {hasGrade && !pass && <TriangleAlert className="h-4 w-4 text-[#ff4b5c]" />}
                                {row.name}
                              </span>
                            </td>
                            {(["prelimGrade", "midtermGrade", "finalGrade"] as GradeKey[]).map((key) => (
                              <td key={key} className="px-2 py-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  disabled={!(canTeacherEdit || canAdminEdit) || saving}
                                  value={displayGrade(row[key])}
                                  onChange={(event) => updateLocal(row.studentId, key, event.target.value)}
                                  className="h-9 w-20 rounded-md border border-slate-200 bg-white text-center outline-none transition focus:border-[#223f98] focus:ring-2 focus:ring-[#223f98]/10 disabled:bg-slate-100"
                                />
                              </td>
                            ))}
                            <td className={`px-2 py-3 text-center font-bold ${pass ? "text-[#00a447]" : hasGrade ? "text-[#ff2438]" : "text-slate-500"}`}>
                              {grade === null ? "-" : grade.toFixed(1)}
                            </td>
                            <td className="px-2 py-3 text-center">
                              <span className={`rounded-md px-3 py-1 text-xs font-bold text-white ${
                                !hasGrade ? "bg-slate-400" : pass ? "bg-[#00a447]" : "bg-[#ff2438]"
                              }`}>
                                {!hasGrade ? "No Grade" : pass ? "Pass" : "Fail"}
                              </span>
                              <div className="mt-1 text-[11px] capitalize text-slate-500">{row.status}</div>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <div className="inline-flex items-center gap-2">
                                {actorRole === "teacher" && !locked && (
                                  <>
                                    <button
                                      onClick={() => saveRow(row, "save")}
                                      disabled={saving}
                                      className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                                    >
                                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                      Save
                                    </button>
                                    <button
                                      onClick={() => saveRow(row, "submit")}
                                      disabled={saving || !canTeacherSubmit}
                                      className="inline-flex h-8 items-center gap-1 rounded-md bg-[#ffc400] px-2 text-xs font-semibold text-[#001b3f] hover:bg-[#f1b900] disabled:opacity-60"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                      Request Submit
                                    </button>
                                  </>
                                )}
                                {actorRole === "admin" && (
                                  <>
                                    <button
                                      onClick={() => saveRow(row, "save")}
                                      disabled={saving}
                                      className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                                    >
                                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                      Save Edit
                                    </button>
                                    <button
                                      onClick={() => saveRow(row, "finalize")}
                                      disabled={saving || !canAdminFinalize}
                                      className="inline-flex h-8 items-center gap-1 rounded-md bg-[#223f98] px-2 text-xs font-semibold text-white hover:bg-[#1d3581] disabled:opacity-50"
                                    >
                                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                      Accept
                                    </button>
                                  </>
                                )}
                                {actorRole === "teacher" && locked && (
                                  <span className="text-xs font-semibold text-slate-500">Finalized</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {!rows.length && (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                            No students found for this class.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
