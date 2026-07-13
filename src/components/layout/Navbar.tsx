import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { PackageSearch, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-brand-600 p-1.5 rounded-lg">
            <PackageSearch className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">CampusFinder</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
          <Link to="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link>
          <Link to="/lost" className="hover:text-brand-600 transition-colors">Lost Items</Link>
          <Link to="/found" className="hover:text-brand-600 transition-colors">Found Items</Link>
          <Link to="/about" className="hover:text-brand-600 transition-colors">How it works</Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="text-sm font-medium text-slate-700 flex items-center gap-2 hover:text-brand-600 transition-colors">
                <User className="w-4 h-4" />
                {user.name}
              </Link>
              <Button variant="ghost" onClick={logout}>Log out</Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hidden sm:flex">Log in</Button>
              </Link>
              <Link to="/register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
