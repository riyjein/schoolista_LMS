import { useState, useMemo, useCallback } from "react";
import type { GradeStatus } from "../../types/grades";
import {
  gradeRecords as fallbackGradeRecords,
  gradeStudents,
  updateGradeRecord,
} from "../../data/grades/grades";
import { classOfferings as fallbackClassOfferings } from "../../data/attendance/class-offerings";
import { subjects as fallbackSubjects } from "../../data/enrollment/subjects";
import { gradeSettings } from "../../data/grades/grade-settings";
import {
  computeGrade,
  type GradeComputationResult,
} from "./useGradeComputation";
import { addSubmissionLog } from "../../data/grading/grading-submissions";
import type { FieldValidation } from "./useGradeValidation";
import { useSupabaseTable } from "../../supabase/useSupabaseTable";
import { updateRow } from "../../supabase/queries";

export interface GradeEdit {
  prelim: number | null;
  midterm: number | null;
  final: number | null;
}

export interface GradeRow {
  recordId: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  subjectCode: string;
  subjectTitle: string;
  subjectUnits: number;
  sectionCode: string;
  prelim: number | null;
  midterm: number | null;
  final: number | null;
  storedStatus: GradeStatus;
  effectiveStatus: GradeStatus;
  computed: GradeComputationResult;
  isDirty: boolean;
  isLocked: boolean;
  fieldErrors: FieldValidation;
}

function validateRange(v: number | null): string | undefined {
  if (v === null) return undefined;
  if (isNaN(v) || v < 0 || v > 100) return "Must be 0–100";
  return undefined;
}

function buildRow(
  recordId: string,
  localEdits: Record<string, GradeEdit>,
  statusOverrides: Record<string, GradeStatus>,
  classId: string,
  gradeRecords: typeof fallbackGradeRecords,
  classOfferings: typeof fallbackClassOfferings,
  subjects: typeof fallbackSubjects,
): GradeRow | null {
  const record = gradeRecords.find((r) => r.id === recordId);
  if (!record) return null;

  const student = gradeStudents[record.studentId];
  const offering = classOfferings.find((o) => o.id === classId);
  const subject = subjects.find((s) => s.id === record.subjectId);

  const edit = localEdits[recordId];
  const prelim = edit ? edit.prelim : record.prelimGrade;
  const midterm = edit ? edit.midterm : record.midtermGrade;
  const final = edit ? edit.final : record.finalGrade;

  const storedStatus = record.status;
  const effectiveStatus = statusOverrides[recordId] ?? storedStatus;

  const isDirty =
    edit !== undefined &&
    (edit.prelim !== record.prelimGrade ||
      edit.midterm !== record.midtermGrade ||
      edit.final !== record.finalGrade);

  const isLocked = effectiveStatus === "finalized";

  const fieldErrors: FieldValidation = isLocked
    ? {}
    : {
        prelim: validateRange(prelim),
        midterm: validateRange(midterm),
        final: validateRange(final),
      };

  return {
    recordId,
    studentId: record.studentId,
    studentName: student?.name ?? record.studentId,
    studentNumber: student?.studentNumber ?? "",
    subjectCode: subject?.code ?? record.subjectId,
    subjectTitle: subject?.title ?? record.subjectId,
    subjectUnits: subject?.units ?? 0,
    sectionCode: offering?.sectionCode ?? record.sectionCode,
    prelim,
    midterm,
    final,
    storedStatus,
    effectiveStatus,
    computed: computeGrade(prelim, midterm, final, gradeSettings),
    isDirty,
    isLocked,
    fieldErrors,
  };
}

export interface UseGradeEncodingReturn {
  rows: GradeRow[];
  updateGrade: (
    recordId: string,
    field: keyof GradeEdit,
    value: number | null,
  ) => void;
  saveDraft: (recordId: string) => void;
  submitRecord: (recordId: string) => void;
  finalizeRecord: (recordId: string) => void;
  bulkSubmit: () => string[];
  bulkFinalize: () => string[];
  dirtyCount: number;
  submitableCount: number;
  finalizableCount: number;
}

