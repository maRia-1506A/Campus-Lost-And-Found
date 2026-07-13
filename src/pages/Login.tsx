import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Mail, Lock, PackageSearch } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login(email);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-brand-600 p-2 rounded-xl shadow-sm">
              <PackageSearch className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>
              Enter your university email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                id="email" 
                label="University Email" 
                placeholder="student@university.edu" 
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input 
                id="password" 
                label="Password" 
                type="password"
                leftIcon={<Lock className="w-4 h-4" />}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-500">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full mt-2">
                Sign in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-slate-100 pt-6">
            <div className="text-sm text-center text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
