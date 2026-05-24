import { useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import { Menu, X } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { AppNavbar } from './AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { roleRootPath } from '../../../lib/data';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

function RootRedirect() {
  const { currentRole } = useAuth();
  return <Navigate to={roleRootPath[currentRole]} replace />;
}

export { RootRedirect };

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0 z-20 shadow-xl">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 shadow-2xl',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Navbar */}
        <div className="flex items-center bg-card">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden ml-4 mt-0.5"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <div className="flex-1">
            <AppNavbar />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}