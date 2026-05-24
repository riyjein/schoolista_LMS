import { stakeholderAnalytics } from '@/lib/data/stakeholders/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Award,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../ui/utils';

export default function StakeholderDashboard() {
  const { executiveKPIs, dashboardMetrics, trendIndicators, institutionalHealth } =
    stakeholderAnalytics;

  const getKPIIcon = (label: string) => {
    if (label.includes('Students')) return Users;
    if (label.includes('Revenue') || label.includes('Collection')) return DollarSign;
    if (label.includes('Dean') || label.includes('GPA')) return Award;
    if (label.includes('Faculty')) return Users;
    return BarChart3;
  };

  const getKPIColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-700 bg-green-100';
      case 'good':
        return 'text-blue-700 bg-blue-100';
      case 'warning':
        return 'text-amber-700 bg-amber-100';
      case 'critical':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getTrendIcon = (direction: string) => {
    if (direction === 'up') return TrendingUp;
    if (direction === 'down') return TrendingDown;
    return BarChart3;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Comprehensive institutional metrics and performance indicators
        </p>
      </div>

      {/* Institutional Health Score */}
      <Card className="shadow-sm border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Institutional Health</p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="text-4xl font-bold">{institutionalHealth.score.toFixed(1)}</p>
                <Badge
                  variant={
                    institutionalHealth.grade === 'A'
                      ? 'default'
                      : institutionalHealth.grade === 'B'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="text-lg"
                >
                  Grade {institutionalHealth.grade}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Out of 100</p>
            </div>
            <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-4">
              {institutionalHealth.grade === 'A' || institutionalHealth.grade === 'B' ? (
                <CheckCircle className="h-8 w-8 text-green-700" />
              ) : (
                <AlertCircle className="h-8 w-8 text-amber-700" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {executiveKPIs.map((kpi) => {
          const Icon = getKPIIcon(kpi.label);
          const colorClass = kpi.status ? getKPIColor(kpi.status) : 'text-blue-700 bg-blue-100';

          return (
            <Card key={kpi.label} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold">
                      {kpi.value}
                      {kpi.unit}
                    </p>
                    {kpi.trend && (
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        {kpi.trend.direction === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : kpi.trend.direction === 'down' ? (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        ) : null}
                        <span
                          className={cn(
                            kpi.trend.direction === 'up' && 'text-green-600',
                            kpi.trend.direction === 'down' && 'text-red-600',
                            kpi.trend.direction === 'stable' && 'text-muted-foreground',
                          )}
                        >
                          {kpi.trend.percentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={cn('rounded-full p-3', colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dashboard Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Enrollment Metrics */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Enrollment Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="mt-1 text-xl font-bold">
                    {dashboardMetrics.enrollment.totalStudents}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {dashboardMetrics.enrollment.enrollmentGrowth >= 0 ? '+' : ''}
                  {dashboardMetrics.enrollment.enrollmentGrowth.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Enrollment</p>
                  <p className="mt-1 text-xl font-bold">
                    {dashboardMetrics.enrollment.currentEnrollment}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                  <p className="mt-1 text-xl font-bold">
                    {dashboardMetrics.enrollment.retentionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Metrics */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="mt-1 text-xl font-bold">
                    ₱{dashboardMetrics.financial.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                  <p className="mt-1 text-xl font-bold">
                    {dashboardMetrics.financial.collectionRate.toFixed(1)}%
                  </p>
                </div>
                <Badge
                  variant={
                    dashboardMetrics.financial.collectionRate >= 90
                      ? 'default'
                      : dashboardMetrics.financial.collectionRate >= 80
                        ? 'secondary'
                        : 'destructive'
                  }
                  className="text-xs"
                >
                  {dashboardMetrics.financial.collectionRate >= 90
                    ? 'Excellent'
                    : dashboardMetrics.financial.collectionRate >= 80
                      ? 'Good'
                      : 'Needs Attention'}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                  <p className="mt-1 text-xl font-bold text-red-700">
                    ₱{dashboardMetrics.financial.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Metrics */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Academic Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average GPA</p>
                  <p className="mt-1 text-xl font-bold">
                    {dashboardMetrics.academic.averageGPA !== null
                      ? dashboardMetrics.academic.averageGPA.toFixed(2)
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                  <p className="mt-1 text-xl font-bold">
                    {dashboardMetrics.academic.passRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dean's Listers</p>
                  <p className="mt-1 text-xl font-bold">{dashboardMetrics.academic.dlStudents}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Metrics */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Faculty Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
                  <p className="mt-1 text-xl font-bold">{dashboardMetrics.faculty.totalFaculty}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Classes</p>
                  <p className="mt-1 text-xl font-bold">
                    {dashboardMetrics.faculty.activeClasses}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Student-Faculty Ratio
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {dashboardMetrics.faculty.studentFacultyRatio.toFixed(1)}:1
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Indicators */}
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
                    Metric
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Current
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Previous
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Change
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {trendIndicators.map((trend) => {
                  const TrendIcon = getTrendIcon(trend.direction);
                  return (
                    <tr key={trend.metric} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{trend.metric}</td>
                      <td className="px-4 py-3 font-semibold">
                        {trend.metric.includes('Revenue')
                          ? `₱${trend.current.toLocaleString()}`
                          : trend.current.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {trend.metric.includes('Revenue')
                          ? `₱${trend.previous.toLocaleString()}`
                          : trend.previous.toFixed(1)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <TrendIcon
                            className={cn(
                              'h-4 w-4',
                              trend.interpretation === 'positive' && 'text-green-600',
                              trend.interpretation === 'negative' && 'text-red-600',
                              trend.interpretation === 'neutral' && 'text-muted-foreground',
                            )}
                          />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              trend.interpretation === 'positive' && 'text-green-700',
                              trend.interpretation === 'negative' && 'text-red-700',
                              trend.interpretation === 'neutral' && 'text-muted-foreground',
                            )}
                          >
                            {trend.change >= 0 ? '+' : ''}
                            {trend.changePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            trend.interpretation === 'positive'
                              ? 'default'
                              : trend.interpretation === 'negative'
                                ? 'destructive'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {trend.interpretation === 'positive'
                            ? 'Improving'
                            : trend.interpretation === 'negative'
                              ? 'Declining'
                              : 'Stable'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base">Institutional Strengths</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {institutionalHealth.strengths.length > 0 ? (
              <ul className="space-y-2">
                {institutionalHealth.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No significant strengths identified</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base">Areas for Improvement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {institutionalHealth.weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {institutionalHealth.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No significant weaknesses identified</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
