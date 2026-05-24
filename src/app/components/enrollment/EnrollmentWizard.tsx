import { EnrollmentStepIndicator } from './components/EnrollmentStepIndicator';
import { Step1StudentContext } from './steps/Step1StudentContext';
import { Step2CompletedSubjects } from './steps/Step2CompletedSubjects';
import { Step3SubjectSelection } from './steps/Step3SubjectSelection';
import { Step4EnrollmentSummary } from './steps/Step4EnrollmentSummary';
import { Step5ReceiptUpload } from './steps/Step5ReceiptUpload';
import { Step6Confirmation } from './steps/Step6Confirmation';
import { useEnrollmentFlow } from '@/lib/hooks/useEnrollmentFlow';
import { useSubjectValidation } from '@/lib/hooks/useSubjectValidation';
import { useUnitComputation } from '@/lib/hooks/useUnitComputation';
import { useEnrollmentSummary } from '@/lib/hooks/useEnrollmentSummary';
import { useReceiptUpload } from '@/lib/hooks/useReceiptUpload';
import { getCourseById } from '@/lib/data/enrollment/courses';
import { getSubjectsByIds } from '@/lib/data/enrollment/subjects';
import type { StudentProfile } from '@/lib/types/enrollment';

interface EnrollmentWizardProps {
  studentProfile: StudentProfile;
}

export function EnrollmentWizard({ studentProfile }: EnrollmentWizardProps) {
  const flow = useEnrollmentFlow({
    studentId: studentProfile.id,
    defaultCourseId: studentProfile.courseId,
    defaultYearLevel: studentProfile.yearLevel,
    defaultSemester: studentProfile.currentSemester,
    defaultSchoolYear: studentProfile.schoolYear,
  });

  const { state } = flow;

  const validation = useSubjectValidation({
    studentId: studentProfile.id,
    courseId: state.courseId,
    yearLevel: state.yearLevel,
    semester: state.semester,
    completedSubjectIds: state.completedSubjectIds,
    selectedSubjectIds: state.selectedSubjectIds,
  });

  const computation = useUnitComputation(state.selectedSubjectIds);

  const { tuitionBreakdown, selectedSubjects } = useEnrollmentSummary(
    state.courseId,
    state.selectedSubjectIds,
  );

  const receiptUpload = useReceiptUpload();

  const course = getCourseById(state.courseId);

  const handleReceiptFileChange = (file: File | null, preview: string | null) => {
    flow.setReceiptFile(file, preview);
    if (file) {
      flow.setReceiptAmount(receiptUpload.amount || tuitionBreakdown.grandTotal.toString());
      flow.setReceiptReference(receiptUpload.reference || '');
    }
  };

  const handleSubmit = () => {
    flow.setReceiptAmount(receiptUpload.amount);
    flow.setReceiptReference(receiptUpload.reference);
    flow.submitEnrollment();
  };

  const finalSubjects = state.enrollmentRecord
    ? getSubjectsByIds(state.enrollmentRecord.subjectIds)
    : selectedSubjects;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Step indicator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <EnrollmentStepIndicator
            currentStep={state.currentStep}
            onStepClick={flow.goToStep}
            completedSteps={flow.isStepComplete}
          />
        </div>

        {/* Step content */}
        <div className="pb-12">
          {state.currentStep === 1 && (
            <Step1StudentContext
              courseId={state.courseId}
              yearLevel={state.yearLevel}
              semester={state.semester}
              schoolYear={state.schoolYear}
              studentProfile={studentProfile}
              onCourseChange={flow.setCourse}
              onYearLevelChange={flow.setYearLevel}
              onSemesterChange={flow.setSemester}
              onSchoolYearChange={flow.setSchoolYear}
              onNext={flow.nextStep}
            />
          )}

          {state.currentStep === 2 && (
            <Step2CompletedSubjects
              studentId={studentProfile.id}
              courseId={state.courseId}
              yearLevel={state.yearLevel}
              semester={state.semester}
              completedSubjectIds={state.completedSubjectIds}
              onToggle={flow.toggleCompletedSubject}
              onSetAll={flow.setCompletedSubjectIds}
              onNext={flow.nextStep}
              onBack={flow.prevStep}
            />
          )}

          {state.currentStep === 3 && (
            <Step3SubjectSelection
              courseId={state.courseId}
              yearLevel={state.yearLevel}
              semester={state.semester}
              enrichedSubjects={validation.enrichedSubjects}
              selectedSubjectIds={state.selectedSubjectIds}
              completedSubjectIds={state.completedSubjectIds}
              strategy={state.strategy}
              computation={computation}
              validationErrors={validation.validationErrors}
              onToggle={flow.toggleSelectedSubject}
              onApplySuggestions={flow.applySuggestions}
              onStrategyChange={flow.setStrategy}
              onClearSelection={flow.clearSelection}
              onNext={flow.nextStep}
              onBack={flow.prevStep}
            />
          )}

          {state.currentStep === 4 && (
            <Step4EnrollmentSummary
              selectedSubjects={selectedSubjects}
              computation={computation}
              tuitionBreakdown={tuitionBreakdown}
              courseCode={course?.code ?? state.courseId.toUpperCase()}
              yearLevel={state.yearLevel}
              semester={state.semester}
              schoolYear={state.schoolYear}
              validationErrors={validation.validationErrors}
              onNext={flow.nextStep}
              onBack={flow.prevStep}
            />
          )}

          {state.currentStep === 5 && (
            <Step5ReceiptUpload
              receiptUpload={receiptUpload}
              estimatedTotal={tuitionBreakdown.grandTotal}
              onNext={handleSubmit}
              onBack={flow.prevStep}
              onFileChange={handleReceiptFileChange}
            />
          )}

          {state.currentStep === 6 && state.enrollmentRecord && (
            <Step6Confirmation
              enrollmentRecord={state.enrollmentRecord}
              selectedSubjects={finalSubjects}
              tuitionBreakdown={tuitionBreakdown}
              courseCode={course?.code ?? state.courseId.toUpperCase()}
              courseName={course?.name ?? ''}
              onReset={flow.resetFlow}
            />
          )}
        </div>
      </div>
    </div>
  );
}
