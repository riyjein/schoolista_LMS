import { Bell, Search, LogOut, User as UserIcon, Settings, Shield, GraduationCap, Users, UserCog, LineChart, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ALL_ROLES, type UserRole } from '../../../lib/types';
import { roleRootPath } from '../../../lib/data';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RoleSwitcher } from '../shared/RoleSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="size-4" />,
  student: <GraduationCap className="size-4" />,
  faculty: <Users className="size-4" />,
  'program-chair': <UserCog className="size-4" />,
  stakeholder: <LineChart className="size-4" />,
};

export function AppNavbar() {
  const { currentUser, currentRole, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    navigate(roleRootPath[role]);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border flex-shrink-0 shadow-sm z-10">
      {/* Search */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md hover:bg-muted transition-colors cursor-pointer w-full max-w-sm">
        <Search className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Search modules, students, or courses...</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Role Switcher (Demo Feature) */}
        <div className="hidden md:flex items-center gap-2 border-r border-border/50 pr-4">
          <Badge variant="outline" className="hidden lg:flex gap-1 text-[10px] uppercase text-muted-foreground bg-muted/30">
            <Shield className="size-3" /> Demo Mode
          </Badge>
          <div className="w-[180px]">
            <RoleSwitcher />
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="size-9 rounded-full text-foreground/70 hover:text-foreground">
            <Bell className="size-4.5" />
          </Button>
          <span className="absolute top-2 right-2 size-2 rounded-full bg-secondary shadow-sm ring-2 ring-card" />
        </div>

        {/* User Info & Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto hover:bg-transparent border-0 focus-visible:ring-0 px-2 pl-2 border-l border-border/50 flex items-center gap-3 rounded-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-tight">{currentUser.name}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                    {ROLE_LABELS[currentRole]}
                  </Badge>
                </div>
              </div>
              <div className="size-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <span className="text-xs font-bold text-primary-foreground tracking-wider">{currentUser.avatarInitials}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>System Preferences</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            
            {/* Mobile-only Role Switcher */}
            <div className="md:hidden">
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Switch Role
              </DropdownMenuLabel>
              {ALL_ROLES.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onSelect={() => handleRoleSwitch(role)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{roleIcons[role]}</span>
                    <span>{ROLE_LABELS[role]}</span>
                  </div>
                  {currentRole === role && <Check className="size-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="md:hidden" />

            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}