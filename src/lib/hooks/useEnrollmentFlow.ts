import { useState, useCallback, useMemo } from 'react';
import type {
  EnrollmentFlowState,
  EnrollmentRecord,
  YearLevel,
  Semester,
  EnrollmentStrategy,
} from '../types/enrollment';
import { getPassedSubjectIdsForStudent } from '../data/enrollment/completed-subjects';
import { addSessionEnrollment } from '../data/enrollment/enrollment-history';
import { addSessionReceipt } from '../data/enrollment/receipts';
import type { ReceiptRecord } from '../types/enrollment';
import { insertRow } from '../supabase/queries';
import { updateRow } from '../supabase/queries';

const TOTAL_STEPS = 6;

interface UseEnrollmentFlowOptions {
  studentId: string;
  defaultCourseId?: string;
  defaultYearLevel?: YearLevel;
  defaultSemester?: Semester;
  defaultSchoolYear?: string;
}

export function useEnrollmentFlow({
  studentId,
  defaultCourseId = 'bscs',
  defaultYearLevel = 2,
  defaultSemester = '1st',
  defaultSchoolYear = '2024-2025',
}: UseEnrollmentFlowOptions) {
  const initialCompletedIds = getPassedSubjectIdsForStudent(studentId);

  const [state, setState] = useState<EnrollmentFlowState>({
    currentStep: 1,
    courseId: defaultCourseId,
    yearLevel: defaultYearLevel,
    semester: defaultSemester,
    schoolYear: defaultSchoolYear,
    completedSubjectIds: initialCompletedIds,
    selectedSubjectIds: [],
    strategy: 'balanced',
    receiptFile: null,
    receiptPreview: null,
    receiptAmount: '',
    receiptReference: '',
    enrollmentRecord: null,
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goToStep = useCallback((step: number) => {
    if (step < 1 || step > TOTAL_STEPS) return;
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, TOTAL_STEPS),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  // ─── Step 1: Context ──────────────────────────────────────────────────────

  const setCourse = useCallback((courseId: string) => {
    setState((prev) => ({
      ...prev,
      courseId,
      selectedSubjectIds: [],
      completedSubjectIds: getPassedSubjectIdsForStudent(studentId),
    }));
  }, [studentId]);

  const setYearLevel = useCallback((yearLevel: YearLevel) => {
    setState((prev) => ({ ...prev, yearLevel, selectedSubjectIds: [] }));
  }, []);

  const setSemester = useCallback((semester: Semester) => {
    setState((prev) => ({ ...prev, semester, selectedSubjectIds: [] }));
  }, []);

  const setSchoolYear = useCallback((schoolYear: string) => {
    setState((prev) => ({ ...prev, schoolYear }));
  }, []);

  // ─── Step 2: Completed Subjects ───────────────────────────────────────────

  const toggleCompletedSubject = useCallback((subjectId: string) => {
    setState((prev) => {
      const ids = prev.completedSubjectIds;
      const next = ids.includes(subjectId)
        ? ids.filter((id) => id !== subjectId)
        : [...ids, subjectId];
      return {
        ...prev,
        completedSubjectIds: next,
        selectedSubjectIds: prev.selectedSubjectIds.filter((id) => !next.includes(id)),
      };
    });
  }, []);

  const setCompletedSubjectIds = useCallback((ids: string[]) => {
    setState((prev) => ({
      ...prev,
      completedSubjectIds: ids,
      selectedSubjectIds: prev.selectedSubjectIds.filter((id) => !ids.includes(id)),
    }));
  }, []);

  // ─── Step 3: Subject Selection ────────────────────────────────────────────

  const toggleSelectedSubject = useCallback((subjectId: string) => {
    setState((prev) => {
      const ids = prev.selectedSubjectIds;
      const next = ids.includes(subjectId)
        ? ids.filter((id) => id !== subjectId)
        : [...ids, subjectId];
      return { ...prev, selectedSubjectIds: next };
    });
  }, []);

  const applySuggestions = useCallback((suggestedIds: string[]) => {
    setState((prev) => {
      const merged = [...new Set([...prev.selectedSubjectIds, ...suggestedIds])];
      return { ...prev, selectedSubjectIds: merged };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedSubjectIds: [] }));
  }, []);

  const setStrategy = useCallback((strategy: EnrollmentStrategy) => {
    setState((prev) => ({ ...prev, strategy }));
  }, []);

  // ─── Step 5: Receipt ──────────────────────────────────────────────────────

  const setReceiptFile = useCallback((file: File | null, preview: string | null) => {
    setState((prev) => ({ ...prev, receiptFile: file, receiptPreview: preview }));
  }, []);

  const setReceiptAmount = useCallback((amount: string) => {
    setState((prev) => ({ ...prev, receiptAmount: amount }));
  }, []);

  const setReceiptReference = useCallback((ref: string) => {
    setState((prev) => ({ ...prev, receiptReference: ref }));
  }, []);

  // ─── Step 6: Submit ───────────────────────────────────────────────────────

  const submitEnrollment = useCallback(() => {
    setState((prev) => {
      const refNumber = `ENR-${prev.schoolYear.replace('-', '')}-${studentId.toUpperCase()}-${Date.now().toString().slice(-5)}`;
      const enrollmentId = `enr-${Date.now()}`;

      const record: EnrollmentRecord = {
        id: enrollmentId,
        referenceNumber: refNumber,
        studentId,
        courseId: prev.courseId,
        yearLevel: prev.yearLevel,
        semester: prev.semester,
        schoolYear: prev.schoolYear,
        subjectIds: prev.selectedSubjectIds,
        totalUnits: 0, // computed by consumer
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };

      addSessionEnrollment(record);
      // Supabase CRUD goes here: persist the enrollment header plus the
      // enrollment_record_subjects rows selected in this step.
      void insertRow('enrollment_records', {
        id: record.id,
        reference_number: record.referenceNumber,
        student_id: record.studentId,
        course_id: record.courseId,
        year_level: record.yearLevel,
        semester: record.semester,
        school_year: record.schoolYear,
        total_units: record.totalUnits,
        status: record.status,
        submitted_at: record.submittedAt,
        receipt_id: null,
      });
      void Promise.all(prev.selectedSubjectIds.map((subjectId) =>
        insertRow('enrollment_record_subjects', {
          enrollment_id: enrollmentId,
          subject_id: subjectId,
        }),
      ));

      if (prev.receiptFile) {
        const receipt: ReceiptRecord = {
          id: `rcpt-${Date.now()}`,
          studentId,
          enrollmentId,
          filename: prev.receiptFile.name,
          fileSize: prev.receiptFile.size,
          uploadedAt: new Date().toISOString(),
          amount: parseFloat(prev.receiptAmount) || 0,
          referenceNumber: prev.receiptReference || `PAY-${Date.now()}`,
          status: 'pending',
          previewUrl: prev.receiptPreview ?? undefined,
        };
        addSessionReceipt(receipt);
        record.receiptId = receipt.id;
        void insertRow('receipts', {
          id: receipt.id,
          student_id: receipt.studentId,
          enrollment_id: receipt.enrollmentId,
          filename: receipt.filename,
          file_size: receipt.fileSize,
          uploaded_at: receipt.uploadedAt,
          amount: receipt.amount,
          reference_number: receipt.referenceNumber,
          status: receipt.status,
          preview_url: receipt.previewUrl ?? null,
        });
        void updateRow('enrollment_records', 'id', enrollmentId, { receipt_id: receipt.id });
      }

      return { ...prev, enrollmentRecord: record, currentStep: 6 };
    });
  }, [studentId]);

  const resetFlow = useCallback(() => {
    setState({
      currentStep: 1,
      courseId: defaultCourseId,
      yearLevel: defaultYearLevel,
      semester: defaultSemester,
      schoolYear: defaultSchoolYear,
      completedSubjectIds: getPassedSubjectIdsForStudent(studentId),
      selectedSubjectIds: [],
      strategy: 'balanced',
      receiptFile: null,
      receiptPreview: null,
      receiptAmount: '',
      receiptReference: '',
      enrollmentRecord: null,
    });
  }, [studentId, defaultCourseId, defaultYearLevel, defaultSemester, defaultSchoolYear]);

  const isStepComplete = useMemo(() => {
    return {
      1: true, // context always fillable
      2: true, // optional step
      3: state.selectedSubjectIds.length > 0,
      4: true,
      5: state.receiptFile !== null,
      6: state.enrollmentRecord !== null,
    } as Record<number, boolean>;
  }, [state.selectedSubjectIds, state.receiptFile, state.enrollmentRecord]);

  return {
    state,
    totalSteps: TOTAL_STEPS,
    goToStep,
    nextStep,
    prevStep,
    setCourse,
    setYearLevel,
    setSemester,
    setSchoolYear,
    toggleCompletedSubject,
    setCompletedSubjectIds,
    toggleSelectedSubject,
    applySuggestions,
    clearSelection,
    setStrategy,
    setReceiptFile,
    setReceiptAmount,
    setReceiptReference,
    submitEnrollment,
    resetFlow,
    isStepComplete,
  };
}
