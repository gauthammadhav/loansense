import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { Button } from '../../components/ui/Button';
import ShapChart from '../../components/ui/ShapChart';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function OfficerReview() {
  const location    = useLocation();
  const navigate    = useNavigate();
  const application = location.state?.application;

  const [audits, setAudits]               = useState([]);
  const [decision, setDecision]           = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');

  useEffect(() => {
    if (application) fetchAudits(application.id);
  }, [application]);

  const fetchAudits = async (id) => {
    try {
      const res = await apiClient.get(`/applications/${id}/audit`);
      setAudits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecision = async () => {
    if (!decision) return;
    if (decision !== application.ml_prediction && !overrideReason.trim()) {
      setError('An override reason must be provided when your decision differs from the ML prediction.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(`/officer/decide/${application.id}`, { decision, override_reason: overrideReason });
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit decision.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!application) {
    return (
      <div style={{ padding: 60, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>No application selected for review.</p>
        <Button variant="secondary" onClick={() => navigate('/officer/dashboard')}>Return to Queue</Button>
      </div>
    );
  }

  let parsedShap = {};
  if (typeof application.shap_values === 'string') {
    try { parsedShap = JSON.parse(application.shap_values); } catch (e) {}
  } else if (application.shap_values) {
    parsedShap = application.shap_values;
  }

  const isFavorable = application.ml_prediction === 'Y';
  const needsOverride = decision && decision !== application.ml_prediction;

  const fieldLabel = { fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', marginBottom: 3 };
  const fieldVal   = { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--text)' };

  const profileFields = [
    { l: 'Gender & Marital', v: `${application.gender || 'N/A'}, ${application.married ? 'Married' : 'Single'}` },
    { l: 'Education', v: application.education },
    { l: 'Employment', v: application.self_employed ? 'Self Employed' : 'Salaried' },
    { l: 'Applicant Income', v: `₹${application.applicant_income?.toLocaleString()}` },
    { l: 'Co-Applicant Income', v: `₹${application.coapplicant_income?.toLocaleString()}` },
    { l: 'Credit Score', v: application.credit_score },
    { l: 'Loan Request', v: `₹${application.loan_amount?.toLocaleString()} / ${application.loan_amount_term}d` },
    { l: 'Purpose', v: application.purpose },
    { l: 'Property', v: `${application.property_type} (${application.property_area})` },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/officer/dashboard')}
          style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
          <ArrowLeft size={16} />
        </motion.button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            Review Application LS-{application.id?.toString().padStart(4, '0')}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
            Submitted {new Date(application.submitted_at).toLocaleString()}
          </p>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* LEFT: Profile + Audit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Applicant profile */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card">
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
                Applicant Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {profileFields.map(({ l, v }) => (
                  <div key={l}>
                    <div style={fieldLabel}>{l}</div>
                    <div style={fieldVal}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* SHAP chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="glass-card">
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
                Feature Impact (SHAP Analysis)
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 12 }}>
                <ShapChart shapValues={parsedShap} />
              </div>
            </div>
          </motion.div>

          {/* Audit timeline */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass-card">
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid var(--glass-border)' }}>
                Audit Timeline
              </div>
              {audits.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)' }}>No audit events yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {audits.map((audit, i) => (
                    <div key={audit.id} style={{ display: 'flex', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lime)', border: '2px solid var(--dark)', flexShrink: 0, marginTop: 3 }} />
                        {i < audits.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--glass-border)', margin: '4px 0' }} />}
                      </div>
                      <div style={{ paddingBottom: 16 }}>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          {audit.action?.replace(/_/g, ' ')}
                        </p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-faint)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={10} />{new Date(audit.created_at).toLocaleString()}
                        </p>
                        {audit.detail && (
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '6px 10px', marginTop: 6 }}>
                            {audit.detail?.substring(0, 100)}{audit.detail?.length > 100 && '...'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT: ML rec + Decision */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

          {/* ML Recommendation */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }}>
            <div className="glass-card" style={{ border: `1px solid ${isFavorable ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}` }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 8 }}>
                ML Recommendation
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: isFavorable ? 'var(--success)' : 'var(--danger)', lineHeight: 1 }}>
                {isFavorable ? 'Approve' : 'Reject'}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                Confidence: <strong style={{ color: 'var(--text)' }}>{(application.ml_confidence * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </motion.div>

          {/* Final Decision */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18 }}>
            <div className="glass-card">
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 14 }}>
                Final Decision
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[
                  { val: 'Y', label: 'Approve', icon: <CheckCircle size={14} />, color: 'var(--success)', bg: 'rgba(74,222,128,0.08)' },
                  { val: 'N', label: 'Reject',  icon: <XCircle size={14} />,    color: 'var(--danger)',  bg: 'rgba(248,113,113,0.08)' },
                ].map(opt => (
                  <motion.button key={opt.val}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDecision(opt.val)}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '10px 0',
                      border: `1px solid ${decision === opt.val ? opt.color : 'var(--glass-border)'}`,
                      borderRadius: 10,
                      background: decision === opt.val ? opt.bg : 'transparent',
                      color: decision === opt.val ? opt.color : 'var(--text-muted)',
                      fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    {opt.icon} {opt.label}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {decision && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: needsOverride ? 'var(--danger)' : 'var(--text-faint)', display: 'block', marginBottom: 6 }}>
                        {needsOverride ? 'Override Reason *' : 'Review Notes (optional)'}
                      </label>
                      <textarea
                        value={overrideReason}
                        onChange={e => setOverrideReason(e.target.value)}
                        placeholder={needsOverride ? 'Required: explain override...' : 'Optional internal notes...'}
                        style={{
                          width: '100%', height: 80, boxSizing: 'border-box',
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${needsOverride ? 'rgba(248,113,113,0.3)' : 'var(--glass-border)'}`,
                          borderRadius: 10,
                          padding: '10px 12px',
                          fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)',
                          outline: 'none', resize: 'none',
                        }}
                      />
                    </div>

                    {error && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--danger)' }}>{error}</p>
                    )}

                    <Button variant="primary" disabled={submitting || !decision} onClick={handleDecision} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {submitting ? 'Submitting...' : 'Confirm Decision'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
