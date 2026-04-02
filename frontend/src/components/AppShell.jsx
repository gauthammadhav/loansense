import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Home, User, Bell, Command } from 'lucide-react';
import { Button } from './ui/Button';

export default function AppShell({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark text-white flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 border-r border-white/10 bg-dark2/50 backdrop-blur-3xl flex flex-col fixed inset-y-0 z-40"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center text-dark font-bold text-xl">+</div>
          <span className="font-heading font-bold text-xl tracking-tight text-white">LoanSense</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<Home size={18} />} label="Dashboard" active={location.pathname.includes('dashboard')} onClick={() => navigate(`/${role}/dashboard`)} />
          {role === 'applicant' && <NavItem icon={<Command size={18} />} label="New Application" active={location.pathname.includes('apply')} onClick={() => navigate('/applicant/apply')} />}
          {role === 'officer' && <NavItem icon={<User size={18} />} label="Analytics" active={location.pathname.includes('analytics')} onClick={() => navigate('/officer/analytics')} />}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lime font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold truncate">{user?.email || 'User'}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">{role}</div>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-danger hover:text-danger hover:bg-danger/10" icon={<LogOut size={16} />} onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative overflow-x-hidden">
        <header className="h-16 border-b border-white/10 bg-dark/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
           <div className="text-sm text-text-muted font-medium flex items-center gap-2">
              <span className="capitalize">{role}</span>
              <span>/</span>
              <span className="text-white capitalize">{location.pathname.split('/').pop()}</span>
           </div>
           
           <div className="flex items-center gap-4">
             <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-muted hover:text-lime hover:border-lime/50 transition-colors cursor-pointer">
               <Bell size={18} />
             </button>
           </div>
        </header>

        <div className="flex-1 p-8 relative">
          {/* Subtle global gradient underlying dashboard */}
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,var(--lime-glow),transparent_30%)] pointer-events-none opacity-40 z-0" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative z-10 max-w-7xl mx-auto w-full h-full pb-20"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <motion.button
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all outline-none cursor-pointer ${active ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
    >
      <span className={active ? 'text-lime' : ''}>{icon}</span>
      <span className="font-medium text-sm tracking-wide">{label}</span>
      {active && (
        <motion.div layoutId="navIndicator" className="absolute left-0 w-1 h-6 bg-lime rounded-r-full shadow-[0_0_10px_var(--lime)]" />
      )}
    </motion.button>
  );
}
