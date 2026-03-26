import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  PieChart,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export default function AppShell() {
  const { role, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const applicantNav = [
    { name: 'Dashboard', path: '/applicant/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Apply for Loan', path: '/applicant/apply', icon: <FileText size={18} /> },
  ];

  const officerNav = [
    { name: 'Dashboard', path: '/officer/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Review Queue', path: '/officer/review', icon: <FileText size={18} /> },
    { name: 'Analytics', path: '/officer/analytics', icon: <PieChart size={18} /> },
  ];

  const navigation = role === 'officer' ? officerNav : applicantNav;

  return (
    <div className="min-h-screen bg-page text-dark flex" style={{ backgroundColor: 'var(--page)' }}>
      {/* Sidebar - Strictly 220px and Dark */}
      <aside 
        className="fixed inset-y-0 left-0 w-[220px] bg-dark text-white flex flex-col z-50 border-r border-white/5 shadow-2xl"
        style={{ backgroundColor: 'var(--dark)' }}
      >
        <div className="p-8 pb-10 flex items-center justify-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-heading font-bold tracking-tight"
          >
            LoanSense<span className="text-lime">.</span>
          </motion.h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[13px] font-semibold border ${
                    isActive
                      ? 'text-dark bg-lime border-lime shadow-[0_4px_20px_-5px_var(--lime)]' 
                      : 'text-faint hover:text-white hover:bg-white/5 border-transparent'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserIcon size={40} />
            </div>
            <p className="text-[10px] text-faint uppercase font-bold tracking-widest mb-1">Authenticated</p>
            <p className="text-sm truncate font-bold text-white max-w-[140px]">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[10px] text-lime font-bold uppercase tracking-tighter mt-0.5">{role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-white/10 hover:bg-danger/20 hover:text-danger rounded-xl transition-all duration-300 border border-white/5 shadow-inner"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area - Light Background */}
      <main className="flex-1 ml-[220px] relative">
        <div className="max-w-6xl mx-auto p-12 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
