import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ArrowRight, Loader2, TrendingUp, Clock,
  CheckCircle2, XCircle, FileText, Zap, ChevronRight,
} from 'lucide-react';

/* ─── helpers ─── */
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function PredictionPill({ prediction }) {
  if (prediction === 'Y') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} /> Favorable
    </span>
  );
  if (prediction === 'N') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0 }} /> High Risk
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-faint)', flexShrink: 0 }} /> Pending AI
    </span>
  );
}

function StatCard({ icon, label, value, accent, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${accent}12`, border: `1px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: 4 }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
        </div>
      </div>
    </motion.div>
  );
}

function AppCard({ app, idx, onClick }) {
  const isApproved = app.ml_prediction === 'Y';
  const isRejected = app.ml_prediction === 'N';
  const borderColor = isApproved ? 'rgba(74,222,128,0.15)' : isRejected ? 'rgba(248,113,113,0.12)' : 'var(--glass-border)';
  const confidence = app.ml_confidence ? Math.round(app.ml_confidence * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * idx, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      style={{ cursor: 'pointer' }}>
      <div className="glass-card" style={{ border: `1px solid ${borderColor}`, padding: 0, overflow: 'hidden', position: 'relative' }}>

        {/* Top accent bar */}
        <div style={{ height: 3, background: isApproved ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--glass-border)' }} />

        <div style={{ padding: '20px 22px' }}>
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 4 }}>
                Application LS-{String(app.id).padStart(4, '0')}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                {fmt(app.loan_amount)}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-faint)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={10} /> {fmtDate(app.submitted_at)}&ensp;·&ensp;{app.purpose || 'Personal'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <PredictionPill prediction={app.ml_prediction} />
              <Badge status={app.status}>
                {(app.status || 'pending').replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* Confidence bar */}
          {confidence !== null && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-faint)' }}>AI Confidence</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: isApproved ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--text-faint)' }}>{confidence}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${confidence}%`, background: isApproved ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--text-faint)', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          )}

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { l: 'Term', v: `${app.loan_amount_term || 360} days` },
                { l: 'Credit', v: app.credit_score || '—' },
                { l: 'Area', v: app.property_area || '—' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{v}</div>
                </div>
              ))}
            </div>
            <motion.div whileHover={{ x: 3 }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: 'var(--lime-dark)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              View Details <ChevronRight size={12} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ApplicantDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get('/applications/');
        setApplications(res.data);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  /* Compute stats */
  const total     = applications.length;
  const approved  = applications.filter(a => a.ml_prediction === 'Y').length;
  const rejected  = applications.filter(a => a.ml_prediction === 'N').length;
  const pending   = applications.filter(a => !a.ml_prediction).length;
  const totalAmt  = applications.reduce((s, a) => s + (a.loan_amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.8px', lineHeight: 1 }}>
            My Applications
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 8, fontWeight: 300, lineHeight: 1.6 }}>
            AI-powered decisions at your fingertips — track every loan request live.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => navigate('/applicant/apply')} variant="primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px' }}>
            <Plus size={16} /> New Application
          </Button>
        </motion.div>
      </motion.div>

      {/* ── KPI cards ── */}
      {!loading && total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <StatCard icon={<FileText size={20} />}   label="Total Applications"  value={total}       accent="#818CF8" delay={0}    />
          <StatCard icon={<CheckCircle2 size={20} />} label="Favorable (AI)"    value={approved}    accent="var(--success)" delay={0.06} />
          <StatCard icon={<XCircle size={20} />}    label="High Risk (AI)"      value={rejected}    accent="var(--danger)"  delay={0.12} />
          <StatCard icon={<TrendingUp size={20} />} label="Total Requested"     value={totalAmt > 0 ? `₹${(totalAmt/100000).toFixed(1)}L` : '—'} accent="var(--lime-dark)" delay={0.18} />
        </div>
      )}

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 80 }}>
            <Loader2 size={30} style={{ animation: 'spin 1s linear infinite', color: 'var(--lime)' }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)' }}>
              Loading your applications
            </span>
          </motion.div>

        ) : total === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* Background glow */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 280, height: 280, background: 'var(--lime)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.04, pointerEvents: 'none' }} />
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: 'var(--lime)' }}>
                <Zap size={32} />
              </motion.div>
              <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.5px' }}>
                No Applications Yet
              </motion.h3>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.7, marginBottom: 32, fontWeight: 300 }}>
                Submit your first loan request and get an instant XGBoost-powered decision with SHAP explainability in seconds.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Button onClick={() => navigate('/applicant/apply')} variant="primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', fontSize: 14 }}>
                  <Plus size={17} /> Start Your First Application
                </Button>
              </motion.div>

              {/* Feature strips */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['⚡ AI Decision in Seconds', '📊 SHAP Explainability', '🔄 What-If Simulator'].map(f => (
                  <span key={f} style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', padding: '5px 12px', borderRadius: 99, border: '1px solid var(--glass-border)', letterSpacing: '0.03em' }}>{f}</span>
                ))}
              </motion.div>
            </div>
          </motion.div>

        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
              {applications.map((app, idx) => (
                <AppCard
                  key={app.id}
                  app={app}
                  idx={idx}
                  onClick={() => navigate('/applicant/result', { state: { application: app } })}
                />
              ))}
            </div>

            {/* Footer summary strip */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ marginTop: 24, padding: '14px 20px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)', fontWeight: 300 }}>
                Showing <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{total}</strong> application{total !== 1 ? 's' : ''} · {pending > 0 ? `${pending} awaiting officer review` : 'All decisions complete'}
              </span>
              <Button onClick={() => navigate('/applicant/apply')} variant="ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '6px 14px' }}>
                <Plus size={12} /> New Application
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
