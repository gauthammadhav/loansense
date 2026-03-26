import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};
const slideLeft = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const float = {
  y: [0, -8, 0],
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [shapWidths, setShapWidths] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (user) {
      if (user.role === 'applicant') navigate('/applicant/dashboard');
      if (user.role === 'officer') navigate('/officer/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setShapWidths([88, 70, 32, 55]), 400);
    return () => clearTimeout(t);
  }, []);

  const logo = (size = 32) => (
    <div style={{
      width: size, height: size, borderRadius: size * 0.25,
      background: 'var(--lime)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: 'var(--dark)', flexShrink: 0,
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </div>
  );

  const shapBars = [
    { label: 'Credit score', idx: 0, positive: true },
    { label: 'Total income', idx: 1, positive: true },
    { label: 'Debt ratio',   idx: 2, positive: false },
    { label: 'Loan amount',  idx: 3, positive: true },
  ];

  const features = [
    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Real-time Inference', desc: 'ML pipeline processes data vectors in milliseconds for instant decisions.' },
    { icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', title: 'Dynamic Pricing', desc: 'Interest formulation mapped dynamically to your personalized risk banding.' },
    { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Bank-Grade Security', desc: 'JWT-bound communication backed by enterprise hashing infrastructure.' },
    { icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z', title: 'Complete Audit Trail', desc: 'Every model decision is logged, versioned, and stored for compliance.' },
    { icon: 'M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z', title: 'SHAP Transparency', desc: 'Unpack black-box decisions to show exactly why each result was reached.' },
    { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', title: 'PDF Generation', desc: 'Automated, legally-compliant decision letters generated instantaneously.' },
  ];

  const sectionTag = (text) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{ width: 24, height: 2, background: 'var(--lime)' }} />
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lime-dark)' }}>{text}</span>
    </div>
  );

  const sectionH2 = (text, mb = 48) => (
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text)', marginBottom: mb }}>{text}</h2>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--dark)', color: 'var(--text)', fontFamily: 'var(--font-body)', position: 'relative', overflowX: 'hidden' }}>
      <div className="page-bg" />
      <div className="page-grid" />

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(10,10,15,0.88)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
          padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {logo(32)}
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--text)' }}>LoanSense</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Features', 'How it works', 'For officers', 'About'].map(item => (
            <motion.a key={item} href="#"
              whileHover={{ color: 'var(--text)', backgroundColor: 'var(--glass)', border: '1px solid var(--glass-border)' }}
              style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, border: '1px solid transparent', display: 'inline-block', cursor: 'pointer' }}>
              {item}
            </motion.a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button whileHover={{ y: -1, backgroundColor: 'rgba(255,255,255,0.07)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>
            Sign in
          </motion.button>
          <motion.button whileHover={{ y: -1, boxShadow: '0 4px 20px rgba(200,241,53,0.3)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--dark)', background: 'var(--lime)', border: 'none', borderRadius: 10, padding: '9px 20px', cursor: 'pointer' }}>
            Apply now
          </motion.button>
        </div>
      </motion.nav>

      {/* HERO */}
      <section style={{ padding: '100px 64px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 60, alignItems: 'center' }}>

          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--glass)', border: '1px solid var(--glass-border)',
              borderRadius: 40, padding: '4px 16px 4px 4px', marginBottom: 28,
            }}>
              <span style={{ background: 'var(--lime)', color: 'var(--dark)', fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, borderRadius: 40, padding: '3px 11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ML-POWERED</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>Decisions in under 2 seconds</span>
            </motion.div>

            <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 62, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24 }}>
              <span style={{ display: 'block', color: 'var(--text)' }}>Loans decided.</span>
              <span style={{ display: 'block', fontStyle: 'italic', color: 'transparent', WebkitTextStroke: '1.5px var(--lime)' }}>Reasons</span>
              <span style={{ display: 'block', color: 'var(--text)' }}>included.</span>
            </motion.h1>

            <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: 460, marginBottom: 36 }}>
              Apply in minutes, get an AI-powered decision instantly — with a full breakdown of exactly why. Built for speed, transparency, and fairness.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
              <motion.button whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(200,241,53,0.35)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')} style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--dark)', background: 'var(--lime)', border: 'none', borderRadius: 10, padding: '13px 32px', cursor: 'pointer' }}>
                Start Application
              </motion.button>
              <motion.button whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.07)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')} style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '13px 32px', cursor: 'pointer' }}>
                View Portal
              </motion.button>
            </motion.div>

            <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 420 }}>
              {[{ val: '94%', label: 'Accuracy' }, { val: '<2s', label: 'Latency' }, { val: '4×', label: 'Faster' }].map(s => (
                <div key={s.label} style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 16, textAlign: 'center', backdropFilter: 'blur(16px)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.val}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* SHAP card */}
          <motion.div animate={float} initial="hidden" variants={scaleIn} whileInView="show" viewport={{ once: true }}>
            <div style={{ background: 'rgba(10,10,15,0.7)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 32, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-faint)', marginBottom: 18 }}>
                SHAP DECISION BREAKDOWN
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, borderBottom: '1px solid var(--glass-border)', marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                  Approved <span style={{ color: 'var(--lime)' }}>✓</span>
                </span>
                <span style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: 8, padding: '4px 12px', fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: 'var(--lime)' }}>
                  91% confidence
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {shapBars.map(bar => (
                  <div key={bar.label}>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>{bar.label}</div>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        width: `${shapWidths[bar.idx]}%`,
                        background: bar.positive ? 'linear-gradient(to right, rgba(74,222,128,0.3), var(--lime-dark))' : 'linear-gradient(to right, rgba(248,113,113,0.3), #ef4444)',
                        transition: 'width 0.8s ease-out',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What-if simulator</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--lime)' }}>Live ↗</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'var(--dark2)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', padding: '80px 64px' }}>
        <div style={{ maxWidth: 1260, margin: '0 auto' }}>
          {sectionTag('Architecture Features')}
          {sectionH2('Everything a modern loan system needs', 48)}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--glass-border)', borderRadius: 12, overflow: 'hidden' }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ backgroundColor: 'var(--dark3)', scale: 1.01, zIndex: 2 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                viewport={{ once: true, margin: '-60px' }}
                style={{
                  background: 'var(--dark2)',
                  padding: 32,
                  borderRight: i % 3 === 2 ? 'none' : '1px solid var(--glass-border)',
                  borderBottom: i >= 3 ? 'none' : '1px solid var(--glass-border)',
                  cursor: 'default',
                }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon} />
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
                <span style={{ display: 'inline-block', marginTop: 16, background: 'rgba(200,241,53,0.06)', border: '1px solid rgba(200,241,53,0.15)', borderRadius: 6, padding: '3px 10px', fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--lime)' }}>
                  Core Feature
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: 'var(--dark2)', padding: '80px 64px' }}>
        <div style={{ maxWidth: 1260, margin: '0 auto' }}>
          {sectionTag('How it works')}
          {sectionH2('Four steps. Zero confusion.', 40)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { num: '01', title: 'Fill your profile', desc: 'Submit financial indicators for initial matrix evaluation.' },
              { num: '02', title: 'Get an instant prediction', desc: 'XGBoost model outputs a real-time risk profile and decision.' },
              { num: '03', title: 'Officer reviews', desc: 'An accredited officer receives your case for final sign-off.' },
              { num: '04', title: 'Receive your decision', desc: 'An immutable PDF letter is generated with full transparency.' }
            ].map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, borderColor: 'rgba(200,241,53,0.2)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                viewport={{ once: true, margin: '-50px' }}
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 36, position: 'relative', overflow: 'hidden', backdropFilter: 'blur(16px)', cursor: 'default' }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 800, color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none' }}>{step.num}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8, position: 'relative', zIndex: 1 }}>{step.title}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 300, color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO PORTALS */}
      <section style={{ padding: '80px 64px', maxWidth: 1260, margin: '0 auto' }}>
        {sectionTag('Two Portals')}
        {sectionH2('Built for both sides of the table', 32)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            style={{ background: '#ffffff', borderRadius: 24, padding: 48, border: '1px solid #E4E4E4' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#111', marginBottom: 12 }}>For Applicants</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#666', fontWeight: 300, lineHeight: 1.7, marginBottom: 28 }}>
              Skip the branch visit. Prove your creditworthiness based on data, not bias.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['No credit score impact on prediction', 'Live what-if scenario testing', 'Transparent logic for all decisions'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lime-dark)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#444', fontWeight: 500 }}>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            style={{ background: 'var(--dark2)', borderRadius: 24, padding: 48, border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'var(--lime)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.08, pointerEvents: 'none' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--lime)', marginBottom: 12, position: 'relative' }}>For Officers</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: 28, position: 'relative' }}>
              Supercharge your underwriting. Spend time on relationships, not calculation.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
              {['FIFO priority review queue', 'Model confidence bounds visible', 'Override capability with audit logging'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ margin: '0 64px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ background: 'var(--dark2)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: '72px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', maxWidth: 1260, margin: '0 auto' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'var(--lime)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.04, pointerEvents: 'none' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, color: 'var(--text)', marginBottom: 16, position: 'relative' }}>Ready to deploy?</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px', position: 'relative' }}>
            Join the future of algorithmic credit evaluation. Register safely and securely.
          </p>
          <motion.button
            whileHover={{ y: -2, boxShadow: '0 6px 30px var(--lime-glow)' }}
            onClick={() => navigate('/register')}
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, color: 'var(--dark)', background: 'var(--lime)', border: 'none', borderRadius: 10, padding: '14px 40px', cursor: 'pointer', position: 'relative' }}>
            Create your account
          </motion.button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '28px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {logo(20)}
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-muted)' }}>LoanSense</span>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)' }}>© {new Date().getFullYear()} LoanSense Corporation. All rights reserved.</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)' }}>System v1.2</span>
      </footer>
    </div>
  );
}
