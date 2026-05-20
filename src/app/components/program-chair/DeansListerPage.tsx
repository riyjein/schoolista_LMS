import { useState, useMemo } from 'react';
import {
  dlCandidates,
  dlSummaryByCourse,
  dlOverallStats,
  type DLStatus,
} from '@/lib/data/program-chair/deans-lister';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Award, Search, X, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';

export default function DeansListerPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DLStatus | 'all'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  // Get unique courses
  const courses = useMemo(() => {
    return [...new Set(dlCandidates.map((c) => ({ id: c.courseId, name: c.courseName })))];
  }, []);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    let result = [...dlCandidates];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.studentNumber.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.dlStatus === statusFilter);
    }

    if (courseFilter !== 'all') {
      result = result.filter((c) => c.courseId === courseFilter);
    }

    return result;
  }, [dlCandidates, search, statusFilter, courseFilter]);

  const hasFilters = search || statusFilter !== 'all' || courseFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCourseFilter('all');
  };

  const getDLBadgeColor = (status: DLStatus) => {
    switch (status) {
      case 'summa-cum-laude':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'magna-cum-laude':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'cum-laude':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDLStatus = (status: DLStatus) => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">Dean's Lister Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Academic honors qualification for 2024-2025 1st Semester
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Qualified</p>
                <p className="mt-1 text-2xl font-bold">{dlOverallStats.totalQualified}</p>
                <p className="mt-1 text-xs text-green-600">
                  {dlOverallStats.qualificationRate.toFixed(1)}% of students
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Award className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Summa Cum Laude</p>
                <p className="mt-1 text-2xl font-bold">{dlOverallStats.summaCumLaude}</p>
                <p className="mt-1 text-xs text-muted-foreground">GPA ≥ 90</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <Award className="h-5 w-5 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Magna Cum Laude</p>
                <p className="mt-1 text-2xl font-bold">{dlOverallStats.magnaCumLaude}</p>
                <p className="mt-1 text-xs text-muted-foreground">GPA ≥ 85</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Award className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cum Laude</p>
                <p className="mt-1 text-2xl font-bold">{dlOverallStats.cumLaude}</p>
                <p className="mt-1 text-xs text-muted-foreground">GPA ≥ 80</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Award className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Summary */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Summary by Program</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Students
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Qualified
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Summa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Magna
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Cum Laude
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dlSummaryByCourse.map((summary) => (
                  <tr key={summary.courseId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{summary.courseName}</td>
                    <td className="px-4 py-3">{summary.totalStudents}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-700">{summary.qualified}</span>
                    </td>
                    <td className="px-4 py-3">{summary.summaCumLaude}</td>
                    <td className="px-4 py-3">{summary.magnaCumLaude}</td>
                    <td className="px-4 py-3">{summary.cumLaude}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          summary.qualificationRate >= 20
                            ? 'default'
                            : summary.qualificationRate >= 10
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {summary.qualificationRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dean's List Candidates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or student number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DLStatus | 'all')}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="summa-cum-laude">Summa Cum Laude</SelectItem>
                <SelectItem value="magna-cum-laude">Magna Cum Laude</SelectItem>
                <SelectItem value="cum-laude">Cum Laude</SelectItem>
                <SelectItem value="not-qualified">Not Qualified</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Candidates Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    GPA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Units
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Users className="mx-auto mb-2 h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        {hasFilters ? 'No candidates match your filters.' : 'No candidates found.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.studentId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.studentNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{candidate.courseName}</td>
                      <td className="px-4 py-3 text-sm">Year {candidate.yearLevel}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'font-semibold',
                            candidate.gpa >= 90 && 'text-green-700',
                            candidate.gpa >= 85 && candidate.gpa < 90 && 'text-purple-700',
                            candidate.gpa >= 80 && candidate.gpa < 85 && 'text-blue-700',
                            candidate.gpa < 80 && 'text-gray-600',
                          )}
                        >
                          {candidate.gpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{candidate.unitLoad}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn('text-xs border', getDLBadgeColor(candidate.dlStatus))}>
                          {formatDLStatus(candidate.dlStatus)}
                        </Badge>
                        {!candidate.qualified && candidate.disqualifiers.length > 0 && (
                          <div className="mt-1 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            <p className="text-xs text-red-600">
                              {candidate.disqualifiers[0]}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredCandidates.length} of {dlCandidates.length} candidate
            {dlCandidates.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
