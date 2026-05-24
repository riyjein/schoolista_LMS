import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, School } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { UserRole } from '../../../lib/types';
import { roleRootPath } from '../../../lib/data';

export function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network request for MVP
    setTimeout(() => {
      login(selectedRole);
      setIsLoading(false);
      navigate(roleRootPath[selectedRole]);
    }, 600);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:hidden flex items-center justify-center mb-8">
        <div className="p-2 bg-blue-950 rounded-lg border border-blue-800 flex items-center space-x-2 text-white">
          <School className="size-6 text-amber-400" />
          <span className="text-xl font-bold">SIMS<span className="text-amber-400">.</span></span>
        </div>
      </div>

      <div className="text-center md:text-left space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
        <p className="text-slate-500">Enter your credentials to access your portal</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 font-medium mb-2">Demo Access (Phase 2)</p>
        <Select value={selectedRole} onValueChange={(val: UserRole) => setSelectedRole(val)}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select a demo role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student Portal</SelectItem>
            <SelectItem value="faculty">Faculty Portal</SelectItem>
            <SelectItem value="program-chair">Program Chair Portal</SelectItem>
            <SelectItem value="stakeholder">Stakeholder Portal</SelectItem>
            <SelectItem value="admin">Admin Portal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">University Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                id="email" 
                type="email" 
                placeholder="name@university.edu" 
                className="pl-10"
                defaultValue={`demo.${selectedRole}@university.edu`}
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="pl-10 pr-10"
                defaultValue="password123"
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
          >
            Remember me for 30 days
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center space-x-2 h-11"
          disabled={isLoading}
        >
          <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-800">
          Request access
        </Link>
      </div>
    </div>
  );
}