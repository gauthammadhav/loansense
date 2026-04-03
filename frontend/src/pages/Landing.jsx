import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Badge } from '../components/ui/Badge';
import { Check, ArrowRight, Activity, Code, FileText, Database, Shield, Zap, Sparkles, Binary, MoveRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import AdvancedHero from '../components/hero/AdvancedHero';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

export default function Landing() {
  const { isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate(`/${role}/dashboard`, { replace: true });
  }, [isAuthenticated, role, navigate]);

  return (
    <div style={{ backgroundColor: 'var(--light)', color: 'var(--text)', fontFamily: 'var(--font-body)' }} className="min-h-screen">

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0,0)}>
            <div style={{ width: 32, height: 32, backgroundColor: 'var(--lime)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, boxShadow: '0 0 15px rgba(200,241,53,0.3)' }}>+</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', color: 'var(--text)' }}>LoanSense</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            {['Features', 'Intelligence', 'Architecture'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{item}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/login')} style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid var(--glass-border)', backgroundColor: 'transparent', color: 'var(--text)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--light3)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Sign in</button>
            <button onClick={() => navigate('/register')} style={{ padding: '8px 20px', borderRadius: 10, backgroundColor: 'var(--lime)', color: 'var(--text)', fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none', boxShadow: 'var(--shadow-md)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>Get early access</button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <AdvancedHero />

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ backgroundColor: 'var(--light2)', borderTop: '1px solid var(--glass-border)', padding: '120px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 80px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, border: '1px solid var(--glass-border)', backgroundColor: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
                <Sparkles size={13} style={{ color: 'var(--lime-dark)' }} /> Next Gen Toolkit
              </span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 52, lineHeight: 1.1, color: 'var(--text)', margin: 0 }}>
              Built for <span style={{ background: 'linear-gradient(90deg, var(--lime-dark), var(--success-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>algorithmic fairness</span> & transparency.
            </motion.h2>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>

            {/* Large card — col span 2 */}
            <motion.div variants={fadeInUp} style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 28, padding: 48, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lime)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
              <div style={{ position: 'absolute', right: 0, top: 0, width: 250, height: 250, background: 'rgba(200,241,53,0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
              <div style={{ width: 52, height: 52, background: 'var(--light)', border: '1px solid var(--glass-border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime-dark)', marginBottom: 28, boxShadow: 'var(--shadow-sm)' }}><Code size={22} /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: 'var(--text)', marginBottom: 14 }}>SHAP Explainability Maps</h3>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 480, marginBottom: 20 }}>Eliminate black-box lending. Our infrastructure automatically generates feature-level waterfalls indicating exact approval weights.</p>
              <button style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--lime-dark)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Explore the tech <MoveRight size={15} /></button>
            </motion.div>

            {/* Box 2 */}
            <motion.div variants={fadeInUp} style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 28, padding: 40, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--warning)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
              <div style={{ width: 52, height: 52, background: 'var(--light)', border: '1px solid var(--glass-border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning-dark)', marginBottom: 24 }}><Activity size={22} /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--text)', marginBottom: 12 }}>Live Parameter Sweeps</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>Applicants can drag sliders to understand what financial targets yield favorable outcomes instantly.</p>
            </motion.div>

            {/* Box 3 */}
            <motion.div variants={fadeInUp} style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 28, padding: 40, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--info)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
              <div style={{ width: 52, height: 52, background: 'var(--light)', border: '1px solid var(--glass-border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info-dark)', marginBottom: 24 }}><Database size={22} /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--text)', marginBottom: 12 }}>XGBoost Retraining</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>System automatically forks new model iterations against incoming distribution drifts.</p>
            </motion.div>

            {/* Box 4 — col span 2 */}
            <motion.div variants={fadeInUp} style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 28, padding: 48, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
              <div style={{ width: 52, height: 52, background: 'var(--light)', border: '1px solid var(--glass-border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-dark)', marginBottom: 28, boxShadow: 'var(--shadow-sm)' }}><Shield size={22} /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: 'var(--text)', marginBottom: 14 }}>Hardened Audit Enforcement</h3>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 480 }}>Every manual override requires certified justifications linked securely directly to the ML baseline snapshot.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── INTELLIGENCE ─── */}
      <section id="intelligence" style={{ backgroundColor: 'white', borderTop: '1px solid var(--glass-border)', padding: '120px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', gap: 80 }}>
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }} style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, border: '1px solid var(--glass-border)', backgroundColor: 'var(--light3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 24 }}>
              <Binary size={13} style={{ color: 'var(--lime-dark)' }} /> Inference Architecture
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 48, lineHeight: 1.1, color: 'var(--text)', marginBottom: 20 }}>Frictionless data,<br />instant routing.</h2>
            <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 40, maxWidth: 460 }}>From applicant entry to final disbursement, the pipeline never bottlenecks. Random Forests parse 22 dimensions of credit history in 60 milliseconds.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                { num: '01', title: 'Feature Extraction', desc: 'Raw financial inputs are scaled & normalized via ScikitLearn transformers.' },
                { num: '02', title: 'Inference Graph', desc: 'Live prediction against memory-resident optimized ONNX/Pickle models.' },
                { num: '03', title: 'Officer Queue', desc: 'Flags risky anomalies for human intervention while auto-clearing prime applicants.' }
              ].map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--light3)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 13, color: 'var(--lime-dark)', flexShrink: 0 }}>{step.num}</div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>{step.title}</h4>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-100px' }}
            style={{ flex: 1, minWidth: 0, position: 'relative', background: 'var(--light)', border: '1px solid var(--glass-border)', borderRadius: 28, padding: 32, boxShadow: 'var(--shadow-xl)', height: 520 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(200,241,53,0.12), transparent 50%)', borderRadius: 28, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, paddingBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
              {['var(--danger)', 'var(--warning)', 'var(--success)'].map((c, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', backgroundColor: 'white', borderRadius: 14, border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(200,241,53,0.1)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '40%', height: 8, backgroundColor: 'var(--light4)', borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ width: '25%', height: 8, backgroundColor: 'var(--light3)', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 60, height: 22, borderRadius: 999, backgroundColor: i % 2 === 0 ? 'var(--success-bg)' : 'var(--danger-bg)', flexShrink: 0 }} />
                </motion.div>
              ))}
            </div>
            {/* Floating card */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}
              style={{ position: 'absolute', left: -48, bottom: 40, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', padding: '20px 24px', borderRadius: 18, boxShadow: 'var(--shadow-xl)', minWidth: 200 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lime-dark)', marginBottom: 6 }}>Automated Alert</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>DTI Threshold Crossed</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Routed to strict manual review.</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── ARCHITECTURE ─── */}
      <section id="architecture" style={{ backgroundColor: 'var(--light2)', borderTop: '1px solid var(--glass-border)', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'rgba(200,241,53,0.08)', borderRadius: '50%', filter: 'blur(150px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, border: '1px solid var(--glass-border)', backgroundColor: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
              <Check size={13} style={{ color: 'var(--lime-dark)' }} /> Dual Interface
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 52, lineHeight: 1.1, color: 'var(--text)', margin: 0 }}>One platform.<br />Two perspectives.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Applicant Card */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 28, padding: 48, boxShadow: 'var(--shadow-md)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--lime)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: 'var(--text)', marginBottom: 32 }}>The Applicant</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
                {['Guided 5-step semantic form', 'Instant machine inference execution', 'SHAP interpretability graphs', 'Interactive financial sliders'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={13} style={{ color: 'var(--lime-dark)', strokeWidth: 3 }} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-muted)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Officer Card */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
              style={{ background: 'white', border: '1px solid var(--glass-border)', borderRadius: 28, padding: 48, boxShadow: 'var(--shadow-md)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: 'var(--text)', marginBottom: 32 }}>The Officer</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
                {['Live priority SLA queueing', 'Side-by-side audit telemetry', 'Mandatory override protocols', 'Macro-level dataset drift analytics'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--light3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ArrowRight size={13} style={{ color: 'var(--text)', strokeWidth: 3 }} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-muted)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ backgroundColor: 'var(--light)', padding: '120px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            style={{ background: 'white', borderRadius: 40, padding: '96px 64px', textAlign: 'center', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(200,241,53,0.15), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 60, color: 'var(--text)', marginBottom: 20, lineHeight: 1.05 }}>Deploy inference.</h2>
              <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 48, maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.7 }}>Join edge-tier lending institutions processing risk matrices securely and transparently in milliseconds.</p>
              <button onClick={() => navigate('/register')}
                style={{ padding: '18px 44px', borderRadius: 14, backgroundColor: 'var(--lime)', color: 'var(--text)', fontWeight: 700, fontSize: 16, cursor: 'pointer', border: 'none', boxShadow: 'var(--shadow-lg)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}>
                Initialize Workspace
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ backgroundColor: 'white', borderTop: '1px solid var(--glass-border)', padding: '80px 0 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, backgroundColor: 'var(--lime)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>+</div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: 'var(--text)' }}>LoanSense</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 260 }}>Democratizing structured financial analysis workflows via modern interpretable algorithms.</p>
            </div>
            {[
              { heading: 'Platform', links: ['Risk Assessment', 'Data Pipelines', 'Officer Portals', 'Model Metrics'] },
              { heading: 'Organization', links: ['Research Labs', 'Careers', 'Press Config', 'Contact'] },
              { heading: 'Compliance', links: ['Privacy Node', 'Terms of Service', 'Security Certs'] },
            ].map(col => (
              <div key={col.heading}>
                <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text)', marginBottom: 20 }}>{col.heading}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(link => (
                    <li key={link}><a href="#" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--lime-dark)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: 24, borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>© {new Date().getFullYear()} LoanSense Architecture. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
