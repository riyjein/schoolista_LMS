import { useState, useMemo } from 'react';
import {
  academicReports,
  type CourseReport,
  type AcademicStanding,
} from '@/lib/data/program-chair/academic-reports';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { BarChart3, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';

export default function AcademicReportsPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>(
    academicReports[0]?.courseId || '',
  );

  const selectedReport = useMemo(() => {
    return academicReports.find((r) => r.courseId === selectedCourse);
  }, [selectedCourse]);

  const getStandingBadgeColor = (standing: AcademicStanding) => {
    switch (standing) {
      case 'good-standing':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'probation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const formatStanding = (standing: AcademicStanding) => {
    switch (standing) {
      case 'good-standing':
        return 'Good Standing';
      case 'probation':
        return 'Probation';
      case 'failed':
        return 'Failed';
    }
  };

  if (!selectedReport) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">No academic reports available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold tracking-tight">Academic Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Comprehensive academic analytics by program
          </p>
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Select program" />
          </SelectTrigger>
          <SelectContent>
            {academicReports.map((report) => (
              <SelectItem key={report.courseId} value={report.courseId}>
                {report.courseName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="mt-1 text-2xl font-bold">{selectedReport.totalStudents}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedReport.courseName}
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
                <p className="text-sm font-medium text-muted-foreground">Average GPA</p>
                <p className="mt-1 text-2xl font-bold">
                  {selectedReport.averageGPA !== null
                    ? selectedReport.averageGPA.toFixed(2)
                    : 'N/A'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Program-wide</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subjects Offered</p>
                <p className="mt-1 text-2xl font-bold">{selectedReport.gradesBySubject.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Active subjects</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <BarChart3 className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="mt-1 text-2xl font-bold">
                  {selectedReport.academicStandingBreakdown.find((s) => s.standing === 'failed')
                    ?.count || 0}
                </p>
                <p className="mt-1 text-xs text-red-600">Failed standing</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GPA Distribution */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">GPA Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {selectedReport.gpaDistribution.map((dist) => (
              <div key={dist.range} className="flex items-center gap-3">
                <div className="w-32 text-xs font-medium">{dist.range}</div>
                <div className="flex-1">
                  <div className="relative h-6 overflow-hidden rounded-md bg-secondary">
                    <div
                      className={cn(
                        'h-full transition-all',
                        dist.range.startsWith('90-') && 'bg-green-500',
                        dist.range.startsWith('85-') && 'bg-blue-500',
                        dist.range.startsWith('80-') && 'bg-purple-500',
                        dist.range.startsWith('75-') && 'bg-amber-500',
                        dist.range.startsWith('Below') && 'bg-red-500',
                      )}
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right text-xs text-muted-foreground">
                  {dist.count} ({dist.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unit Load Distribution */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Unit Load Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {selectedReport.unitLoadDistribution.map((dist) => (
              <div key={dist.range} className="flex items-center gap-3">
                <div className="w-40 text-xs font-medium">{dist.range}</div>
                <div className="flex-1">
                  <div className="relative h-6 overflow-hidden rounded-md bg-secondary">
                    <div
                      className={cn(
                        'h-full transition-all',
                        dist.range.includes('Overload') && 'bg-orange-500',
                        dist.range.startsWith('18-20') && 'bg-green-500',
                        dist.range.startsWith('15-17') && 'bg-blue-500',
                        dist.range.includes('Underload') && 'bg-amber-500',
                      )}
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right text-xs text-muted-foreground">
                  {dist.count} ({dist.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Standing Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Academic Standing</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {selectedReport.academicStandingBreakdown.map((standing) => (
              <div key={standing.standing} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <Badge className={cn('text-xs border', getStandingBadgeColor(standing.standing))}>
                    {formatStanding(standing.standing)}
                  </Badge>
                  <p className="text-2xl font-bold">{standing.count}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {standing.percentage.toFixed(1)}% of students
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pass/Fail Rates by Subject */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pass/Fail Rates by Subject</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Students
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Passed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Failed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Incomplete
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Pass Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedReport.passFailRates.map((rate) => (
                  <tr key={rate.subjectId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{rate.subjectCode}</p>
                        <p className="text-xs text-muted-foreground">{rate.subjectTitle}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{rate.totalStudents}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-700">{rate.passed}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-red-700">{rate.failed}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{rate.incomplete}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          rate.passRate >= 90
                            ? 'default'
                            : rate.passRate >= 75
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="text-xs"
                      >
                        {rate.passRate.toFixed(1)}%
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
