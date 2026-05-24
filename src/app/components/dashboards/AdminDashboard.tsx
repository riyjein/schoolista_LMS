import { Users, BookOpen, Layers, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../shared/StatCard';
import { PageHeader } from '../shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const mockRecentUsers = [
  { name: 'Rhea Castillo', role: 'Student', action: 'Enrolled', time: '2 min ago' },
  { name: 'Prof. Marcos', role: 'Faculty', action: 'Account Created', time: '15 min ago' },
  { name: 'IT Dept', role: 'Admin', action: 'Settings Updated', time: '1 hr ago' },
  { name: 'Maria Santos', role: 'Student', action: 'Password Reset', time: '2 hr ago' },
  { name: 'Dr. Reyes', role: 'Program Chair', action: 'Report Generated', time: '3 hr ago' },
];

const mockAnnouncements = [
  { title: 'Enrollment Opens May 25', target: 'All', priority: 'High' },
  { title: 'Faculty Meeting — May 21', target: 'Faculty', priority: 'Medium' },
  { title: 'System Maintenance May 23', target: 'All', priority: 'High' },
  { title: 'Scholarship Deadline June 1', target: 'Students', priority: 'Medium' },
];

const roleVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  Student: 'secondary',
  Faculty: 'outline',
  Admin: 'default',
  'Program Chair': 'outline',
};

export function AdminDashboard() {
  const { currentUser } = useAuth();

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description={`System Administrator · ${currentUser.department}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value="2,748"
          Icon={Users}
          description="Students, Faculty & Staff"
          trend={{ value: 4.2, label: 'this semester' }}
          accent="blue"
        />
        <StatCard
          title="Programs Offered"
          value={18}
          Icon={BookOpen}
          description="Across 6 colleges"
          accent="green"
        />
        <StatCard
          title="Active Sections"
          value={124}
          Icon={Layers}
          description="Current semester"
          accent="purple"
        />
        <StatCard
          title="Announcements"
          value={4}
          Icon={Bell}
          description="Active this week"
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border">
              {mockRecentUsers.map((item, i) => (
                <li key={i} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {item.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={roleVariant[item.role] ?? 'secondary'} className="text-[10px]">
                      {item.role}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active Announcements</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border">
              {mockAnnouncements.map((ann) => (
                <li key={ann.title} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ann.title}</p>
                    <p className="text-xs text-muted-foreground">Target: {ann.target}</p>
                  </div>
                  <Badge
                    variant={ann.priority === 'High' ? 'destructive' : 'secondary'}
                    className="text-xs flex-shrink-0"
                  >
                    {ann.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
