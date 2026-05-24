import { Outlet } from 'react-router';
import { School } from 'lucide-react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { roleRootPath } from '../../../lib/data';

export function AuthLayout() {
  const { isAuthenticated, currentRole } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={roleRootPath[currentRole]} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left side: Branding / Presentation */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-blue-950 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400 blur-3xl mix-blend-overlay"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400 blur-3xl mix-blend-overlay"></div>
        </div>

        <div className="z-10 flex items-center space-x-3 text-amber-400">
          <div className="p-2 bg-blue-900 rounded-lg border border-blue-800">
            <School className="size-8" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">SIMS<span className="text-amber-400">.</span></span>
        </div>

        <div className="z-10 max-w-lg mt-12 mb-auto">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            School Integrated <br />
            <span className="text-amber-400">Management System</span>
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            A comprehensive, modular platform designed for modern educational institutions to manage students, faculty, and academic operations seamlessly.
          </p>
          
          <div className="flex items-center space-x-4 text-sm font-medium text-blue-300">
            <div className="flex items-center space-x-2">
              <div className="size-2 rounded-full bg-amber-400"></div>
              <span>Centralized Hub</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="size-2 rounded-full bg-amber-400"></div>
              <span>Role-Based Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="size-2 rounded-full bg-amber-400"></div>
              <span>Data-Driven</span>
            </div>
          </div>
        </div>

        <div className="z-10 flex items-center justify-between text-blue-400 text-sm">
          <p>&copy; 2026 SIMS University. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Right side: Auth forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white relative">
        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}