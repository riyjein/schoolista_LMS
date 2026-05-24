import { NavLink } from 'react-router';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roleNavigation } from '../../../lib/data';
import { ROLE_LABELS } from '../../../lib/types';
import { getIcon } from '../../../lib/utils';
import { cn } from '../ui/utils';

export function AppSidebar() {
  const { currentUser, currentRole } = useAuth();
  const navItems = roleNavigation[currentRole];

  return (
    <aside className="flex flex-col h-full w-60 bg-primary text-primary-foreground shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-foreground/10">
        <div className="size-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
          <GraduationCap className="size-5 text-secondary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-primary-foreground leading-tight tracking-tight">SIMS</p>
          <p className="text-[11px] text-primary-foreground/70 leading-tight truncate">School Mgmt System</p>
        </div>
      </div>

      {/* Current Role Badge */}
      <div className="px-5 pt-5 pb-3">
        <div className="rounded-lg bg-white/10 px-3.5 py-2.5 shadow-sm border border-primary-foreground/5">
          <p className="text-[10px] font-medium text-primary-foreground/60 uppercase tracking-wider mb-1">Signed in as</p>
          <p className="text-sm font-medium text-primary-foreground truncate">{currentUser.name}</p>
          <p className="text-xs text-secondary font-medium mt-0.5">{ROLE_LABELS[currentRole]}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-3">
        <p className="px-2 mb-2 text-[10px] font-medium text-primary-foreground/50 uppercase tracking-wider">Navigation</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path.split('/').length <= 2}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white/10 text-secondary shadow-sm'
                        : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5'
                    )
                  }
                >
                  <Icon className="size-4.5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}
