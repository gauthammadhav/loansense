import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 4) s = 1;
  if (pw.length >= 8) s = 2;
  if (pw.length >= 8 && /\d/.test(pw)) s = 3;
  if (pw.length >= 10 && /\d/.test(pw) && /[^a-zA-Z0-9]/.test(pw)) s = 4;
  return s;
}
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/register', {
        full_name: `${firstName} ${lastName}`.trim(),
        email,
        password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-input)',
    padding: '11px 14px',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: 'var(--text)',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-ui)',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-faint)',
    marginBottom: 6,
  };
  const focusOn  = e => { e.target.style.borderColor = 'rgba(200,241,53,0.4)'; e.target.style.background = 'rgba(200,241,53,0.03)'; };
  const focusOff = e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.background  = 'rgba(255,255,255,0.04)'; };

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--text)' }}>LoanSense</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--dark)', position: 'relative', overflow: 'hidden' }}>
      <div className="page-bg" />
      <div className="page-grid" />

      {/* LEFT BRAND PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{ padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        
        <div>
          {logo}

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
            <span style={{ display: 'block', color: 'var(--text)' }}>Start your journey.</span>
            <em style={{ display: 'block', fontStyle: 'italic', color: 'var(--lime)' }}>Get funded.</em>
            <span style={{ display: 'block', color: 'var(--text)' }}>Today.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 300, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.7 }}>
            Apply in minutes and get an AI-powered decision — with a full breakdown of exactly why.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {['94% model accuracy', 'Decision in <2s', 'SHAP explained'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)' }}>{item}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* RIGHT FORM PANEL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 24,
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            padding: 40,
            width: '100%',
            maxWidth: 440,
            position: 'relative',
            overflow: 'hidden',
          }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
          <div style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, background: 'var(--lime-glow)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Create account</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 300, color: 'var(--text-muted)' }}>Start your loan application in minutes.</p>
          </div>

          {/* Officer info strip */}
          <div style={{ background: 'rgba(200,241,53,0.05)', border: '1px solid rgba(200,241,53,0.15)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0, marginTop: 4 }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(200,241,53,0.7)', lineHeight: 1.5 }}>
              Officer accounts are created by your bank administrator. Register here only as a loan applicant.
            </span>
          </div>

          <AnimatePresence>
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '32px 0', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--success)' }}>
                  Account created! Redirecting...
                </p>
              </motion.div>
            ) : (
              <form key="form" onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
                {/* Name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>First name</label>
                    <input type="text" value={firstName} required onChange={e => setFirstName(e.target.value)} placeholder="Jane" style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last name</label>
                    <input type="text" value={lastName} required onChange={e => setLastName(e.target.value)} placeholder="Smith" style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email address</label>
                  <input type="email" value={email} required onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                </div>

                <div>
                  <label style={labelStyle}>Phone (optional)</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <input type="password" value={password} required onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                  {/* Password strength bar */}
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map(seg => (
                          <div key={seg} style={{ flex: 1, height: 3, borderRadius: 2, background: seg <= strength ? 'var(--lime-dark)' : 'var(--glass-border)', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-faint)' }}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--danger)' }}>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { y: -1, boxShadow: '0 6px 24px rgba(200,241,53,0.25)' } : {}}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    background: 'var(--lime)',
                    color: 'var(--dark)',
                    border: 'none',
                    borderRadius: 11,
                    padding: '13px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 4,
                  }}>
                  {loading ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Creating account...
                    </>
                  ) : 'Create account'}
                </motion.button>
              </form>
            )}
          </AnimatePresence>

          <div style={{ marginTop: 20, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--lime-dark)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
