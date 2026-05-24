import type { UserRole } from './role';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export type RoleNavMap = Record<UserRole, NavItem[]>;
