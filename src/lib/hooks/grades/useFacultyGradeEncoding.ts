import { useState, useMemo, useCallback } from "react";
import type {
  GradeRecord,
  EnrichedGradeRecord,
  GradeStatus,
} from "../../types/grades";
import type { ClassOffering } from "../../types/attendance";
import {
  gradeRecords as fallbackGradeRecords,
  gradeStudents,
  updateGradeRecord,
} from "../../data/grades/grades";
import { classOfferings as fallbackClassOfferings } from "../../data/attendance/class-offerings";
import { subjects as fallbackSubjects } from "../../data/enrollment/subjects";
import { instructors as fallbackInstructors } from "../../data/attendance/instructors";
import { computeOverallGrade } from "./useGradeComputation";
import { gradeSettings } from "../../data/grades/grade-settings";
import { useSupabaseTable } from "../../supabase/useSupabaseTable";
import { updateRow } from "../../supabase/queries";

// In-memory snapshot of the store for the faculty session
// Re-reading from gradeRecords on selectedClass change picks up latest store state

export interface LocalGradeEdit {
  prelim: number | null;
  midterm: number | null;
  final: number | null;
}

export interface FacultyGradeRow extends EnrichedGradeRecord {
  localEdit: LocalGradeEdit;
  isDirty: boolean;
}

