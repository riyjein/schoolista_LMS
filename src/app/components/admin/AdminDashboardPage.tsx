import { userStatistics } from '@/lib/data/admin/users';
import { announcementStatistics } from '@/lib/data/admin/announcements';
import { studentProfiles } from '@/lib/data/enrollment/students';
import { courses } from '@/lib/data/enrollment/courses';
import { subjects } from '@/lib/data/enrollment/subjects';
import { sections } from '@/lib/data/schedule/sections';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Users,
  GraduationCap,
  BookOpen,
  Grid3x3,
  Megaphone,
  Settings,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          System administration and management overview
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="mt-1 text-2xl font-bold">{userStatistics.totalUsers}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {userStatistics.activeUsers} active
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
                <p className="text-sm font-medium text-muted-foreground">Programs</p>
                <p className="mt-1 text-2xl font-bold">{courses.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Active programs</p>
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
                <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                <p className="mt-1 text-2xl font-bold">{subjects.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">In catalog</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <BookOpen className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Announcements</p>
                <p className="mt-1 text-2xl font-bold">
                  {announcementStatistics.publishedAnnouncements}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {announcementStatistics.draftAnnouncements} drafts
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <Megaphone className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Statistics */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">User Statistics</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/users')}
              className="h-8 text-xs"
            >
              View All <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Students</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {userStatistics.totalStudents}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Faculty</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {userStatistics.totalFaculty}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Administrators</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {userStatistics.totalAdmins}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">New This Month</span>
                </div>
                <Badge variant="default" className="text-xs">
                  {userStatistics.newUsersThisMonth}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Resources */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Academic Resources</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Programs</p>
                    <p className="text-xs text-muted-foreground">Active degree programs</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {courses.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Subjects</p>
                    <p className="text-xs text-muted-foreground">Course catalog entries</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {subjects.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Grid3x3 className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Sections</p>
                    <p className="text-xs text-muted-foreground">Active class sections</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {sections.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 pt-0 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/admin/programs')}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Manage Programs
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/admin/subjects')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Subjects
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/admin/sections')}
            >
              <Grid3x3 className="mr-2 h-4 w-4" />
              Manage Sections
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/admin/announcements')}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Announcements
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
