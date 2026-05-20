import {
  Award,
  BarChart2,
  Bell,
  Book,
  BookOpen,
  CalendarCheck,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LineChart,
  PenLine,
  Settings,
  Star,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Award,
  BarChart2,
  Bell,
  Book,
  BookOpen,
  CalendarCheck,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LineChart,
  PenLine,
  Settings,
  Star,
  TrendingUp,
  Users,
  Wallet,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? LayoutDashboard;
}
