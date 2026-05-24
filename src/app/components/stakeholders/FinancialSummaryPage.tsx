import { financialTrends } from '@/lib/data/stakeholders/financial-trends';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';

export default function FinancialSummaryPage() {
  const {
    periods,
    currentPeriod,
    revenueByCountse,
    paymentMethodDistribution,
    overdueBreakdown,
    totalRevenue,
    totalOutstanding,
    collectionEfficiency,
  } = financialTrends;

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getPaymentMethodIcon = (method: string) => {
    return CreditCard;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">Financial Summary</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Revenue trends and payment analytics
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="mt-1 text-xs text-muted-foreground">All periods</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <DollarSign className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Billed</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(currentPeriod.totalBilled)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">This semester</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <DollarSign className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                <p className="mt-1 text-2xl font-bold">{collectionEfficiency.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Overall efficiency</p>
              </div>
              <div
                className={cn(
                  'rounded-full p-3',
                  collectionEfficiency >= 85 ? 'bg-green-100' : 'bg-amber-100',
                )}
              >
                {collectionEfficiency >= 85 ? (
                  <TrendingUp className="h-5 w-5 text-green-700" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-700" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="mt-1 text-2xl font-bold text-red-700">
                  {formatCurrency(totalOutstanding)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Unpaid balance</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial by Period */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Revenue by Period</CardTitle>
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
                    Total Billed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Collected
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Outstanding
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Completion Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Payment Distribution
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {periods.map((period, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{period.semester} Semester</p>
                        <p className="text-xs text-muted-foreground">{period.schoolYear}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(period.totalBilled)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      {formatCurrency(period.totalCollected)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-700">
                      {formatCurrency(period.outstandingBalance)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          period.paymentCompletionRate >= 90
                            ? 'default'
                            : period.paymentCompletionRate >= 80
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="text-xs"
                      >
                        {period.paymentCompletionRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs">
                          Full: <span className="font-medium">{period.fullPaymentCount}</span>
                        </p>
                        <p className="text-xs">
                          Partial: <span className="font-medium">{period.partialPaymentCount}</span>
                        </p>
                        <p className="text-xs text-red-600">
                          Unpaid: <span className="font-medium">{period.unpaidCount}</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Program and Payment Methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Program */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Revenue by Program</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {revenueByCountse.map((revenue) => (
                <div
                  key={revenue.courseId}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{revenue.courseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {revenue.studentCount} students
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-700">
                        {formatCurrency(revenue.totalCollected)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(revenue.averageRevenuePerStudent)}/student
                      </p>
                    </div>
                  </div>
                  {revenue.outstandingBalance > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Outstanding: {formatCurrency(revenue.outstandingBalance)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {paymentMethodDistribution.map((method) => {
                const Icon = getPaymentMethodIcon(method.method);
                return (
                  <div key={method.method}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium capitalize">
                          {method.method.replace('-', ' ')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {method.count} ({method.percentage.toFixed(1)}%)
                      </p>
                    </div>
                    <div className="mb-1 text-xs text-muted-foreground">
                      Total: {formatCurrency(method.totalAmount)}
                    </div>
                    <div className="relative h-6 overflow-hidden rounded-md bg-secondary">
                      <div
                        className={cn(
                          'h-full transition-all',
                          method.method === 'cash' && 'bg-green-500',
                          method.method === 'bank-transfer' && 'bg-blue-500',
                          method.method === 'credit-card' && 'bg-purple-500',
                          method.method === 'online' && 'bg-amber-500',
                        )}
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <CardTitle className="text-base">Overdue Balance Breakdown</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overdueBreakdown.map((breakdown) => (
              <div key={breakdown.range} className="rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">{breakdown.range}</p>
                <p className="mt-2 text-2xl font-bold text-red-700">{breakdown.count}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total: {formatCurrency(breakdown.totalAmount)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
