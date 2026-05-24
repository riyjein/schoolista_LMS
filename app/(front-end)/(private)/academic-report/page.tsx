"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  ChevronLeft,
  Download,
  FileText,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Medal,
  Search,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type GradeRecord = {
  class_id: string;
  student_id: string;
  prelim_grade: number | null;
  midterm_grade: number | null;
  final_grade: number | null;
  status: "draft" | "submitted" | "finalized";
};

type StudentProfile = {
  id: string;
  name: string;
  student_number: string;
};

type Subject = {
  id: string;
  code: string;
  title: string;
};

type ClassOffering = {
  id: string;
  subject_id: string;
  section_code: string;
};

const navItems = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "My Grades", icon: GraduationCap },
  { label: "Academic Report", icon: FileText, active: true },
  { label: "My Attendance", icon: Calendar },
];

const achievementItems = [
  { title: "Dean's List", detail: "Spring 2026", sub: "GPA above 3.5", icon: Trophy },
  { title: "Perfect Attendance", detail: "Fall 2025", sub: "100% attendance rate", icon: Calendar },
  { title: "Top Performer - Math", detail: "Spring 2026", sub: "Highest grade in Math 101", icon: Medal },
  { title: "Academic Excellence", detail: "Fall 2025", sub: "Consistent high performance", icon: Star },
];

function computeOverall(record: GradeRecord) {
  if (
    record.prelim_grade === null ||
    record.midterm_grade === null ||
    record.final_grade === null
  ) {
    return null;
  }

  return record.prelim_grade * 0.3 + record.midterm_grade * 0.3 + record.final_grade * 0.4;
}

function toGpa(average: number) {
  if (!average) return 0;
  if (average >= 97) return 1.0;
  if (average >= 94) return 1.25;
  if (average >= 91) return 1.5;
  if (average >= 88) return 1.75;
  if (average >= 85) return 2.0;
  if (average >= 82) return 2.25;
  if (average >= 79) return 2.5;
  if (average >= 76) return 2.75;
  if (average >= 75) return 3.0;
  return 5.0;
}

function letterGrade(grade: number) {
  if (grade >= 90) return "A";
  if (grade >= 85) return "B";
  if (grade >= 80) return "C";
  return "D";
}

