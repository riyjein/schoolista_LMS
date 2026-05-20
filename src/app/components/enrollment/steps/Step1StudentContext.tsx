import { GraduationCap, BookOpen, CalendarDays, School } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { courses } from '@/lib/data/enrollment/courses';
import type { YearLevel, Semester } from '@/lib/types/enrollment';
import type { StudentProfile } from '@/lib/types/enrollment';

interface Step1Props {
  courseId: string;
  yearLevel: YearLevel;
  semester: Semester;
  schoolYear: string;
  studentProfile: StudentProfile;
  onCourseChange: (id: string) => void;
  onYearLevelChange: (y: YearLevel) => void;
  onSemesterChange: (s: Semester) => void;
  onSchoolYearChange: (sy: string) => void;
  onNext: () => void;
}

const YEAR_LEVELS: { value: YearLevel; label: string }[] = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];

const SEMESTERS: { value: Semester; label: string }[] = [
  { value: '1st',    label: '1st Semester' },
  { value: '2nd',    label: '2nd Semester' },
  { value: 'Summer', label: 'Summer Term' },
];

const SCHOOL_YEARS = [
  '2024-2025',
  '2025-2026',
  '2026-2027',
];

export function Step1StudentContext({
  courseId,
  yearLevel,
  semester,
  schoolYear,
  studentProfile,
  onCourseChange,
  onYearLevelChange,
  onSemesterChange,
  onSchoolYearChange,
  onNext,
}: Step1Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Student info card */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">{studentProfile.name}</p>
          <p className="text-sm text-slate-500">
            Student No. {studentProfile.studentNumber} &bull;{' '}
            <span className="capitalize">{studentProfile.status}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Current: {studentProfile.yearLevel === 1 ? '1st' : studentProfile.yearLevel === 2 ? '2nd' : studentProfile.yearLevel === 3 ? '3rd' : '4th'} Year &bull; {studentProfile.currentSemester} Semester
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Enrollment Context</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Confirm your enrollment details for this semester.
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Course */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700">
              <School className="w-4 h-4 text-[var(--color-primary)]" />
              Program / Course
            </Label>
            <Select value={courseId} onValueChange={onCourseChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your program" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="font-semibold">{c.code}</span>
                    <span className="text-slate-400 ml-2 text-xs">{c.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Year level */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                Year Level
              </Label>
              <Select
                value={String(yearLevel)}
                onValueChange={(v) => onYearLevelChange(Number(v) as YearLevel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_LEVELS.map((y) => (
                    <SelectItem key={y.value} value={String(y.value)}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <CalendarDays className="w-4 h-4 text-[var(--color-primary)]" />
                Semester
              </Label>
              <Select value={semester} onValueChange={(v) => onSemesterChange(v as Semester)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* School year */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700">
              <CalendarDays className="w-4 h-4 text-[var(--color-primary)]" />
              School Year
            </Label>
            <Select value={schoolYear} onValueChange={onSchoolYearChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_YEARS.map((sy) => (
                  <SelectItem key={sy} value={sy}>
                    {sy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="w-full h-12 bg-[var(--color-primary)] hover:opacity-90 text-white"
      >
        Continue to Subject History
      </Button>
    </div>
  );
}
