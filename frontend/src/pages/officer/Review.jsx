import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle, FileText, History,
  Activity, AlertCircle, Calculator, ShieldCheck, Cpu, Banknote,
  TrendingUp, AlertTriangle, User, Clock
} from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShapChart } from '../../components/ui/ShapChart';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const SHAP_LABELS = {
  monthly_income: 'Income Amount', monthly_expenses: 'Living Expenses',
  loan_amount: 'Loan Size', loan_tenure_months: 'Repayment Tenure',
  credit_score: 'Credit Score', existing_loans_count: 'Existing Loans',
  total_existing_emi: 'Active EMI Load', employment_type: 'Work Profile',
  employment_years: 'Job Stability', late_payment_history: 'Missed Payments',
  new_emi: 'New Requested EMI', debt_to_income: 'DTI Ratio',
  disposable_income: 'Free Cash Flow',
};

// ── DataField — uniform metric tile ─────────────────────────────────────────

function DataField({ label, value, color, mono = true }) {
  return (
    <div style={{
      backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)',
      borderRadius: 14, padding: '14px 18px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: mono ? 'monospace' : 'inherit', fontWeight: 700, fontSize: 16, color: color || 'var(--text)', lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  );
}

// ── Metric stat card for derived calcs ──────────────────────────────────────

function MetricCard({ icon, label, value, color, accentColor, sub }) {
  return (
    <div style={{
      backgroundColor: 'white', border: `1.5px solid ${accentColor || 'var(--glass-border)'}`,
      borderRadius: 16, padding: '18px 20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: accentColor || 'var(--glass-border)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
        <div style={{ color: accentColor || 'var(--text-muted)', opacity: 0.7 }}>{icon}</div>
      </div>
      <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 26, color: color || 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function OfficerReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const navApp = location.state?.application;

  const [application, setApplication] = useState(navApp);
  const [loadingApp, setLoadingApp] = useState(!navApp);
  const [audits, setAudits] = useState([]);
  const [decision, setDecision] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navApp && id) {
      apiClient.get(`/applications/${id}`)
        .then(r => setApplication(r.data))
        .catch(e => console.error(e))
        .finally(() => setLoadingApp(false));
    }
    if (navApp || id) {
      const appId = navApp?.id || id;
      apiClient.get(`/applications/${appId}/audit`)
        .then(r => setAudits(r.data))
        .catch(console.error);
    }
  }, [navApp, id]);

  const handleDecision = async () => {
    if (!decision) return;
    if (decision !== application.ml_prediction && !overrideReason.trim()) {
      setError('An override reason MUST be provided when diverging from the ML recommendation.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(`/officer/decide/${application.id}`, {
        decision, override_reason: overrideReason,
      });
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit final decision.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loadingApp) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
          style={{ width: 48, height: 48, borderRadius: '50%', border: '2.5px solid var(--lime)', borderTopColor: 'transparent' }} />
        <span style={{ color: 'var(--lime-dark)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Loading application…</span>
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 14, textAlign: 'center' }}>
        <AlertTriangle size={36} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>No application selected for review.</p>
        <Button onClick={() => navigate('/officer/dashboard')} variant="secondary">Back to Queue</Button>
      </div>
    );
  }

  // Parse shap/form data
  let parsedShap = {}, formData = {};
  try {
    const raw = typeof application.shap_values === 'string' ? JSON.parse(application.shap_values) : (application.shap_values || {});
    parsedShap = raw?.shap || {};
    formData = raw?.form_data || {};
  } catch (e) {}

  const isFavorable = application.ml_prediction === 'Y';
  const needsOverride = decision && decision !== application.ml_prediction;
  const conf = (application.ml_confidence || 0) * 100;

  // Derived metrics
  const newEmi = (formData.loan_amount && formData.loan_tenure_months)
    ? formData.loan_amount / formData.loan_tenure_months : (application.loan_amount / Math.max(application.loan_amount_term, 1));
  const dti = (formData.monthly_income || application.applicant_income)
    ? ((formData.total_existing_emi || 0) + newEmi) / (formData.monthly_income || application.applicant_income) : 0;
  const disposable = (formData.monthly_income || application.applicant_income || 0)
    - (formData.monthly_expenses || 0)
    - (formData.total_existing_emi || 0) - newEmi;

  const shapArray = Object.entries(parsedShap)
    .map(([k, v]) => ({
      feature: SHAP_LABELS[k] || k.replace(/_/g, ' '),
      value: Number(v), abs: Math.abs(Number(v)),
      feature_value: formData[k] ?? 'N/A',
    }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 10);

  const applicantName = formData.applicant_name || application.applicant_name || `APP-${application.id}`;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 18, borderBottom: '1px solid var(--glass-border)', paddingBottom: 24 }}
      >
        <button
          onClick={() => navigate('/officer/dashboard')}
          style={{
            width: 44, height: 44, borderRadius: 12, backgroundColor: '#f1f5f9', flexShrink: 0,
            border: '1px solid var(--glass-border)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(200,241,53,0.12)'; e.currentTarget.style.color = 'var(--lime-dark)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = 'var(--text)'; }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Manual Audit Panel
          </h1>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--lime-dark)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Application #{String(application.id).padStart(4, '0')} · {applicantName}
          </p>
        </div>
        <Badge variant={isFavorable ? 'success' : 'danger'} icon={<Cpu size={12} />}>
          ML: {isFavorable ? 'Approve' : 'Reject'}
        </Badge>
      </motion.div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Applicant Data */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card title="Applicant Profile" icon={<User size={18} />}>
              {Object.keys(formData).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, paddingTop: 8 }}>
                  <DataField label="Monthly Income"  value={formatINR(formData.monthly_income)} />
                  <DataField label="Monthly Expenses" value={formatINR(formData.monthly_expenses)} />
                  <DataField label="Credit Score"
                    value={formData.credit_score}
                    color={formData.credit_score >= 700 ? 'var(--success-dark)' : '#dc2626'}
                  />
                  <DataField label="Loan Amount"
                    value={<>{formatINR(formData.loan_amount)} <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>/ {formData.loan_tenure_months}m</span></>}
                  />
                  <DataField
                    label="Employment"
                    value={<>{<span style={{ textTransform: 'capitalize' }}>{formData.employment_type}</span>} <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>· {formData.employment_years}y exp</span></>}
                    mono={false}
                  />
                  <DataField label="Active Debt (EMI)" value={formatINR(formData.total_existing_emi)} />
                  <DataField
                    label="Purpose"
                    value={<>{formData.loan_purpose} <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>({formData.property_type})</span></>}
                    mono={false}
                  />
                  <DataField
                    label="Late Payments"
                    value={`${formData.late_payment_history} incident${formData.late_payment_history !== 1 ? 's' : ''}`}
                    color={formData.late_payment_history > 0 ? '#dc2626' : 'var(--success-dark)'}
                    mono={false}
                  />
                  <DataField label="Existing Loans" value={formData.existing_loans_count ?? '—'} />
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>Incomplete structured data payload.</p>
              )}
            </Card>
          </motion.div>

          {/* Derived Metrics */}
          {Object.keys(formData).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <MetricCard
                  icon={<Calculator size={18} />}
                  label="Projected EMI"
                  value={formatINR(Math.round(newEmi))}
                  accentColor="var(--lime-dark)"
                  color="var(--lime-dark)"
                />
                <MetricCard
                  icon={<Activity size={18} />}
                  label="DTI Ratio"
                  value={`${(dti * 100).toFixed(1)}%`}
                  accentColor={dti > 0.6 ? '#ef4444' : '#22c55e'}
                  color={dti > 0.6 ? '#ef4444' : 'var(--text)'}
                  sub={dti > 0.6 ? 'Above safe threshold' : 'Within safe range'}
                />
                <MetricCard
                  icon={<AlertCircle size={18} />}
                  label="Free Cash Flow"
                  value={formatINR(Math.round(disposable))}
                  accentColor={disposable < 0 ? '#ef4444' : '#22c55e'}
                  color={disposable < 0 ? '#ef4444' : 'var(--text)'}
                  sub={disposable < 0 ? 'Negative — high risk' : 'Positive buffer'}
                />
              </div>
            </motion.div>
          )}

          {/* SHAP Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card title="Algorithm Explainability Context" icon={<Activity size={18} />}>
              <ShapChart data={shapArray} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14 }}>
                SHAP waterfall — features pushing right favor approval, left increase risk
              </p>
            </Card>
          </motion.div>

          {/* Audit Trail */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card title="Audit Trajectory" icon={<History size={18} />}>
              {audits.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 12, position: 'relative' }}>
                  {/* Vertical line */}
                  <div style={{ position: 'absolute', left: 22, top: 12, bottom: 12, width: 2, backgroundColor: 'var(--glass-border)' }} />
                  {audits.map((audit, i) => (
                    <div key={audit.id} style={{ display: 'flex', gap: 18, paddingBottom: i < audits.length - 1 ? 20 : 0, position: 'relative' }}>
                      {/* Dot */}
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                        backgroundColor: 'white', border: '2px solid var(--lime-dark)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 2,
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--lime-dark)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                          {audit.action?.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: audit.detail ? 8 : 0 }}>
                          <Clock size={11} /> {new Date(audit.created_at).toLocaleString()}
                        </div>
                        {audit.detail && (
                          <div style={{
                            fontSize: 12, color: 'var(--text)', backgroundColor: '#f8fafc',
                            border: '1px solid var(--glass-border)', borderRadius: 10,
                            padding: '10px 14px', lineHeight: 1.6, wordBreak: 'break-word',
                          }}>
                            {audit.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>No historical footprint registered.</p>
              )}
            </Card>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN (sticky) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 24 }}>

          {/* ML Verdict Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            style={{
              backgroundColor: isFavorable ? 'rgba(34,197,94,0.03)' : 'rgba(239,68,68,0.03)',
              border: `2px solid ${isFavorable ? 'var(--success)' : '#ef4444'}`,
              borderRadius: 24, padding: '28px 24px',
              position: 'relative', overflow: 'hidden', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: isFavorable ? 'var(--success)' : '#ef4444' }} />

            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Algorithm Directive</div>

            <motion.div
              initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 14, delay: 0.3 }}
            >
              {isFavorable
                ? <CheckCircle2 size={64} style={{ color: 'var(--success)', filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.4))' }} />
                : <XCircle size={64} style={{ color: '#ef4444', filter: 'drop-shadow(0 0 12px rgba(239,68,68,0.4))' }} />
              }
            </motion.div>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900,
              color: isFavorable ? 'var(--success)' : '#ef4444',
              margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              {isFavorable ? 'Approve' : 'Reject'}
            </h2>

            {/* Confidence bar */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confidence</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, color: conf > 80 ? 'var(--success-dark)' : '#d97706' }}>{conf.toFixed(1)}%</span>
              </div>
              <div style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${conf}%`, backgroundColor: conf > 70 ? 'var(--success)' : '#f59e0b', borderRadius: 99, transition: 'width 1s ease' }} />
              </div>
            </div>

            {/* Risk band */}
            <div style={{ width: '100%', backgroundColor: 'white', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Risk Band</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{application.ml_risk_band?.replace('_', ' ').toUpperCase() || '—'}</span>
            </div>
          </motion.div>

          {/* Decision Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            style={{ backgroundColor: 'white', border: '1px solid var(--glass-border)', borderRadius: 24, padding: '24px 22px', boxShadow: 'var(--shadow-sm)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <ShieldCheck size={18} style={{ color: 'var(--lime-dark)' }} />
              <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', margin: 0 }}>Final Adjudication</h3>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginBottom: 16 }}
                >
                  <div style={{ padding: '12px 14px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#dc2626', fontSize: 13, lineHeight: 1.5 }}>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Approve / Reject buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { val: 'Y', label: 'Approve', Icon: CheckCircle2, active: 'var(--success)', activeText: '#000' },
                { val: 'N', label: 'Reject', Icon: XCircle, active: '#ef4444', activeText: '#fff' },
              ].map(({ val, label, Icon, active, activeText }) => (
                <button
                  key={val}
                  onClick={() => setDecision(val)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 8, padding: '16px 12px', borderRadius: 14, cursor: 'pointer',
                    border: `2px solid ${decision === val ? active : 'var(--glass-border)'}`,
                    backgroundColor: decision === val ? active : '#f8fafc',
                    color: decision === val ? activeText : 'var(--text)',
                    fontWeight: 700, fontSize: 13,
                    transform: decision === val ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.18s ease',
                    boxShadow: decision === val ? `0 4px 16px ${active}33` : 'none',
                  }}
                >
                  <Icon size={22} />
                  {label}
                </button>
              ))}
            </div>

            {/* Override reason + submit */}
            <AnimatePresence>
              {decision && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Override Justification
                      </label>
                      {needsOverride && (
                        <span style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Required
                        </span>
                      )}
                    </div>
                    <textarea
                      value={overrideReason}
                      onChange={e => setOverrideReason(e.target.value)}
                      rows={4}
                      placeholder={
                        needsOverride
                          ? 'Explain your reasoning for overriding the ML recommendation…'
                          : 'Optional: Add context or notes to the application record…'
                      }
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '12px 14px', borderRadius: 12, resize: 'vertical',
                        border: `1.5px solid ${needsOverride && !overrideReason ? '#ef4444' : 'var(--glass-border)'}`,
                        backgroundColor: '#f8fafc', fontSize: 13, color: 'var(--text)',
                        fontFamily: 'inherit', lineHeight: 1.6, outline: 'none',
                        marginBottom: 14, display: 'block',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--lime-dark)'}
                      onBlur={e => e.target.style.borderColor = needsOverride && !overrideReason ? '#ef4444' : 'var(--glass-border)'}
                    />
                    <Button
                      variant="primary"
                      loading={submitting}
                      onClick={handleDecision}
                      style={{ width: '100%', height: 46, fontSize: 14, fontWeight: 700 }}
                    >
                      Finalize Authorization
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nudge if no decision yet */}
            {!decision && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, lineHeight: 1.5 }}>
                Select Approve or Reject above to proceed
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
