
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  onToggleRole: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, onToggleRole }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-[#003057] tracking-tight">
              YU Israel Campus Maintenance Request Form
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Level</span>
              <span className="text-sm font-bold text-[#003057]">{userRole}</span>
            </div>
            <button
              onClick={onToggleRole}
              className="px-5 py-2 bg-[#003057] text-white rounded-full text-xs font-bold hover:bg-[#004b86] transition-all shadow-md active:scale-95 flex items-center space-x-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Switch to {userRole === UserRole.Admin ? 'Resident/Student' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>

      <footer className="bg-slate-50 border-t py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-[#003057] font-bold text-sm tracking-widest uppercase">
              Yeshiva University Israel Campus
            </div>
            <div className="text-slate-400 text-[11px] uppercase tracking-[0.2em] font-bold">
              © {new Date().getFullYear()} Maintenance Department
            </div>
            <p className="text-slate-400 text-[10px] text-center max-w-md">
              Official portal for campus infrastructure requests.
              Requests are monitored Sunday through Thursday during standard business hours.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
