import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // UI interaction states
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token } = response.data;
      
      const meResponse = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      const user = meResponse.data;
      setAuth(user, access_token, user.role);
      
      // Strict role-based routing
      if (user.role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/applicant/dashboard');
      }
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      position: 'relative',
      fontFamily: 'var(--font-body)',
      background: 'var(--dark)',
      color: 'var(--text)',
      overflow: 'hidden'
    }}>
      <div className="page-bg" />
      <div className="page-grid" />

      {/* LEFT COLUMN — Brand panel */}
      <div style={{
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'var(--lime)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25), transparent)',
              pointerEvents: 'none'
            }} />
            <svg viewBox="0 0 14 14" fill="none" style={{ width: '14px', height: '14px' }}>
              <path d="M1 7h12M7 1v12" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
            LoanSense
          </div>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800,
          lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: '16px', color: 'var(--text)'
        }}>
          Your loan.<br/>
          <em style={{ fontStyle: 'italic', color: 'var(--lime)', display: 'block' }}>Your terms.</em>
          Explained.
        </h2>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 300,
          color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '360px', marginBottom: '40px'
        }}>
          Apply in minutes, get an AI-powered decision instantly — with a full breakdown of exactly why every decision was made.
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {["94% model accuracy", "Decision in under 2s", "SHAP explained"].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-faint)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN — Form panel */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px', position: 'relative', zIndex: 1
      }}>
        <div className="glass-strong" style={{ width: '100%', maxWidth: '420px', padding: '40px', position: 'relative' }}>
          
          <div style={{
            position: 'absolute', bottom: '-60px', right: '-60px', width: '200px', height: '200px',
            borderRadius: '50%', background: 'var(--lime-glow)', filter: 'blur(40px)', pointerEvents: 'none'
          }} />

          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
            Welcome back
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
            Sign in to continue to your account
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-faint)', marginBottom: '6px' }}>
                Email address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                placeholder="you@example.com"
                className="ls-input"
                required
                style={{
                  width: '100%', borderRadius: '10px', padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)', outline: 'none', transition: 'all 0.2s',
                  background: emailFocus ? 'rgba(200,241,53,0.03)' : 'rgba(255,255,255,0.04)',
                  border: emailFocus ? '1px solid rgba(200,241,53,0.4)' : '1px solid var(--glass-border)'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-faint)', marginBottom: '6px' }}>
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                placeholder="••••••••"
                className="ls-input"
                required
                style={{
                  width: '100%', borderRadius: '10px', padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)', outline: 'none', transition: 'all 0.2s',
                  background: passFocus ? 'rgba(200,241,53,0.03)' : 'rgba(255,255,255,0.04)',
                  border: passFocus ? '1px solid rgba(200,241,53,0.4)' : '1px solid var(--glass-border)'
                }}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '20px', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--lime-dark)', cursor: 'pointer' }}>
              Forgot password?
            </div>

            <button 
              type="submit" 
              disabled={loading}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                width: '100%', padding: '13px', background: 'var(--lime)', border: 'none', borderRadius: '11px',
                fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700, color: 'var(--dark)', letterSpacing: '0.3px',
                transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                transform: btnHover && !loading ? 'translateY(-1px)' : 'none',
                boxShadow: btnHover && !loading ? '0 6px 24px rgba(200,241,53,0.3)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" style={{animation:'spin 0.8s linear infinite'}}>
                    <circle cx="8" cy="8" r="6" fill="none" stroke="var(--dark)" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10"/>
                  </svg>
                  SIGNING IN...
                </>
              ) : 'Sign in to LoanSense'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-faint)' }}>or</div>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          </div>

          <button 
            type="button"
            onMouseEnter={() => setGoogleHover(true)}
            onMouseLeave={() => setGoogleHover(false)}
            style={{
              width: '100%', padding: '11px', background: googleHover ? 'var(--glass-h)' : 'var(--glass)', 
              border: '1px solid var(--glass-border)', borderRadius: '10px',
              fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, 
              color: googleHover ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {error && (
            <div style={{ marginTop: '10px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: 'var(--danger)' }}>
                ✕
              </div>
              {error}
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-faint)' }}>
            New here? <span style={{ color: 'var(--lime-dark)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/register')}>Create an account</span>
          </div>

        </div>
      </div>
    </div>
  );
}
