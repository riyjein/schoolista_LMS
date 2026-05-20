import { useNavigate } from 'react-router';
import { Shield, GraduationCap, Users, UserCog, LineChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roleRootPath } from '../../../lib/data';
import { ROLE_LABELS, ALL_ROLES, type UserRole } from '../../../lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="size-4 shrink-0" />,
  student: <GraduationCap className="size-4 shrink-0" />,
  faculty: <Users className="size-4 shrink-0" />,
  'program-chair': <UserCog className="size-4 shrink-0" />,
  stakeholder: <LineChart className="size-4 shrink-0" />,
};

export function RoleSwitcher() {
  const { currentRole, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleValueChange = (role: string) => {
    switchRole(role as UserRole);
    navigate(roleRootPath[role]);
  };

  return (
    <Select value={currentRole} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full bg-background border-border/60 h-9 text-sm">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span className="text-primary">{roleIcons[currentRole]}</span>
            <span className="font-medium">{ROLE_LABELS[currentRole]}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ALL_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            <span className="flex items-center gap-2">
              {roleIcons[role]}
              <span>{ROLE_LABELS[role]}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
