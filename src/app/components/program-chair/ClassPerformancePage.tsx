import { useState, useMemo } from 'react';
import {
  classReports,
  classComparison,
  type ClassReport,
} from '@/lib/data/program-chair/class-reports';
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
import { Search, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { cn } from '../ui/utils';

export default function ClassPerformancePage() {
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Get unique subjects for filter
  const subjects = useMemo(() => {
    return [...new Set(classReports.map((c) => ({ id: c.subjectId, code: c.subjectCode })))];
  }, []);

  // Filter class reports
  const filteredClasses = useMemo(() => {
    let result = [...classReports];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.subjectCode.toLowerCase().includes(query) ||
          c.subjectTitle.toLowerCase().includes(query) ||
          c.sectionCode.toLowerCase().includes(query) ||
          c.instructorName.toLowerCase().includes(query),
      );
    }

    if (difficultyFilter !== 'all') {
      result = result.filter((c) => c.difficultyIndicator === difficultyFilter);
    }

    return result;
  }, [search, difficultyFilter]);

  const getDifficultyBadgeColor = (difficulty: ClassReport['difficultyIndicator']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'hard':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'very-hard':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const formatDifficulty = (difficulty: ClassReport['difficultyIndicator']) => {
    switch (difficulty) {
      case 'easy':
        return 'Easy';
      case 'moderate':
        return 'Moderate';
      case 'hard':
        return 'Hard';
      case 'very-hard':
        return 'Very Hard';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">Class Performance Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Detailed performance metrics and rankings for all classes
        </p>
      </div>

      {/* Class Comparisons */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Easiest Classes */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base">Top Performing Classes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {classComparison.easiestClasses.map((cls, idx) => (
                <div key={cls.classId} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {cls.subjectCode} - {cls.sectionCode}
                    </p>
                    <p className="text-xs text-muted-foreground">{cls.instructorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-700">
                      {cls.averageGrade?.toFixed(1) || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hardest Classes */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <CardTitle className="text-base">Most Challenging Classes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {classComparison.hardestClasses.map((cls, idx) => (
                <div key={cls.classId} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {cls.subjectCode} - {cls.sectionCode}
                    </p>
                    <p className="text-xs text-muted-foreground">{cls.instructorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-700">
                      {cls.averageGrade?.toFixed(1) || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Highest Attendance */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">Best Attendance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {classComparison.highestAttendance.map((cls, idx) => (
                <div key={cls.classId} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {cls.subjectCode} - {cls.sectionCode}
                    </p>
                    <p className="text-xs text-muted-foreground">{cls.instructorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-700">
                      {cls.attendanceRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">attendance</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lowest Attendance */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-base">Lowest Attendance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {classComparison.lowestAttendance.map((cls, idx) => (
                <div key={cls.classId} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {cls.subjectCode} - {cls.sectionCode}
                    </p>
                    <p className="text-xs text-muted-foreground">{cls.instructorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-700">
                      {cls.attendanceRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">attendance</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Classes Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by subject, section, or instructor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="very-hard">Very Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Classes Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Class
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Instructor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Students
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Avg Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Pass Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Difficulty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClasses.map((cls) => (
                  <tr key={cls.classId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-semibold">
                        {cls.performanceRank || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">
                          {cls.subjectCode} - {cls.sectionCode}
                        </p>
                        <p className="text-xs text-muted-foreground">{cls.subjectTitle}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{cls.instructorName}</td>
                    <td className="px-4 py-3 text-sm">
                      {cls.enrolledStudents}/{cls.maxStudents}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'font-semibold',
                          cls.averageGrade && cls.averageGrade >= 85 && 'text-green-700',
                          cls.averageGrade && cls.averageGrade >= 75 && cls.averageGrade < 85 && 'text-blue-700',
                          cls.averageGrade && cls.averageGrade < 75 && 'text-red-700',
                        )}
                      >
                        {cls.averageGrade !== null ? cls.averageGrade.toFixed(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          cls.passRate >= 90
                            ? 'default'
                            : cls.passRate >= 75
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="text-xs"
                      >
                        {cls.passRate.toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{cls.attendanceRate.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn('text-xs border', getDifficultyBadgeColor(cls.difficultyIndicator))}
                      >
                        {formatDifficulty(cls.difficultyIndicator)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredClasses.length} of {classReports.length} classes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
