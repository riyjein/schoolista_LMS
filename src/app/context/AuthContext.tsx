import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from '../../lib/types';
import { mockUsers, getMockUserByRole } from '../../lib/data';

interface AuthContextValue {
  currentUser: User;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  allUsers: User[];
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  // Default to authenticated for local development/demo so dashboards render
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const switchRole = (role: UserRole) => {
    setCurrentUser(getMockUserByRole(role));
  };

  const login = (role: UserRole) => {
    setCurrentUser(getMockUserByRole(role));
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        switchRole,
        allUsers: mockUsers,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
