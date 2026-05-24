import { useState, useMemo } from 'react';
import {
  facultyPerformances,
  departmentSummaries,
  facultyOverallStats,
  type LoadStatus,
} from '@/lib/data/program-chair/faculty-overview';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Search, Users, Award, TrendingUp, BookOpen } from 'lucide-react';
import { cn } from '../ui/utils';

export default function FacultyOverviewPage() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [loadFilter, setLoadFilter] = useState<string>('all');

  // Get unique departments
  const departments = useMemo(() => {
    return [...new Set(facultyPerformances.map((f) => f.department))];
  }, []);

  // Filter faculty
  const filteredFaculty = useMemo(() => {
    let result = [...facultyPerformances];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.employeeId.toLowerCase().includes(query) ||
          f.department.toLowerCase().includes(query),
      );
    }

    if (departmentFilter !== 'all') {
      result = result.filter((f) => f.department === departmentFilter);
    }

    if (loadFilter !== 'all') {
      result = result.filter((f) => f.loadStatus === loadFilter);
    }

    return result;
  }, [search, departmentFilter, loadFilter]);

  const getLoadBadgeColor = (status: LoadStatus) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'overloaded':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'underloaded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const formatLoadStatus = (status: LoadStatus) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'overloaded':
        return 'Overloaded';
      case 'underloaded':
        return 'Underloaded';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">Faculty Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Performance metrics and workload analysis for all faculty members
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
                <p className="mt-1 text-2xl font-bold">{facultyOverallStats.totalFaculty}</p>
                <p className="mt-1 text-xs text-muted-foreground">Active instructors</p>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Load</p>
                <p className="mt-1 text-2xl font-bold">
                  {facultyOverallStats.averageLoad.toFixed(1)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Classes per faculty</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <BookOpen className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                <p className="mt-1 text-2xl font-bold">
                  {facultyOverallStats.averagePerformance !== null
                    ? facultyOverallStats.averagePerformance.toFixed(1)
                    : 'N/A'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Out of 100</p>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Evaluation</p>
                <p className="mt-1 text-2xl font-bold">
                  {facultyOverallStats.averageEvaluationRating !== null
                    ? facultyOverallStats.averageEvaluationRating.toFixed(2)
                    : 'N/A'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Out of 5.0</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <TrendingUp className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Summaries */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Department Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Faculty Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Avg Load
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Avg Performance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Overloaded
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Top Performer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {departmentSummaries.map((dept) => (
                  <tr key={dept.department} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{dept.department}</td>
                    <td className="px-4 py-3">{dept.totalFaculty}</td>
                    <td className="px-4 py-3">{dept.averageLoad.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-green-700">
                        {dept.averagePerformance !== null
                          ? dept.averagePerformance.toFixed(1)
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {dept.overloadedCount > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {dept.overloadedCount}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{dept.topPerformer || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Faculty List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Faculty Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={loadFilter} onValueChange={setLoadFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Filter by load" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Load Status</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="overloaded">Overloaded</SelectItem>
                <SelectItem value="underloaded">Underloaded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Faculty Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Faculty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Classes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Students
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Avg GPA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Evaluation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Performance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Load Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFaculty.map((faculty) => (
                  <tr key={faculty.instructorId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{faculty.name}</p>
                        <p className="text-xs text-muted-foreground">{faculty.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{faculty.department}</td>
                    <td className="px-4 py-3 text-sm">{faculty.totalClasses}</td>
                    <td className="px-4 py-3 text-sm">{faculty.totalStudents}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-700">
                        {faculty.averageClassGPA !== null
                          ? faculty.averageClassGPA.toFixed(1)
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-purple-700">
                        {faculty.averageEvaluationRating !== null
                          ? faculty.averageEvaluationRating.toFixed(2)
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          faculty.performanceScore !== null && faculty.performanceScore >= 80
                            ? 'default'
                            : faculty.performanceScore !== null && faculty.performanceScore >= 60
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {faculty.performanceScore !== null
                          ? faculty.performanceScore.toFixed(0)
                          : 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn('text-xs border', getLoadBadgeColor(faculty.loadStatus))}
                      >
                        {formatLoadStatus(faculty.loadStatus)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredFaculty.length} of {facultyPerformances.length} faculty members
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
