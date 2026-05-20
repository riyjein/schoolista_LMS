import { useNavigate } from 'react-router';
import { useStudentDashboard } from '@/lib/hooks/dashboard/useStudentDashboard';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Wallet,
  Clock,
  User,
  MapPin,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const CURRENT_STUDENT_ID = 'student-1';

export function StudentDashboard() {
  const navigate = useNavigate();
  const {
    profile,
    currentEnrollment,
    enrolledSubjects,
    todaySchedule,
    gradesSummary,
    gpa,
    attendanceSummary,
    tuitionSummary,
  } = useStudentDashboard(CURRENT_STUDENT_ID);

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">
          Welcome back, {profile.name.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {profile.studentNumber} · Year {profile.yearLevel} · {profile.status}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Units Enrolled */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Units Enrolled</p>
                <p className="mt-1 text-2xl font-bold">{currentEnrollment?.totalUnits || 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {enrolledSubjects.length} subject{enrolledSubjects.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="mt-1 text-2xl font-bold">
                  {attendanceSummary.attendanceRate.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {attendanceSummary.present + attendanceSummary.late} / {attendanceSummary.totalSessions} sessions
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CalendarCheck className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current GPA */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
                <p className="mt-1 text-2xl font-bold">
                  {gpa !== null ? gpa.toFixed(2) : '—'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {gradesSummary.length} graded subject{gradesSummary.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <GraduationCap className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Balance</p>
                <p className="mt-1 text-2xl font-bold">
                  ₱{tuitionSummary.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tuitionSummary.status === 'paid'
                    ? 'Fully paid'
                    : tuitionSummary.status === 'partial'
                      ? 'Partial payment'
                      : 'Unpaid'}
                </p>
              </div>
              <div className="rounded-full bg-secondary p-3">
                <Wallet className="h-5 w-5 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Today's Schedule</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/schedule')}
              className="h-8 text-xs"
            >
              View All <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No classes today</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {todaySchedule.map((item, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.subjectName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.subjectCode} · {item.instructor}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.startTime} - {item.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.room}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.status === 'ongoing'
                          ? 'default'
                          : item.status === 'upcoming'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="flex-shrink-0 text-xs"
                    >
                      {item.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Grades</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/grades')}
              className="h-8 text-xs"
            >
              View All <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {gradesSummary.length === 0 ? (
              <div className="py-8 text-center">
                <GraduationCap className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No grades available yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {gradesSummary.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.subjectName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.subjectCode}</p>
                      <Badge
                        variant={
                          item.status === 'finalized'
                            ? 'default'
                            : item.status === 'submitted'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="mt-1 text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {item.average !== null ? (
                        <p className="text-lg font-bold text-primary">
                          {item.average.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">—</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Enrolled Subjects */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Enrolled Subjects</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/schedule')}
              className="h-8 text-xs"
            >
              Details <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {enrolledSubjects.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No enrolled subjects</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {enrolledSubjects.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.code} · {item.section}
                      </p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0 text-xs">
                      {item.units} units
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 pt-0">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/student/schedule')}
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              View Schedule
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/student/grades')}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              View Grades
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/student/enrollment')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Enrollment
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/student/attendance')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Attendance History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
