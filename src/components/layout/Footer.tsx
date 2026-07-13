import { PackageSearch } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-brand-600 p-1.5 rounded-lg">
                <PackageSearch className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">CampusFinder</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm">
              The centralized platform for university students to quickly report, search, claim, and recover lost belongings on campus.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="/lost" className="hover:text-brand-600 transition-colors">Lost Items</a></li>
              <li><a href="/found" className="hover:text-brand-600 transition-colors">Found Items</a></li>
              <li><a href="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-brand-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Contact Admin</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} CampusFinder. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
