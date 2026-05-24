import { schoolPerformance } from '@/lib/data/stakeholders/school-performance';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../ui/utils';

export default function SchoolPerformancePage() {
  const {
    programPerformance,
    performanceTrend,
    attendanceTrend,
    topPerformingPrograms,
    atRiskPrograms,
    overallAverageGPA,
    overallPassRate,
    overallAttendanceRate,
    overallEvaluationAverage,
    totalDLStudents,
    academicImprovementRate,
  } = schoolPerformance;

  const getRiskBadgeColor = (risk: 'low-risk' | 'moderate-risk' | 'high-risk') => {
    switch (risk) {
      case 'low-risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'moderate-risk':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high-risk':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const formatRisk = (risk: 'low-risk' | 'moderate-risk' | 'high-risk') => {
    return risk
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">School Performance</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Academic performance metrics and program analytics
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall GPA</p>
                <p className="mt-1 text-2xl font-bold">
                  {overallAverageGPA !== null ? overallAverageGPA.toFixed(2) : 'N/A'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">School-wide</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Award className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                <p className="mt-1 text-2xl font-bold">{overallPassRate.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Overall</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                <p className="mt-1 text-2xl font-bold">{overallAttendanceRate.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Overall rate</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Users className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dean's Listers</p>
                <p className="mt-1 text-2xl font-bold">{totalDLStudents}</p>
                <p className="mt-1 text-xs text-muted-foreground">Qualified</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <Award className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Improvement</p>
                <p className="mt-1 text-2xl font-bold">
                  {academicImprovementRate >= 0 ? '+' : ''}
                  {academicImprovementRate.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">GPA change</p>
              </div>
              <div
                className={cn(
                  'rounded-full p-3',
                  academicImprovementRate >= 0 ? 'bg-green-100' : 'bg-red-100',
                )}
              >
                <TrendingUp
                  className={cn(
                    'h-5 w-5',
                    academicImprovementRate >= 0 ? 'text-green-700' : 'text-red-700',
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Programs and At-Risk Programs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Performing Programs */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base">Top Performing Programs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {topPerformingPrograms.map((program) => (
                <div key={program.courseId} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                        {program.rank}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{program.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {program.totalStudents} students
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs">
                      {program.performanceScore !== null
                        ? program.performanceScore.toFixed(0)
                        : 'N/A'}
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      GPA:{' '}
                      <span className="font-medium text-foreground">
                        {program.averageGPA !== null ? program.averageGPA.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      Pass:{' '}
                      <span className="font-medium text-foreground">
                        {program.passRate.toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      DL: <span className="font-medium text-foreground">{program.dlCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* At-Risk Programs */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <CardTitle className="text-base">At-Risk Programs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {atRiskPrograms.length > 0 ? (
              <div className="space-y-3">
                {atRiskPrograms.slice(0, 3).map((program) => (
                  <div key={program.courseId} className="rounded-lg border border-red-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{program.courseName}</p>
                      <Badge
                        className={cn('text-xs border', getRiskBadgeColor(program.riskLevel))}
                      >
                        {formatRisk(program.riskLevel)}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1">
                      {program.riskFactors.map((factor, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-xs text-red-600">
                          <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No at-risk programs identified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Program Performance Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Programs Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Students
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Avg GPA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Pass Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Evaluation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    DL Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {programPerformance.map((program) => (
                  <tr key={program.courseId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-semibold">
                        {program.rank}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{program.courseName}</td>
                    <td className="px-4 py-3 text-sm">{program.totalStudents}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-700">
                        {program.averageGPA !== null ? program.averageGPA.toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
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
                        {program.passRate.toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{program.attendanceRate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm">
                      {program.evaluationAverage !== null
                        ? program.evaluationAverage.toFixed(2)
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">{program.dlCount}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          program.performanceScore !== null && program.performanceScore >= 80
                            ? 'default'
                            : program.performanceScore !== null && program.performanceScore >= 60
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {program.performanceScore !== null
                          ? program.performanceScore.toFixed(0)
                          : 'N/A'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Performance Trends</CardTitle>
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
                    Avg GPA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Pass Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Fail Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Evaluation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    DL Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {performanceTrend.map((trend, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{trend.semester} Semester</p>
                        <p className="text-xs text-muted-foreground">{trend.schoolYear}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {trend.averageGPA !== null ? trend.averageGPA.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">{trend.passRate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm text-red-700">
                      {trend.failRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm">{trend.attendanceRate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm">
                      {trend.evaluationAverage !== null
                        ? trend.evaluationAverage.toFixed(2)
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">{trend.dlCount}</td>
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
