import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Home, User, Bell, Command } from 'lucide-react';

const SIDEBAR_WIDTH = 240;

export default function AppShell({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--light)', color: 'var(--text)', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -SIDEBAR_WIDTH }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: SIDEBAR_WIDTH,
          position: 'fixed',
          top: 0, bottom: 0, left: 0,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid var(--glass-border)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 32, height: 32, backgroundColor: 'var(--lime)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>+</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em', color: 'var(--text)' }}>LoanSense</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem
            icon={<Home size={17} />}
            label="Dashboard"
            active={location.pathname.includes('dashboard')}
            onClick={() => navigate(`/${role}/dashboard`)}
          />
          {role === 'applicant' && (
            <NavItem
              icon={<Command size={17} />}
              label="New Application"
              active={location.pathname.includes('apply')}
              onClick={() => navigate('/applicant/apply')}
            />
          )}
          {role === 'officer' && (
            <NavItem
              icon={<User size={17} />}
              label="Analytics"
              active={location.pathname.includes('analytics')}
              onClick={() => navigate('/officer/analytics')}
            />
          )}
        </nav>

        {/* User footer */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              backgroundColor: 'rgba(200,241,53,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, color: 'var(--lime-dark)',
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'User'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 10, border: 'none',
              backgroundColor: 'transparent', cursor: 'pointer',
              color: 'var(--danger-dark)', fontSize: 13, fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.08)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, marginLeft: SIDEBAR_WIDTH, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

        {/* Top header */}
        <header style={{
          height: 60, position: 'sticky', top: 0, zIndex: 30,
          backgroundColor: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ textTransform: 'capitalize' }}>{role}</span>
            <span>/</span>
            <span style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{location.pathname.split('/').pop()}</span>
          </div>
          <button style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '1px solid var(--glass-border)', backgroundColor: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--lime-dark)'; e.currentTarget.style.borderColor = 'var(--lime)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            <Bell size={16} />
          </button>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: 32, position: 'relative' }}>
          {/* Subtle bg gradient */}
          <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at top right, rgba(200,241,53,0.06), transparent 30%)', pointerEvents: 'none', zIndex: 0 }} />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', paddingBottom: 80 }}
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
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
        backgroundColor: active ? 'rgba(200,241,53,0.12)' : 'transparent',
        color: active ? 'var(--text)' : 'var(--text-muted)',
        fontSize: 13, fontWeight: 600,
        position: 'relative', transition: 'background 0.15s, color 0.15s',
        textAlign: 'left',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'var(--light3)'; e.currentTarget.style.color = 'var(--text)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
    >
      {/* Active indicator bar */}
      {active && (
        <motion.div
          layoutId="navIndicator"
          style={{
            position: 'absolute', left: 0, width: 3, height: 20,
            backgroundColor: 'var(--lime-dark)', borderRadius: '0 3px 3px 0',
          }}
        />
      )}
      <span style={{ color: active ? 'var(--lime-dark)' : 'inherit', display: 'flex' }}>{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}
