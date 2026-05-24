import { Users, GraduationCap, BarChart2, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../shared/StatCard';
import { PageHeader } from '../shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const mockSections = [
  { section: 'BSCS 1-A', students: 42, avgGrade: '2.10', passingRate: '97%' },
  { section: 'BSCS 2-A', students: 38, avgGrade: '1.95', passingRate: '94%' },
  { section: 'BSCS 3-A', students: 35, avgGrade: '1.85', passingRate: '91%' },
  { section: 'BSCS 4-A', students: 28, avgGrade: '1.70', passingRate: '100%' },
];

const mockDeansListers = [
  { name: 'Anna Mercado', section: 'BSCS 3-A', gwa: '1.10' },
  { name: 'Carlos Bautista', section: 'BSCS 2-A', gwa: '1.15' },
  { name: 'Lena Villamor', section: 'BSCS 4-A', gwa: '1.20' },
  { name: 'Rico Domingo', section: 'BSCS 1-A', gwa: '1.25' },
];

export function ProgramChairDashboard() {
  const { currentUser } = useAuth();

  return (
    <div>
      <PageHeader
        title="Program Chair Dashboard"
        description={`${currentUser.department} · ${currentUser.name}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Students"
          value={143}
          Icon={Users}
          description="Under your program"
          trend={{ value: 8, label: 'vs last semester' }}
          accent="blue"
        />
        <StatCard
          title="Active Sections"
          value={4}
          Icon={BarChart2}
          description="AY 2025–2026"
          accent="green"
        />
        <StatCard
          title="Program GWA"
          value="1.90"
          Icon={GraduationCap}
          description="Weighted average"
          trend={{ value: 0.05, label: 'improvement' }}
          accent="purple"
        />
        <StatCard
          title="Dean's Listers"
          value={12}
          Icon={Award}
          description="This semester"
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Section Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border">
              {mockSections.map((s) => (
                <li key={s.section} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.section}</p>
                    <p className="text-xs text-muted-foreground">{s.students} students · GWA: {s.avgGrade}</p>
                  </div>
                  <Badge
                    variant={parseFloat(s.passingRate) >= 95 ? 'default' : 'secondary'}
                    className="text-xs flex-shrink-0"
                  >
                    {s.passingRate} passing
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Dean's Listers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border">
              {mockDeansListers.map((student, i) => (
                <li key={student.name} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground w-4 flex-shrink-0">#{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.section}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary flex-shrink-0">{student.gwa}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
