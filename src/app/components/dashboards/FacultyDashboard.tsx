import { useNavigate } from 'react-router';
import { useFacultyDashboard } from '@/lib/hooks/dashboard/useFacultyDashboard';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Users,
  CalendarCheck,
  PenLine,
  Clock,
  BookOpen,
  Star,
  ChevronRight,
  MapPin,
  AlertCircle,
} from 'lucide-react';

const CURRENT_INSTRUCTOR_ID = 'inst-2';

export function FacultyDashboard() {
  const navigate = useNavigate();
  const {
    profile,
    handledSubjects,
    todaySchedule,
    totalEnrolledStudents,
    pendingGrades,
    recentSessions,
    evaluationSummary,
  } = useFacultyDashboard(CURRENT_INSTRUCTOR_ID);

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const totalPendingGrades = pendingGrades.reduce((sum, p) => sum + p.pendingCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">Good day, {profile.name}!</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {profile.department} · {profile.employeeId}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="mt-1 text-2xl font-bold">{totalEnrolledStudents}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across {handledSubjects.length} subject{handledSubjects.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes Today */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Classes Today</p>
                <p className="mt-1 text-2xl font-bold">{todaySchedule.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {todaySchedule.length > 0
                    ? `Next: ${todaySchedule[0].startTime}`
                    : 'No classes today'}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Clock className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Grades */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Grades</p>
                <p className="mt-1 text-2xl font-bold">{totalPendingGrades}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pendingGrades.length} class{pendingGrades.length !== 1 ? 'es' : ''} with pending
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <PenLine className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluations */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="mt-1 text-2xl font-bold">
                  {evaluationSummary.averageRating > 0
                    ? evaluationSummary.averageRating.toFixed(1)
                    : '—'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {evaluationSummary.totalEvaluations} evaluation
                  {evaluationSummary.totalEvaluations !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Star className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Classes */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Today's Classes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/faculty/schedules')}
              className="h-8 text-xs"
            >
              View All <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No classes scheduled today</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {todaySchedule.map((item, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.subjectName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.subjectCode} · {item.section}
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
                    <div className="flex flex-col items-end gap-1">
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
                      <span className="text-xs text-muted-foreground">
                        {item.enrolledCount} students
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Pending Grade Submissions */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Pending Grade Submissions</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/faculty/grading')}
              className="h-8 text-xs"
            >
              Manage <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {pendingGrades.length === 0 ? (
              <div className="py-8 text-center">
                <PenLine className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">All grades are up to date</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {pendingGrades.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.subjectName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.subjectCode} · {item.section}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="destructive" className="flex-shrink-0 text-xs">
                        {item.pendingCount} pending
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        of {item.totalStudents}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Handled Subjects */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Handled Subjects</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/faculty/students')}
              className="h-8 text-xs"
            >
              View Students <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {handledSubjects.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No subjects assigned</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {handledSubjects.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.code} · {item.section} · {item.room}
                      </p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0 text-xs">
                      {item.enrolledCount}
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
              onClick={() => navigate('/faculty/grading')}
            >
              <PenLine className="mr-2 h-4 w-4" />
              Manage Grades
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/faculty/attendance')}
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              Attendance
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/faculty/students')}
            >
              <Users className="mr-2 h-4 w-4" />
              View Students
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/faculty/schedules')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Class Schedule
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
