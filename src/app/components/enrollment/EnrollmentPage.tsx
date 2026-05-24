import { useAuth } from '@/app/context/AuthContext';
import { EnrollmentWizard } from './EnrollmentWizard';
import { PageHeader } from '@/app/components/shared/PageHeader';
import { AlertCircle } from 'lucide-react';
import {
  getStudentProfileByUserId,
  defaultStudentProfile,
} from '@/lib/data/enrollment/students';

export default function EnrollmentPage() {
  const { currentUser } = useAuth();

  const studentProfile =
    getStudentProfileByUserId(currentUser.id) ?? defaultStudentProfile;

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 sm:px-6 pt-6 pb-2">
        <PageHeader
          title="Student Enrollment"
          description="Enroll in subjects for the upcoming semester. Follow the steps below to complete your enrollment."
        />
      </div>

      {/* Demo mode notice */}
      {currentUser.role !== 'student' && (
        <div className="mx-4 sm:mx-6 mt-2 mb-0 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">Demo Mode:</span> You are viewing this page as{' '}
            <span className="font-semibold capitalize">{currentUser.role}</span>. Enrollment data
            shown is for the sample student profile (Jane Doe, BSCS 2nd Year).
          </p>
        </div>
      )}

      <EnrollmentWizard studentProfile={studentProfile} />
    </div>
  );
}
