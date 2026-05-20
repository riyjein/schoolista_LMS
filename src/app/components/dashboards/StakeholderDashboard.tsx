import { Users, TrendingUp, DollarSign, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../shared/StatCard';
import { PageHeader } from '../shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const enrollmentData = [
  { semester: '1st 2024', enrolled: 2100 },
  { semester: '2nd 2024', enrolled: 2050 },
  { semester: '1st 2025', enrolled: 2280 },
  { semester: '2nd 2025', enrolled: 2340 },
  { semester: '1st 2026', enrolled: 2510 },
];

const mockPrograms = [
  { program: 'BS Computer Science', enrolled: 620, trend: '+12%' },
  { program: 'BS Information Technology', enrolled: 540, trend: '+8%' },
  { program: 'BS Computer Engineering', enrolled: 480, trend: '+5%' },
  { program: 'BS Electronics Engineering', enrolled: 420, trend: '+3%' },
  { program: 'BS Civil Engineering', enrolled: 450, trend: '+6%' },
];

export function StakeholderDashboard() {
  const { currentUser } = useAuth();

  return (
    <div>
      <PageHeader
        title="Executive Overview"
        description={`${currentUser.department} · AY 2025–2026`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Enrollment"
          value="2,510"
          Icon={Users}
          description="AY 2025–2026, 1st Sem"
          trend={{ value: 7.3, label: 'vs last year' }}
          accent="blue"
        />
        <StatCard
          title="Retention Rate"
          value="91.4%"
          Icon={TrendingUp}
          description="Year-over-year"
          trend={{ value: 1.2, label: 'improvement' }}
          accent="green"
        />
        <StatCard
          title="Revenue (YTD)"
          value="₱48.2M"
          Icon={DollarSign}
          description="Jan–May 2026"
          trend={{ value: 9.5, label: 'vs target' }}
          accent="purple"
        />
        <StatCard
          title="Academic Programs"
          value={18}
          Icon={BarChart2}
          description="Across 6 colleges"
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Enrollment Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={enrollmentData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="semester" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Enrolled" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Enrollment by Program</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border">
              {mockPrograms.map((p) => (
                <li key={p.program} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.program}</p>
                    <p className="text-xs text-muted-foreground">{p.enrolled} students</p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0 text-emerald-700 bg-emerald-50">
                    {p.trend}
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