export default function AcademicReportPage() {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/grading-system", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load academic report.");

        setGrades(data.grades ?? []);
        setStudents(data.students ?? []);
        setSubjects(data.subjects ?? []);
        setClasses(data.classes ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load report.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const selectedStudent = students.find((student) => student.id === "u7") ?? students[0];

  const finalizedRows = useMemo(() => {
    return grades
      .filter((record) => record.student_id === selectedStudent?.id && record.status === "finalized")
      .map((record) => {
        const classInfo = classes.find((item) => item.id === record.class_id);
        const subject = subjects.find((item) => item.id === classInfo?.subject_id);
        const overall = computeOverall(record);
        return {
          ...record,
          subjectCode: subject?.code ?? record.class_id,
          subjectTitle: subject?.title ?? "Subject",
          sectionCode: classInfo?.section_code ?? "",
          overall,
        };
      })
      .filter((row) => row.overall !== null);
  }, [classes, grades, selectedStudent?.id, subjects]);

  const average = finalizedRows.length
    ? finalizedRows.reduce((sum, row) => sum + (row.overall ?? 0), 0) / finalizedRows.length
    : 0;
  const currentGpa = toGpa(average);
  const cumulativeGpa = Math.max(1, currentGpa - 0.1);

  const trend = finalizedRows.map((row, index) => ({
    label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index] ?? row.subjectCode,
    grade: Number((row.overall ?? 0).toFixed(1)),
  }));

  const distribution = ["A", "B", "C", "D"].map((grade) => {
    const count = finalizedRows.filter((row) => row.overall !== null && letterGrade(row.overall) === grade).length;
    return {
      grade,
      value: finalizedRows.length ? Math.round((count / finalizedRows.length) * 100) : 0,
    };
  });

  const distributionColors = {
    A: "#10b981",
    B: "#facc15",
    C: "#3b82f6",
    D: "#f59e0b",
  } as const;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#001b3f]">
      <div className="grid min-h-screen grid-cols-[258px_minmax(0,1fr)]">
        <aside className="flex min-h-screen flex-col bg-[#223f98] text-white">
          <div className="flex h-[92px] items-center gap-3 border-b border-white/10 px-7">
            <BookOpen className="h-8 w-8 text-[#ffc400]" />
            <div>
              <div className="text-lg font-bold tracking-wide">OLOPSC</div>
              <div className="text-xs font-bold text-[#ffc400]">Schoolista</div>
            </div>
          </div>

          <nav className="flex-1 space-y-3 px-3 py-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.label === "My Grades" ? "/grading-system" : "#"}
                  className={`flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold transition ${
                    item.active ? "bg-[#ffc400] text-[#001b3f]" : "text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-[#294bcb] p-3 text-sm">
              <Users className="h-5 w-5 text-[#ffc400]" />
              <div>
                <div className="text-xs text-white/80">Logged in as</div>
                <div className="font-semibold">Student</div>
              </div>
            </div>
            <button className="flex h-10 w-full items-center justify-center text-white/90">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
            <label className="relative block w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-[#223f98]"
                placeholder="Search students, reports, or courses..."
              />
            </label>

            <div className="flex items-center gap-6">
              <div className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#ffc400] text-xs font-bold">3</span>
              </div>
              <div className="text-right text-sm">
                <div className="font-bold">{selectedStudent?.name ?? "Student"}</div>
                <div className="text-xs text-slate-500">Student</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffc400] text-sm font-bold">
                {(selectedStudent?.name ?? "ET")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            </div>
          </header>

          <div className="px-6 py-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Academic Reports</h1>
                <p className="mt-2 text-base text-slate-600">
                  View your academic performance and download reports
                </p>
              </div>
              <button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#ffc400] px-4 text-sm font-semibold text-[#001b3f] shadow-sm">
                <Download className="h-4 w-4" />
                Download Full Report
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-80 items-center justify-center text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading academic report...
              </div>
            ) : (
              <>
                <section className="mb-6 grid gap-6 md:grid-cols-4">
                  {[
                    ["Current GPA", currentGpa.toFixed(2), "Current", Medal, "bg-amber-100 text-amber-700"],
                    ["Overall GPA", cumulativeGpa.toFixed(2), "Cumulative", BarChart3, "bg-emerald-100 text-emerald-700"],
                    ["Total Credits", String(finalizedRows.length * 3), "Credits", BookOpen, "bg-blue-100 text-blue-700"],
                    ["Available Reports", "3", "Reports", Target, "bg-purple-100 text-purple-700"],
                  ].map(([label, value, badge, Icon, badgeClass]) => (
                    <article key={label as string} className="rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">
                      <div className="mb-5 flex items-center justify-between">
                        <Icon className="h-5 w-5 text-[#ffc400]" />
                        <span className={`rounded-md px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                          {badge as string}
                        </span>
                      </div>
                      <p className="text-3xl font-light">{value as string}</p>
                      <p className="mt-1 text-sm text-slate-600">{label as string}</p>
                    </article>
                  ))}
                </section>

                <section className="mb-6 rounded-lg bg-[#ffc400] p-6 shadow-lg shadow-slate-200/70">
                  <h2 className="font-bold">Recent Achievements</h2>
                  <p className="mt-2">Your academic accomplishments</p>
                  <div className="mt-7 grid gap-4 md:grid-cols-4">
                    {achievementItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <article key={item.title} className="rounded-lg bg-white p-5 text-center shadow-md">
                          <Icon className="mx-auto h-10 w-10 text-[#001b3f]" />
                          <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                          <p className="mt-2 text-xs text-slate-500">{item.detail}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <div className="mb-8 inline-flex rounded-full border border-slate-200 bg-white p-1 text-sm font-semibold shadow-sm">
                  {["Performance Analysis", "Subject Reports", "Semester Reports", "Skills Assessment"].map((tab, index) => (
                    <button
                      key={tab}
                      className={`rounded-full px-3 py-1 ${index === 0 ? "bg-[#223f98] text-white" : "text-[#001b3f]"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <section className="grid gap-6 lg:grid-cols-2">
                  <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h2 className="font-bold">Performance Trend</h2>
                        <p className="text-slate-600">Your average grades over time</p>
                      </div>
                      <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold">
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend.length ? trend : [{ label: "No Data", grade: 0 }]}>
                          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="grade"
                            stroke="#ffc400"
                            strokeWidth={3}
                            dot={{ r: 7, fill: "#ffc400", stroke: "#ffc400" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </article>

                  <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70">
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h2 className="font-bold">Grade Distribution</h2>
                        <p className="text-slate-600">Your grades breakdown</p>
                      </div>
                      <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold">
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distribution}
                            dataKey="value"
                            nameKey="grade"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(props) => {
                              const payload = props.payload as { grade?: string; value?: number } | undefined;
                              return `${payload?.grade ?? ""}: ${payload?.value ?? 0}%`;
                            }}
                          >
                            {distribution.map((entry) => (
                              <Cell
                                key={entry.grade}
                                fill={distributionColors[entry.grade as keyof typeof distributionColors]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </article>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
