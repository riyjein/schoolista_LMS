import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Mail, Lock, Eye, EyeOff, Building, School } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network request for MVP
    setTimeout(() => {
      setIsLoading(false);
      navigate('/auth/login');
    }, 800);
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h2>
        <p className="text-slate-500">Register for your university portal access</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input id="fullName" placeholder="John Doe" className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">University Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input id="email" type="email" placeholder="name@university.edu" className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Requested Role</Label>
          <Select defaultValue="student">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department / Program</Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Select>
              <SelectTrigger className="w-full pl-10">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="eng">Engineering</SelectItem>
                <SelectItem value="bus">Business Administration</SelectItem>
                <SelectItem value="arts">Liberal Arts</SelectItem>
                <SelectItem value="sci">Sciences</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Create a strong password" 
              className="pl-10 pr-10"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              id="confirmPassword" 
              type={showPassword ? "text" : "password"} 
              placeholder="Confirm your password" 
              className="pl-10 pr-10"
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

        <Button 
          type="submit" 
          className="w-full bg-blue-900 hover:bg-blue-800 text-white h-11 mt-2"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-800">
          Sign in instead
        </Link>
      </div>
    </div>
  );
}