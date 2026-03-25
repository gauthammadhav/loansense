import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard,
  FileText,
  PieChart,
  LogOut
} from 'lucide-react';

export default function AppShell() {
  const { role, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation based on the strict PRD routing
  const applicantNav = [
    { name: 'Dashboard', path: '/applicant/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Apply for Loan', path: '/applicant/apply', icon: <FileText size={20} /> },
  ];

  const officerNav = [
    { name: 'Dashboard', path: '/officer/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Review Queue', path: '/officer/review', icon: <FileText size={20} /> },
    { name: 'Analytics', path: '/officer/analytics', icon: <PieChart size={20} /> },
  ];

  const navigation = role === 'officer' ? officerNav : applicantNav;

  return (
    <div className="min-h-screen bg-page text-dark flex" style={{ backgroundColor: 'var(--page)' }}>
      {/* Sidebar - Strictly 220px and Dark */}
      <aside 
        className="fixed inset-y-0 left-0 w-[220px] bg-dark text-white flex flex-col"
        style={{ backgroundColor: 'var(--dark)' }}
      >
        <div className="p-6 flex items-center justify-center border-b border-white/10">
          <h1 className="text-2xl font-heading font-bold tracking-wide">
            LoanSense<span className="text-lime">.</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'text-lime' // Active item MUST be lime text
                    : 'text-faint hover:text-white hover:bg-white/5' // Hover -> subtle dark bg
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4 px-2">
            <p className="text-xs text-faint uppercase font-bold tracking-wider">Logged In As</p>
            <p className="text-sm truncate mt-1 text-white">{user?.email || 'User'}</p>
            <p className="text-xs text-lime capitalize mt-0.5">{role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-faint hover:text-danger hover:bg-danger-bg/10 rounded-md transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area - Light Background */}
      <main className="flex-1 ml-[220px]">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