export function useGradeEncoding(
  instructorId: string,
  classId: string,
): UseGradeEncodingReturn {
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
  const [localEdits, setLocalEdits] = useState<Record<string, GradeEdit>>({});
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, GradeStatus>
  >({});

  const recordIds = useMemo(
    () => gradeRecords.filter((r) => r.classId === classId).map((r) => r.id),
    [classId, gradeRecords],
  );

  const rows = useMemo<GradeRow[]>(() => {
    return recordIds
      .map((id) =>
        buildRow(
          id,
          localEdits,
          statusOverrides,
          classId,
          gradeRecords,
          classOfferings,
          subjects,
        ),
      )
      .filter((r): r is GradeRow => r !== null)
      .sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [
    recordIds,
    localEdits,
    statusOverrides,
    classId,
    gradeRecords,
    classOfferings,
    subjects,
  ]);

  const updateGrade = useCallback(
    (recordId: string, field: keyof GradeEdit, value: number | null) => {
      const record = gradeRecords.find((r) => r.id === recordId);
      const effectiveStatus = statusOverrides[recordId] ?? record?.status;
      if (!record || effectiveStatus === "finalized") return;

      setLocalEdits((prev) => {
        const current = prev[recordId] ?? {
          prelim: record.prelimGrade,
          midterm: record.midtermGrade,
          final: record.finalGrade,
        };
        return { ...prev, [recordId]: { ...current, [field]: value } };
      });
    },
    [statusOverrides],
  );

  const saveDraft = useCallback(
    (recordId: string) => {
      const record = gradeRecords.find((r) => r.id === recordId);
      const effectiveStatus = statusOverrides[recordId] ?? record?.status;
      if (!record || effectiveStatus === "finalized") return;

      const edit = localEdits[recordId];
      if (!edit) return;

      updateGradeRecord(recordId, {
        prelimGrade: edit.prelim,
        midtermGrade: edit.midterm,
        finalGrade: edit.final,
        status: "draft",
      });
      void updateRow("grade_records", "id", recordId, {
        prelim_grade: edit.prelim,
        midterm_grade: edit.midterm,
        final_grade: edit.final,
        status: "draft",
      });

      addSubmissionLog(classId, instructorId, "save_draft", [record.studentId]);

      setLocalEdits((prev) => {
        const next = { ...prev };
        delete next[recordId];
        return next;
      });
    },
    [localEdits, statusOverrides, classId, instructorId],
  );

  const submitRecord = useCallback(
    (recordId: string) => {
      const record = gradeRecords.find((r) => r.id === recordId);
      const effectiveStatus = statusOverrides[recordId] ?? record?.status;
      if (!record || effectiveStatus === "finalized") return;

      const edit = localEdits[recordId];
      const prelim = edit?.prelim ?? record.prelimGrade;
      const midterm = edit?.midterm ?? record.midtermGrade;
      const final = edit?.final ?? record.finalGrade;

      if (prelim === null || midterm === null || final === null) return;

      updateGradeRecord(recordId, {
        prelimGrade: prelim,
        midtermGrade: midterm,
        finalGrade: final,
        status: "submitted",
      });
      void updateRow("grade_records", "id", recordId, {
        prelim_grade: prelim,
        midterm_grade: midterm,
        final_grade: final,
        status: "submitted",
      });
      addSubmissionLog(classId, instructorId, "submit", [record.studentId]);

      setLocalEdits((prev) => {
        const n = { ...prev };
        delete n[recordId];
        return n;
      });
      setStatusOverrides((prev) => ({ ...prev, [recordId]: "submitted" }));
    },
    [localEdits, statusOverrides, classId, instructorId],
  );

  const finalizeRecord = useCallback(
    (recordId: string) => {
      const record = gradeRecords.find((r) => r.id === recordId);
      const effectiveStatus = statusOverrides[recordId] ?? record?.status;
      if (!record || effectiveStatus !== "submitted") return;

      updateGradeRecord(recordId, { status: "finalized" });
      void updateRow("grade_records", "id", recordId, { status: "finalized" });
      addSubmissionLog(classId, instructorId, "finalize", [record.studentId]);

      setLocalEdits((prev) => {
        const n = { ...prev };
        delete n[recordId];
        return n;
      });
      setStatusOverrides((prev) => ({ ...prev, [recordId]: "finalized" }));
    },
    [statusOverrides, classId, instructorId],
  );

  const bulkSubmit = useCallback((): string[] => {
    const submitted: string[] = [];
    for (const row of rows) {
      if (row.effectiveStatus !== "draft") continue;
      const prelim = row.prelim;
      const midterm = row.midterm;
      const final = row.final;
      if (prelim === null || midterm === null || final === null) continue;
      if (Object.values(row.fieldErrors).some(Boolean)) continue;

      updateGradeRecord(row.recordId, {
        prelimGrade: prelim,
        midtermGrade: midterm,
        finalGrade: final,
        status: "submitted",
      });
      void updateRow("grade_records", "id", row.recordId, {
        prelim_grade: prelim,
        midterm_grade: midterm,
        final_grade: final,
        status: "submitted",
      });
      setStatusOverrides((prev) => ({ ...prev, [row.recordId]: "submitted" }));
      submitted.push(row.studentId);
    }
    if (submitted.length > 0) {
      addSubmissionLog(classId, instructorId, "bulk_submit", submitted);
      setLocalEdits({});
    }
    return submitted;
  }, [rows, classId, instructorId]);

  const bulkFinalize = useCallback((): string[] => {
    const finalized: string[] = [];
    for (const row of rows) {
      if (row.effectiveStatus !== "submitted") continue;
      updateGradeRecord(row.recordId, { status: "finalized" });
      void updateRow("grade_records", "id", row.recordId, {
        status: "finalized",
      });
      setStatusOverrides((prev) => ({ ...prev, [row.recordId]: "finalized" }));
      finalized.push(row.studentId);
    }
    if (finalized.length > 0) {
      addSubmissionLog(classId, instructorId, "bulk_finalize", finalized);
    }
    return finalized;
  }, [rows, classId, instructorId]);

  const dirtyCount = rows.filter((r) => r.isDirty).length;
  const submitableCount = rows.filter(
    (r) =>
      r.effectiveStatus === "draft" &&
      r.computed.isComplete &&
      !Object.values(r.fieldErrors).some(Boolean),
  ).length;
  const finalizableCount = rows.filter(
    (r) => r.effectiveStatus === "submitted",
  ).length;

  return {
    rows,
    updateGrade,
    saveDraft,
    submitRecord,
    finalizeRecord,
    bulkSubmit,
    bulkFinalize,
    dirtyCount,
    submitableCount,
    finalizableCount,
  };
}
