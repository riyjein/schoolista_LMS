import { useNavigate } from 'react-router';
import { dashboardSummary } from '@/lib/data/program-chair/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Award,
  BarChart3,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { cn } from '../ui/utils';

export function ProgramChairDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">Program Chair Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Academic year 2024-2025 • 1st Semester
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="mt-1 text-2xl font-bold">{dashboardSummary.totalStudents}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dashboardSummary.totalEnrolledThisSemester} enrolled
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
                <p className="mt-1 text-2xl font-bold">{dashboardSummary.totalFaculty}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dashboardSummary.totalActiveClasses} active classes
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <GraduationCap className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                <p className="mt-1 text-2xl font-bold">
                  {dashboardSummary.overallPassRate.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-green-600">
                  System-wide
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                <p className="mt-1 text-2xl font-bold">
                  {dashboardSummary.overallAttendanceRate.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Overall rate
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <BarChart3 className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Program Metrics */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Program Performance</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/program-chair/academic-reports')}
              className="h-8 text-xs"
            >
              View All <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {dashboardSummary.programMetrics.slice(0, 3).map((program) => (
                <div
                  key={program.courseId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{program.courseName}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{program.enrolledStudents} students</span>
                      {program.averageGPA && (
                        <span>GPA: {program.averageGPA.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={
                        program.passRate >= 90
                          ? 'default'
                          : program.passRate >= 75
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="text-xs"
                    >
                      {program.passRate.toFixed(0)}% pass
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Metrics */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Department Overview</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/program-chair/faculty-overview')}
              className="h-8 text-xs"
            >
              Details <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {dashboardSummary.departmentMetrics.map((dept) => (
                <div
                  key={dept.department}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{dept.department}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{dept.totalFaculty} faculty</span>
                        <span>{dept.totalClasses} classes</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{dept.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">students</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {dashboardSummary.gradeDistribution.map((dist) => (
                <div key={dist.range} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium">{dist.range}</div>
                  <div className="flex-1">
                    <div className="relative h-6 overflow-hidden rounded-md bg-secondary">
                      <div
                        className={cn(
                          'h-full transition-all',
                          dist.range === '90-100' && 'bg-green-500',
                          dist.range === '80-89' && 'bg-blue-500',
                          dist.range === '75-79' && 'bg-amber-500',
                          dist.range === '70-74' && 'bg-orange-500',
                          dist.range === 'Below 70' && 'bg-red-500',
                        )}
                        style={{ width: `${dist.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-xs text-muted-foreground">
                    {dist.count} ({dist.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
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
              onClick={() => navigate('/program-chair/academic-reports')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Academic Reports
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/program-chair/class-performance')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Class Performance
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/program-chair/deans-lister')}
            >
              <Award className="mr-2 h-4 w-4" />
              Dean's Lister
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/program-chair/faculty-overview')}
            >
              <Users className="mr-2 h-4 w-4" />
              Faculty Overview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
