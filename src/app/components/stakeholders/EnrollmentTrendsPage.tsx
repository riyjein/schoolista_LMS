import { enrollmentTrends } from '@/lib/data/stakeholders/enrollment-trends';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Users, BookOpen, GraduationCap } from 'lucide-react';
import { cn } from '../ui/utils';

export default function EnrollmentTrendsPage() {
  const {
    periods,
    currentPeriod,
    coursePopularity,
    yearLevelDistribution,
    subjectDemand,
    overallGrowthRate,
    totalDropouts,
    averageRetentionRate,
  } = enrollmentTrends;

  const getPopularityBadgeColor = (
    popularity: 'high' | 'medium' | 'low',
  ): string => {
    switch (popularity) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">Enrollment Trends</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Student enrollment patterns and growth analytics
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Enrollment</p>
                <p className="mt-1 text-2xl font-bold">{currentPeriod.totalEnrolled}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentPeriod.semester} Sem {currentPeriod.schoolYear}
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
                <p className="text-sm font-medium text-muted-foreground">Overall Growth</p>
                <p className="mt-1 text-2xl font-bold">
                  {overallGrowthRate >= 0 ? '+' : ''}
                  {overallGrowthRate.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Since baseline</p>
              </div>
              <div
                className={cn(
                  'rounded-full p-3',
                  overallGrowthRate >= 0 ? 'bg-green-100' : 'bg-red-100',
                )}
              >
                {overallGrowthRate >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-700" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-700" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                <p className="mt-1 text-2xl font-bold">
                  {averageRetentionRate.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Average across periods</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Dropouts</p>
                <p className="mt-1 text-2xl font-bold">{totalDropouts}</p>
                <p className="mt-1 text-xs text-muted-foreground">All periods</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <Users className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment by Period */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enrollment by Period</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Enrolled
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    New
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Re-Enrollments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Growth Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Retention
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Dropouts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {periods.map((period, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">
                          {period.semester} Semester
                        </p>
                        <p className="text-xs text-muted-foreground">{period.schoolYear}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{period.totalEnrolled}</td>
                    <td className="px-4 py-3 text-sm">{period.newEnrollments}</td>
                    <td className="px-4 py-3 text-sm">{period.reEnrollments}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {period.growthRate >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span
                          className={cn(
                            'text-sm font-medium',
                            period.growthRate >= 0 ? 'text-green-700' : 'text-red-700',
                          )}
                        >
                          {period.growthRate >= 0 ? '+' : ''}
                          {period.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          period.retentionRate >= 90
                            ? 'default'
                            : period.retentionRate >= 80
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="text-xs"
                      >
                        {period.retentionRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-red-700 font-medium">
                        {period.dropoutCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Course Popularity and Year Level Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Course Popularity */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Program Popularity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {coursePopularity.map((course) => (
                <div
                  key={course.courseId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {course.rank}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{course.courseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.totalEnrolled} students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {course.growthRate >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        course.growthRate >= 0 ? 'text-green-700' : 'text-red-700',
                      )}
                    >
                      {course.growthRate >= 0 ? '+' : ''}
                      {course.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Year Level Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Year Level Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {yearLevelDistribution.map((dist) => (
                <div key={dist.yearLevel}>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-medium">Year {dist.yearLevel}</p>
                    <p className="text-sm text-muted-foreground">
                      {dist.count} ({dist.percentage.toFixed(1)}%)
                    </p>
                  </div>
                  <div className="relative h-6 overflow-hidden rounded-md bg-secondary">
                    <div
                      className={cn(
                        'h-full transition-all',
                        dist.yearLevel === 1 && 'bg-blue-500',
                        dist.yearLevel === 2 && 'bg-green-500',
                        dist.yearLevel === 3 && 'bg-purple-500',
                        dist.yearLevel === 4 && 'bg-amber-500',
                      )}
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Demand */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Subject Demand</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subject Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subject Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Enrollment Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Popularity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subjectDemand.slice(0, 10).map((subject) => (
                  <tr key={subject.subjectId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm">{subject.subjectCode}</td>
                    <td className="px-4 py-3 text-sm">{subject.subjectTitle}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{subject.enrollmentCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn('text-xs border', getPopularityBadgeColor(subject.popularity))}
                      >
                        {subject.popularity.charAt(0).toUpperCase() + subject.popularity.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
