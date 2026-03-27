import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // UI interaction states
  const [focusName, setFocusName] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/auth/register', { 
        full_name: fullName,
        email, 
        password 
      });
      
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation
  const getStrengthLog = () => {
    const len = password.length;
    if (len === 0) return { level: 0, text: '' };
    if (len < 6) return { level: 1, text: 'Weak' };
    if (len < 8) return { level: 2, text: 'Fair' };
    if (len < 10) return { level: 3, text: 'Good' };
    return { level: 4, text: 'Strong' };
  };
  const strength = getStrengthLog();

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
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '48px', width: 'fit-content' }}>
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
        </Link>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800,
          lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: '16px', color: 'var(--text)'
        }}>
          Start your<br/>
          <em style={{ fontStyle: 'italic', color: 'var(--lime)', display: 'block' }}>journey.</em>
          Get funded.
        </h2>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 300,
          color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '360px', marginBottom: '40px'
        }}>
          Create your LoanSense account and get an AI-powered loan decision in minutes — with complete transparency on every factor.
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

          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0', animation: 'scaleIn 0.3s ease' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--success)', fontWeight: 500 }}>
                {success}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                Create account
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
                Join thousands of applicants getting smarter loan decisions
              </div>

              <div style={{
                background: 'rgba(200,241,53,0.05)', border: '1px solid rgba(200,241,53,0.12)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
                display: 'flex', gap: '10px', alignItems: 'flex-start'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)', marginTop: '4px', flexShrink: 0 }} />
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(200,241,53,0.65)', lineHeight: 1.5 }}>
                  Officer accounts are set up by your bank administrator. Register here only as a loan applicant.
                </div>
              </div>

              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-faint)', marginBottom: '6px' }}>
                    Full name
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={() => setFocusName(true)}
                    onBlur={() => setFocusName(false)}
                    placeholder="John Doe"
                    className="ls-input"
                    required
                    style={{
                      width: '100%', borderRadius: '10px', padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)', outline: 'none', transition: 'all 0.2s',
                      background: focusName ? 'rgba(200,241,53,0.03)' : 'rgba(255,255,255,0.04)',
                      border: focusName ? '1px solid rgba(200,241,53,0.4)' : '1px solid var(--glass-border)'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-faint)', marginBottom: '6px' }}>
                    Email address
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusEmail(true)}
                    onBlur={() => setFocusEmail(false)}
                    placeholder="you@example.com"
                    className="ls-input"
                    required
                    style={{
                      width: '100%', borderRadius: '10px', padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)', outline: 'none', transition: 'all 0.2s',
                      background: focusEmail ? 'rgba(200,241,53,0.03)' : 'rgba(255,255,255,0.04)',
                      border: focusEmail ? '1px solid rgba(200,241,53,0.4)' : '1px solid var(--glass-border)'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-faint)', marginBottom: '6px' }}>
                    Password
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusPass(true)}
                    onBlur={() => setFocusPass(false)}
                    placeholder="••••••••"
                    className="ls-input"
                    required
                    style={{
                      width: '100%', borderRadius: '10px', padding: '11px 14px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)', outline: 'none', transition: 'all 0.2s',
                      background: focusPass ? 'rgba(200,241,53,0.03)' : 'rgba(255,255,255,0.04)',
                      border: focusPass ? '1px solid rgba(200,241,53,0.4)' : '1px solid var(--glass-border)'
                    }}
                  />
                  
                  {password.length > 0 && (
                    <>
                      <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
                        {[1, 2, 3, 4].map((seg) => (
                          <div key={seg} style={{
                            flex: 1, height: '3px', borderRadius: '2px', transition: 'background 0.3s',
                            background: seg <= strength.level ? 'var(--lime-dark)' : 'var(--glass-border)'
                          }} />
                        ))}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text-faint)', marginTop: '4px' }}>
                        {strength.text}
                      </div>
                    </>
                  )}
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
                      CREATING ACCOUNT...
                    </>
                  ) : 'Create my account'}
                </button>
              </form>
            </>
          )}

          {error && !success && (
            <div style={{ marginTop: '10px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: 'var(--danger)' }}>
                ✕
              </div>
              {error}
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-faint)' }}>
            Already have an account? <span style={{ color: 'var(--lime-dark)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign in</span>
          </div>

        </div>
      </div>
    </div>
  );
}
