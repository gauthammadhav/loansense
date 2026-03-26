import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  PieChart,
  LogOut
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
      {/* Sidebar - Animated */}
      <motion.aside 
        initial={{ x: -220 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 w-[220px] bg-dark text-white flex flex-col z-40 shadow-xl"
        style={{ backgroundColor: 'var(--dark)' }}
      >
        <div className="p-6 flex items-center justify-center border-b border-white/10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-heading font-bold tracking-wide"
          >
            LoanSense<span className="text-lime">.</span>
          </motion.h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item, i) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium ${
                  isActive
                    ? 'text-lime bg-lime/10 shadow-[inset_2px_0_0_currentColor]' // Active indicator
                    : 'text-faint hover:text-white hover:bg-white/5 hover:translate-x-1' 
                }`
              }
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3 w-full"
              >
                {item.icon}
                {item.name}
              </motion.div>
            </NavLink>
          ))}
        </nav>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 border-t border-white/10"
        >
          <div className="mb-4 px-2">
            <p className="text-xs text-faint uppercase font-bold tracking-wider">Logged In As</p>
            <p className="text-sm truncate mt-1 text-white">{user?.email || 'User'}</p>
            <p className="text-xs text-lime capitalize mt-0.5">{role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-faint hover:text-danger hover:bg-danger-bg/10 rounded-md transition-all hover:translate-x-1"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </motion.div>
      </motion.aside>

      {/* Main Content Area - Animated Routing */}
      <main className="flex-1 ml-[220px] overflow-hidden">
        <div className="max-w-7xl mx-auto p-8 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