export interface UseFacultyGradeEncodingReturn {
  instructorClasses: ClassOffering[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  rows: FacultyGradeRow[];
  updateLocal: (
    recordId: string,
    field: keyof LocalGradeEdit,
    value: number | null,
  ) => void;
  saveDraft: (recordId: string) => void;
  submitGrade: (recordId: string) => void;
  finalizeGrade: (recordId: string) => void;
  submitAll: () => void;
  finalizeAll: () => void;
  validateGrade: (value: number | null) => string | null;
  isDirty: (recordId: string) => boolean;
}

function buildEnriched(
  r: GradeRecord,
  edits: Record<string, LocalGradeEdit>,
  classOfferings: typeof fallbackClassOfferings,
  subjects: typeof fallbackSubjects,
  instructors: typeof fallbackInstructors,
): FacultyGradeRow {
  const student = gradeStudents[r.studentId];
  const offering = classOfferings.find((o) => o.id === r.classId);
  const subject = subjects.find((s) => s.id === r.subjectId);
  const instructor = instructors.find((i) => i.id === r.instructorId);

  const local = edits[r.id] ?? {
    prelim: r.prelimGrade,
    midterm: r.midtermGrade,
    final: r.finalGrade,
  };
  const isDirty =
    local.prelim !== r.prelimGrade ||
    local.midterm !== r.midtermGrade ||
    local.final !== r.finalGrade;

  const computed = computeOverallGrade(
    local.prelim,
    local.midterm,
    local.final,
    gradeSettings,
  );

  return {
    ...r,
    studentName: student?.name ?? r.studentId,
    studentNumber: student?.studentNumber ?? "",
    subjectCode: subject?.code ?? r.subjectId,
    subjectTitle: subject?.title ?? r.subjectId,
    subjectUnits: subject?.units ?? 0,
    instructorName: instructor?.name ?? r.instructorId,
    computed,
    localEdit: local,
    isDirty,
  };
}

export function useFacultyGradeEncoding(
  instructorId: string,
): UseFacultyGradeEncodingReturn {
  const { data: gradeRecords } = useSupabaseTable({
    table: "grade_records",
    fallback: fallbackGradeRecords,
    orderBy: "id",
  });
  const { data: classOfferings } = useSupabaseTable({
    table: "class_offerings",
    fallback: fallbackClassOfferings,
    orderBy: "id",
  });
  const { data: subjects } = useSupabaseTable({
    table: "subjects",
    fallback: fallbackSubjects,
    orderBy: "code",
  });
  const { data: instructors } = useSupabaseTable({
    table: "instructors",
    fallback: fallbackInstructors,
    orderBy: "name",
  });

  const instructorClasses = useMemo(
    () => classOfferings.filter((o) => o.instructorId === instructorId),
    [instructorId, classOfferings],
  );

  const [selectedClassId, setSelectedClassIdState] = useState(
    instructorClasses[0]?.id ?? "",
  );

  // Local edits: recordId → { prelim, midterm, final }
  const [localEdits, setLocalEdits] = useState<Record<string, LocalGradeEdit>>(
    {},
  );

  // Track status changes (submit/finalize) in local state
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, GradeStatus>
  >({});

  const setSelectedClassId = useCallback((id: string) => {
    setSelectedClassIdState(id);
    setLocalEdits({});
    setStatusOverrides({});
  }, []);

  const rows = useMemo<FacultyGradeRow[]>(() => {
    const classRecords = gradeRecords.filter(
      (r) => r.classId === selectedClassId,
    );
    return classRecords
      .map((r) => {
        const withStatus: GradeRecord = statusOverrides[r.id]
          ? { ...r, status: statusOverrides[r.id] }
          : r;
        return buildEnriched(
          withStatus,
          localEdits,
          classOfferings,
          subjects,
          instructors,
        );
      })
      .sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [
    selectedClassId,
    localEdits,
    statusOverrides,
    gradeRecords,
    classOfferings,
    subjects,
    instructors,
  ]);

  const updateLocal = useCallback(
    (recordId: string, field: keyof LocalGradeEdit, value: number | null) => {
      const record = gradeRecords.find((r) => r.id === recordId);
      if (!record || record.status === "finalized") return;

      setLocalEdits((prev) => {
        const current = prev[recordId] ?? {
          prelim: record.prelimGrade,
          midterm: record.midtermGrade,
          final: record.finalGrade,
        };
        return { ...prev, [recordId]: { ...current, [field]: value } };
      });
    },
    [],
  );

  const validateGrade = useCallback((value: number | null): string | null => {
    if (value === null) return null;
    if (value < 0 || value > 100) return "Grade must be between 0 and 100";
    return null;
  }, []);

  const saveDraft = useCallback(
    (recordId: string) => {
      const record = gradeRecords.find((r) => r.id === recordId);
      if (!record || record.status === "finalized") return;

      const edit = localEdits[recordId];
      if (!edit) return;

      updateGradeRecord(recordId, {
        prelimGrade: edit.prelim,
        midtermGrade: edit.midterm,
        finalGrade: edit.final,
      });
      void updateRow("grade_records", "id", recordId, {
        prelim_grade: edit.prelim,
        midterm_grade: edit.midterm,
        final_grade: edit.final,
      });

      setLocalEdits((prev) => {
        const next = { ...prev };
        delete next[recordId];
        return next;
      });
    },
    [localEdits],
  );

  const submitGrade = useCallback(
    (recordId: string) => {
      const record = gradeRecords.find((r) => r.id === recordId);
      if (!record || record.status === "finalized") return;

      const edit = localEdits[recordId];
      if (edit) {
        updateGradeRecord(recordId, {
          prelimGrade: edit.prelim,
          midtermGrade: edit.midterm,
          finalGrade: edit.final,
          status: "submitted",
        });
        void updateRow("grade_records", "id", recordId, {
          prelim_grade: edit.prelim,
          midterm_grade: edit.midterm,
          final_grade: edit.final,
          status: "submitted",
        });
        setLocalEdits((prev) => {
          const next = { ...prev };
          delete next[recordId];
          return next;
        });
      } else {
        updateGradeRecord(recordId, { status: "submitted" });
        void updateRow("grade_records", "id", recordId, {
          status: "submitted",
        });
      }
      setStatusOverrides((prev) => ({ ...prev, [recordId]: "submitted" }));
    },
    [localEdits],
  );

  const finalizeGrade = useCallback(
    (recordId: string) => {
      const record = gradeRecords.find((r) => r.id === recordId);
      const effectiveStatus = statusOverrides[recordId] ?? record?.status;
      if (!record || effectiveStatus === "draft") return;

      updateGradeRecord(recordId, { status: "finalized" });
      void updateRow("grade_records", "id", recordId, { status: "finalized" });
      setStatusOverrides((prev) => ({ ...prev, [recordId]: "finalized" }));
      setLocalEdits((prev) => {
        const next = { ...prev };
        delete next[recordId];
        return next;
      });
    },
    [statusOverrides],
  );

  const submitAll = useCallback(() => {
    const classRecords = gradeRecords.filter(
      (r) => r.classId === selectedClassId,
    );
    for (const r of classRecords) {
      const effectiveStatus = statusOverrides[r.id] ?? r.status;
      if (effectiveStatus !== "draft") continue;
      const edit = localEdits[r.id];
      const finalGrade = edit?.final ?? r.finalGrade;
      if (finalGrade === null) continue; // can't submit incomplete

      updateGradeRecord(r.id, {
        prelimGrade: edit?.prelim ?? r.prelimGrade,
        midtermGrade: edit?.midterm ?? r.midtermGrade,
        finalGrade,
        status: "submitted",
      });
      void updateRow("grade_records", "id", r.id, {
        prelim_grade: edit?.prelim ?? r.prelimGrade,
        midterm_grade: edit?.midterm ?? r.midtermGrade,
        final_grade: finalGrade,
        status: "submitted",
      });
      setStatusOverrides((prev) => ({ ...prev, [r.id]: "submitted" }));
    }
    setLocalEdits({});
  }, [selectedClassId, statusOverrides, localEdits]);

  const finalizeAll = useCallback(() => {
    const classRecords = gradeRecords.filter(
      (r) => r.classId === selectedClassId,
    );
    for (const r of classRecords) {
      const effectiveStatus = statusOverrides[r.id] ?? r.status;
      if (effectiveStatus !== "submitted") continue;
      updateGradeRecord(r.id, { status: "finalized" });
      void updateRow("grade_records", "id", r.id, { status: "finalized" });
      setStatusOverrides((prev) => ({ ...prev, [r.id]: "finalized" }));
    }
  }, [selectedClassId, statusOverrides]);

  const isDirty = useCallback(
    (recordId: string) => {
      const edit = localEdits[recordId];
      if (!edit) return false;
      const record = gradeRecords.find((r) => r.id === recordId);
      if (!record) return false;
      return (
        edit.prelim !== record.prelimGrade ||
        edit.midterm !== record.midtermGrade ||
        edit.final !== record.finalGrade
      );
    },
    [localEdits],
  );

  return {
    instructorClasses,
    selectedClassId,
    setSelectedClassId,
    rows,
    updateLocal,
    saveDraft,
    submitGrade,
    finalizeGrade,
    submitAll,
    finalizeAll,
    validateGrade,
    isDirty,
  };
}
