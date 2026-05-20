import { useState, useMemo } from 'react';
import { subjects } from '@/lib/data/enrollment/subjects';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Search, BookOpen, Plus, Filter } from 'lucide-react';
import { cn } from '../ui/utils';

export default function SubjectsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const departments = useMemo(() => {
    return [...new Set(subjects.map((s) => s.department))];
  }, []);

  const filteredSubjects = useMemo(() => {
    let result = [...subjects];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.code.toLowerCase().includes(query) ||
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query),
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((s) => s.type === typeFilter);
    }

    if (departmentFilter !== 'all') {
      result = result.filter((s) => s.department === departmentFilter);
    }

    return result;
  }, [search, typeFilter, departmentFilter]);

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'minor':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'GE':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold tracking-tight">Subject Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage course catalog and subject offerings
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
              <p className="mt-1 text-2xl font-bold">{subjects.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Major</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">
                {subjects.filter((s) => s.type === 'major').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">General Ed</p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {subjects.filter((s) => s.type === 'GE').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Minor</p>
              <p className="mt-1 text-2xl font-bold text-purple-700">
                {subjects.filter((s) => s.type === 'minor').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="GE">General Education</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full lg:w-[250px]">
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
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Units
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-mono">
                        {subject.code}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{subject.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {subject.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn('text-xs border', getTypeBadgeColor(subject.type))}>
                        {subject.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {subject.units} ({subject.lecUnits}L + {subject.labUnits}Lab)
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {subject.department}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
