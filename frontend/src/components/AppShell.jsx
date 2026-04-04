import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Home, User, Bell, Command, Menu, X, BarChart3 } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const SIDEBAR_WIDTH = 240;

export default function AppShell({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = role === 'applicant' ? [
    { path: `/${role}/dashboard`, label: 'Dashboard', icon: Home },
    { path: '/applicant/apply', label: 'New Application', icon: Command },
  ] : [
    { path: `/${role}/dashboard`, label: 'Dashboard', icon: Home },
    { path: '/officer/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--light)', color: 'var(--text)', display: 'flex' }}>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
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
            {navItems.map(item => (
              <NavItem
                key={item.path}
                icon={<item.icon size={17} />}
                label={item.label}
                active={location.pathname.includes(item.path.split('/').pop())}
                onClick={() => navigate(item.path)}
              />
            ))}
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
      )}

      {/* ── MOBILE: HAMBURGER FAB ── */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setDrawerOpen(true)}
          style={{
            position: 'fixed', top: 12, left: 12, zIndex: 1000,
            width: 44, height: 44,
            background: 'var(--lime)', border: 'none', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Menu size={22} color="var(--text)" />
        </motion.button>
      )}

      {/* ── MOBILE: DRAWER OVERLAY ── */}
      <AnimatePresence>
        {isMobile && drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                zIndex: 1001, backdropFilter: 'blur(4px)',
              }}
            />

            {/* Slide-in Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed', left: 0, top: 0, bottom: 0,
                width: 280, maxWidth: '80vw',
                background: 'var(--light2)',
                zIndex: 1002, display: 'flex', flexDirection: 'column',
                boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
                overflowY: 'auto',
              }}
            >
              {/* Drawer Header */}
              <div style={{
                padding: '20px', borderBottom: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, backgroundColor: 'var(--lime)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>+</div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: 'var(--text)' }}>LoanSense</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                  <X size={22} color="var(--text-muted)" />
                </button>
              </div>

              {/* Drawer User Info */}
              <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(200,241,53,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 16, color: 'var(--lime-dark)',
                  }}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.full_name || user?.email || 'User'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{role}</div>
                  </div>
                </div>
              </div>

              {/* Drawer Nav */}
              <nav style={{ flex: 1, padding: '16px' }}>
                {navItems.map(item => {
                  const isActive = location.pathname.includes(item.path.split('/').pop());
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                      style={{
                        width: '100%', padding: '14px 16px', marginBottom: 8,
                        background: isActive ? 'rgba(200,241,53,0.12)' : 'transparent',
                        color: isActive ? 'var(--text)' : 'var(--text-muted)',
                        border: 'none', borderRadius: 10,
                        display: 'flex', alignItems: 'center', gap: 12,
                        fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Drawer Logout */}
              <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'rgba(248,113,113,0.08)', color: 'var(--danger-dark)',
                    border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10,
                    fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,
        display: 'flex', flexDirection: 'column',
        minHeight: '100vh', position: 'relative', overflowX: 'hidden',
      }}>

        {/* Top header */}
        <header style={{
          height: 60, position: 'sticky', top: 0, zIndex: 30,
          backgroundColor: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '0 16px 0 64px' : '0 32px',
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
        <div style={{ flex: 1, padding: isMobile ? 16 : 32, position: 'relative' }}>
          {/* Subtle bg gradient */}
          <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at top right, rgba(200,241,53,0.06), transparent 30%)', pointerEvents: 'none', zIndex: 0 }} />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', paddingBottom: isMobile ? 24 : 80 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && (
        <motion.nav
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: 64, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            padding: '0 8px', zIndex: 100,
            boxShadow: '0 -2px 12px rgba(0,0,0,0.04)',
          }}
        >
          {navItems.map(item => {
            const isActive = location.pathname.includes(item.path.split('/').pop());
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }}
                style={{
                  flex: 1, maxWidth: 100, height: 52,
                  background: isActive ? 'rgba(200,241,53,0.1)' : 'transparent',
                  border: 'none', borderRadius: 12,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 3, cursor: 'pointer',
                }}
              >
                <item.icon size={20} color={isActive ? 'var(--lime-dark)' : 'var(--text-muted)'} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--lime-dark)' : 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                  {item.label.split(' ').pop()}
                </span>
              </motion.button>
            );
          })}
          {/* Menu button in bottom nav */}
          <motion.button
            onClick={() => setDrawerOpen(true)}
            whileTap={{ scale: 0.9 }}
            style={{
              width: 52, height: 52,
              background: 'transparent', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, cursor: 'pointer',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(200,241,53,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: 'var(--lime-dark)',
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>More</span>
          </motion.button>
        </motion.nav>
      )}
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
