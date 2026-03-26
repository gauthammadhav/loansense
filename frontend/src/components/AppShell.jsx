import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  PieChart,
  LogOut,
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
    { name: 'Dashboard', path: '/applicant/dashboard', icon: <LayoutDashboard size={16} />, section: 'MAIN' },
    { name: 'Apply for Loan', path: '/applicant/apply', icon: <FileText size={16} />, section: 'MAIN' },
  ];

  const officerNav = [
    { name: 'Dashboard', path: '/officer/dashboard', icon: <LayoutDashboard size={16} />, section: 'MAIN' },
    { name: 'Review Queue', path: '/officer/review', icon: <FileText size={16} />, section: 'MAIN' },
    { name: 'Analytics', path: '/officer/analytics', icon: <PieChart size={16} />, section: 'REPORTS' },
  ];

  const navigation = role === 'officer' ? officerNav : applicantNav;
  const isOfficer = role === 'officer';

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', backgroundColor: 'var(--dark)' }}>

      {/* SIDEBAR */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'fixed', inset: '0 auto 0 0',
          width: 220,
          background: 'var(--dark2)',
          borderRight: '1px solid var(--glass-border)',
          display: 'flex', flexDirection: 'column',
          zIndex: 50,
        }}>

        {/* LOGO */}
        <div style={{ padding: '24px 20px 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark)', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>LoanSense</span>
        </div>

        {/* NAV */}
        <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Section labels */}
          {(() => {
            const sections = [...new Set(navigation.map(i => i.section))];
            return sections.map(section => (
              <div key={section}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-faint)', padding: '0 12px', marginTop: 16, marginBottom: 4 }}>
                  {section}
                </div>
                {navigation.filter(i => i.section === section).map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.07 }}
                  >
                    <NavLink
                      to={item.path}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        height: 38,
                        padding: '0 12px 0 20px',
                        margin: '1px 0',
                        borderRadius: 8,
                        textDecoration: 'none',
                        fontFamily: 'var(--font-ui)',
                        fontSize: 12,
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        ...(isActive ? {
                          background: 'rgba(200,241,53,0.08)',
                          color: 'var(--lime)',
                          boxShadow: 'inset 2px 0 0 var(--lime)',
                        } : {
                          background: 'transparent',
                          color: 'var(--text-faint)',
                        }),
                      })}>
                      {item.icon}
                      {item.name}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            ));
          })()}
        </nav>

        {/* USER ROW */}
        <div style={{ marginTop: 'auto', padding: '14px 20px', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: isOfficer ? 'rgba(129,140,248,0.15)' : '#1C2800',
              border: `1.5px solid ${isOfficer ? '#818CF8' : 'var(--lime)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700,
              color: isOfficer ? '#818CF8' : 'var(--lime)',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name?.split(' ')[0] || 'User'}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: isOfficer ? '#818CF8' : 'var(--lime)', letterSpacing: '0.05em' }}>
                {role}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ backgroundColor: 'rgba(248,113,113,0.1)', color: 'var(--danger)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            style={{
              display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '8px 12px',
              fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700,
              color: 'var(--text-faint)',
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            <LogOut size={13} />
            Sign Out
          </motion.button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, marginLeft: 220, position: 'relative', minHeight: '100vh' }}>
        <div className="page-bg" />
        <div className="page-grid" />
        <div style={{ position: 'relative', zIndex: 1, padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
